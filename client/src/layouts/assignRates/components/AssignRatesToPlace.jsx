import {
  Autocomplete,
  Chip,
  DialogContent,
  Grid,
  Checkbox,
  FormControl,
} from "@mui/material";
import { DateRangePicker } from "rsuite";
import { Formik } from "formik";
import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import MDInput from "components/MDInput";
import moment from "moment-timezone";
import { useMaterialUIController } from "context";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import CircularIndeterminate from "components/MDLoading";
import { assignRates } from "store/slice/rates/rateSlice";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { getAssignRatesByPlaceId } from "store/slice/rates/rateSlice";
import { getCalenderDataByPlaceId } from "store/slice/rates/rateSlice";
import { getAssignRatesTableDataByPlaceId } from "store/slice/rates/rateSlice";

const AssignRatesToPlace = (props) => {
  const formikRef = useRef(null);
  const { dialogOpen, onClose, placeId, ratesData, occupancy } = props;
  const [filteredRatesData, setFilteredRatesData] = useState(props.ratesData);
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handleAssignRates = async (rateData) => {
    try {
      setIsLoading(true);
      const res = await dispatch(assignRates(rateData)).unwrap();
      const success = res?.success;
      setNotification({
        ...notification,
        color: success ? "success" : "error",
        title: success ? "Success" : "Error",
        content: res?.message || "An unexpected error occurred.",
        icon: success ? "check" : "warning",
        show: true,
      });
      if (success) {
        await dispatch(getAssignRatesByPlaceId(placeId));
        await dispatch(getCalenderDataByPlaceId(placeId));
        await dispatch(getAssignRatesTableDataByPlaceId(placeId));

        onClose();
      }
    } catch (err) {
      console.error("Error assigning rate:", err);
      setNotification({
        ...notification,
        color: "error",
        title: "Error",
        content: err?.message || "An error occurred while assigning rates.",
        icon: "warning",
        show: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "All",
  ];

  const handleRateChange = (event, newValues) => {
    if (newValues.length > 0) {
      const selectedRateType = newValues[0].rateType;
      const filteredOptions = ratesData.filter((rate) => {
        if (selectedRateType === "hourly") {
          return rate.rateType !== "daily";
        } else if (selectedRateType === "daily") {
          return rate.rateType !== "hourly";
        }
        return true;
      });

      // setFilteredRatesData(filteredOptions);
      setFilteredRatesData(ratesData);
    } else {
      setFilteredRatesData(ratesData);
    }
    formikRef?.current?.setValues({
      ...formikRef?.current?.values,
      rateIds: newValues.map(({ _id }) => _id),
      rateArray: newValues,
    });
  };

  const occupancyOption = Array.from({ length: occupancy }, (_, index) => index + 1).map((option) => ({
    value: option,
    label: `${option} (${Math.round((option / occupancy) * 100)}%)`,
  }));
  
  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text={"Please wait..!"}
        open={isLoading}
      />
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />
      <MDDialog
        dialogTitle="Assign Rates"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            innerRef={formikRef}
            initialValues={{
              placeId: null,
              rateIds: [],
              startTime: new Date(new Date().setHours(0, 0, 0)),
              endTime: new Date(new Date().setHours(23, 59, 59)),
              days: [],
              placeObj: null,
              rateArray: [],
              isExtensionRate: false,
              extendedFor: "",
              isExtensionBasedRate: false,
              isHideFromSuggestions: false,
              minEndTime: "",
              occupancy: occupancy,
            }}
            onSubmit={(value, action) => {
              console.log("value ====>", value);
              const payload = {
                placeId,
                rateIds: value?.rateIds,
                startTime: moment(value?.startTime).format("HH:mm"),
                endTime: moment(value?.endTime).format("HH:mm"),
                days: value?.days,
                isExtensionRate: value?.isExtensionRate,
                isExtensionBasedRate: value?.isExtensionBasedRate,
                isHideFromSuggestions: value?.isHideFromSuggestions,
                occupancy: value?.occupancy,
                ...(value?.isExtensionBasedRate && { extendedFor: value?.extendedFor }),
              };
              console.log("payload ====>", payload);
              handleAssignRates(payload);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                {props.values.isExtensionRate &&
                    props.values.isExtensionBasedRate && (
                      <Grid item xs={12}>
                        <Autocomplete
                          options={ratesData ?? []}
                          getOptionLabel={(option) =>
                            `${option.displayName} ${
                              option.title ? `(${option.title})` : ""
                            }`
                          }
                          renderOption={(props, option) => (
                            <li {...props}>
                              <div>{option.displayName}</div>
                            </li>
                          )}
                          name="extendedFor"
                          autoHighlight
                          disableClearable
                          size="small"
                          value={
                            ratesData.find(
                              (option) =>
                                option._id === props.values.extendedFor
                            ) || null
                          }
                          getOptionSelected={(option, value) =>
                            option._id === value._id
                          }
                          onChange={(event, value) => {
                            props.setFieldValue(
                              "extendedFor",
                              value ? value._id : ""
                            );
                          }}
                          renderInput={(params) => (
                            <MDInput
                              label="Extended Rate"
                              fullWidth
                              inputProps={{
                                ...params.inputProps,
                                autoComplete: "new-password",
                              }}
                              value={
                                props.values.extendedFor
                                  ? ratesData.find(
                                      (option) =>
                                        option._id === props.values.extendedFor
                                    )?.title
                                  : ""
                              }
                              {...params}
                            />
                          )}
                        />
                      </Grid>
                    )}
                  <Grid item xs={12} md={12} lg={12}>
                    <Autocomplete
                      multiple
                      disableClearable
                      name="rateId"
                      value={props.values?.rateArray}
                      // options={filteredRatesData}
                      options={ratesData ?? []}
                      onChange={handleRateChange}
                      onBlur={props.handleBlur}
                      getOptionLabel={(option) =>
                        `${option.displayName} ${option.title ? `(${option.title})` : ""
                        }`
                      }
                      renderInput={(params) => (
                        <MDInput
                          label="Rate"
                          fullWidth={true}
                          {...params}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={index}
                            variant="contained"
                            label={option?.displayName}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={12} lg={12}>
                    <Autocomplete
                      disableClearable
                      name="occupancy"
                      value={props.values.occupancy ? occupancyOption.find((option) => option.value === props.values.occupancy) : null}
                      options={Array.from({ length: occupancy }, (_, index) => index + 1).map((option) => ({
                        value: option,
                        label: `${option} (${Math.round((option / occupancy) * 100)}%)`,
                      }))}
                      onChange={(event, newValue) => {
                        props.setFieldValue("occupancy", newValue?.value);
                      }}
                      onBlur={props.handleBlur}
                      renderInput={(params) => (
                        <MDInput label="Occupancy" fullWidth={true} {...params} />
                      )}
                      getOptionLabel={(option) => option.label}
                      renderOption={(props, option) => (
                        <li {...props}>
                          {option.label}
                        </li>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <DateRangePicker
                        id="timeDuration"
                        placeholder="Start Time - End Time"
                        character=" - "
                        size="lg"
                        format="hh:mm a"
                        showMeridian
                        value={
                          props.values.startTime && props.values.endTime
                            ? [
                              new Date(props.values.startTime),
                              new Date(props.values.endTime),
                            ]
                            : [
                              new Date(new Date().setHours(0, 0, 0)), // Set default start time to 12:00 AM
                              new Date(new Date().setHours(23, 59, 59)), // Set default end time to 11:59 PM
                            ]
                        }
                        ranges={[]}
                        onChange={(value) => {
                          if (value && value.length === 2) {
                            if (
                              isNaN(Date.parse(value[0])) ||
                              isNaN(Date.parse(value[1]))
                            ) {
                              props.setFieldValue(
                                "startTime",
                                new Date(new Date().setHours(0, 0, 0))
                              );
                              props.setFieldValue(
                                "endTime",
                                new Date(new Date().setHours(23, 59, 59))
                              );
                            } else {
                              props.setFieldValue("startTime", value[0]);
                              props.setFieldValue("endTime", value[1]);
                            }
                          } else {
                            props.setFieldValue("startTime", null);
                            props.setFieldValue("endTime", null);
                          }
                        }}
                        onBlur={props.handleBlur}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={12} lg={12}>
                    <Autocomplete
                      multiple
                      disableClearable
                      name="days"
                      value={props.values?.days || []}
                      options={Days.filter(
                        (option) => !props.values?.days?.includes(option)
                      )}
                      onChange={(event, newValues) => {
                        props.setValues({
                          ...props?.values,
                          days:
                            newValues.indexOf("All") === -1
                              ? newValues
                              : [
                                "Sunday",
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday",
                              ], // Update rateType to an array of selected IDs
                        });
                      }}
                      onBlur={props.handleBlur}
                      getOptionLabel={(option) => option} // Display the label (rate name)
                      renderInput={(params) => (
                        <MDInput label="Days" fullWidth={true} {...params} />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={index}
                            variant="contained"
                            label={option}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <MDBox display="flex" alignItems="center" ml={-1}>
                      <Checkbox
                        id="isExtensionRate"
                        name="isExtensionRate"
                        checked={props.values.isExtensionRate}
                        onChange={(e) => {
                          props.handleChange(e);

                          props.setFieldValue(
                            "isExtensionRate",
                            e.target.checked
                          );
                          if (!e.target.checked) {
                            props.setFieldValue(
                              "isExtensionBasedRate",
                              e.target.checked
                            );
                            props.setFieldValue("extendedFor", "");
                          }
                        }}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                      <MDTypography
                        variant="button"
                        fontWeight="regular"
                        color="text"
                      >
                        &nbsp;&nbsp;Is this extension rate?&nbsp;
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  {props.values.isExtensionRate && (
                    <Grid item xs={12} md={6}>
                      <MDBox display="flex" alignItems="center" ml={-1}>
                        <Checkbox
                          id="isExtensionBasedRate"
                          name="isExtensionBasedRate"
                          checked={props.values.isExtensionBasedRate}
                          onChange={(e) => {
                            props.handleChange(e);

                            props.setFieldValue(
                              "isExtensionBasedRate",
                              e.target.checked
                            );
                          }}
                          inputProps={{ "aria-label": "controlled" }}
                        />
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                        >
                          &nbsp;&nbsp;Is extension based on rate?&nbsp;
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  )}

                  <Grid item xs={12} md={12} lg={12}>
                    <MDBox display="flex" alignItems="center" ml={-1}>
                      <Checkbox
                        id="isHideFromSuggestions"
                        name="isHideFromSuggestions"
                        checked={props.values.isHideFromSuggestions}
                        onChange={(e) => {
                          props.handleChange(e);

                          props.setFieldValue(
                            "isHideFromSuggestions",
                            e.target.checked
                          );
                        }}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                      <MDTypography
                        variant="button"
                        fontWeight="regular"
                        color="text"
                      >
                        &nbsp;&nbsp;Hide this from suggestion chips.&nbsp;
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} className="text-right">
                    <MDButton
                      color={sidenavColor}
                      variant="contained"
                      type="submit"
                    >
                      Create
                    </MDButton>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </DialogContent>
      </MDDialog>
    </>
  );
};

export default AssignRatesToPlace;
