import {
  DialogContent,
  Grid,
  Autocomplete,
  Chip,
  Checkbox,
  FormControl,
} from "@mui/material";
import { Formik } from "formik";

import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import MDInput from "components/MDInput";
import moment from "moment-timezone";
import { useMaterialUIController } from "context";
import { useState } from "react";
import { useDispatch } from "react-redux";
import CircularIndeterminate from "components/MDLoading";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { specialEventRates } from "store/slice/rates/rateSlice";
import { DateRangePicker } from "rsuite";
import { getAssignRatesTableDataByPlaceId } from "store/slice/rates/rateSlice";
import { getCalenderDataByPlaceId } from "store/slice/rates/rateSlice";

const SpecialEventsRates = (props) => {
  const { dialogOpen, onClose, placeId, ratesData, occupancy } = props;
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

  const handleSpecialEventRates = (rateData) => {
    setIsLoading(true);
    dispatch(specialEventRates(rateData))
      .unwrap()
      .then(async (res) => {
        const success = res?.success;
        setIsLoading(false);
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        if (success) {
          await dispatch(getAssignRatesTableDataByPlaceId(placeId));
          await dispatch(getCalenderDataByPlaceId(placeId));
          onClose();
        }
      })
      .catch((err) => {
        console.error("Error assigning rate:", err);
        setIsLoading(false);
        setNotification({
          ...notification,
          color: "error",
          title: "Error",
          content: err?.message,
          icon: "warning",
          show: true,
        });
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
        text={"Please wait..."}
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
        dialogTitle="Special Events"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
        sx={{ marginTop: -13 }}
      >
        <DialogContent>
          <Formik
            initialValues={{
              rateIds: [],
              rateArray: [],
              startDate: "",
              endDate: "",
              isExtensionRate: false,
              isHideFromSuggestions: false,
              occupancy: occupancy
            }}
            // validationSchema={createRateValidation}
            onSubmit={(value, action) => {
              const payload = {
                placeId,
                rateIds: value?.rateIds,
                startDate: moment(value?.startDate).format(),
                endDate: moment(value?.endDate).format(),
                isExtensionRate: value?.isExtensionRate,
                isHideFromSuggestions: value?.isHideFromSuggestions,
                isSpecialEvent: true,
                occupancy: value?.occupancy
              };
              handleSpecialEventRates(payload);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12} md={12} lg={12}>
                    <Autocomplete
                      multiple
                      disableClearable
                      name="rateId"
                      value={props.values?.rateArray} // Assuming rateType holds an array of selected rates
                      options={ratesData}
                      onChange={(event, newValues) => {
                        props.setValues({
                          ...props?.values,
                          rateIds: newValues?.map(({ _id }) => _id),
                          rateArray: newValues,
                        });
                      }}
                      onBlur={props.handleBlur}
                      getOptionLabel={(option) => option?.displayName} // Display the label (rate name)
                      renderInput={(params) => (
                        <MDInput label="Rate" fullWidth={true} {...params} />
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
                  <Grid item xs={12} md={12} lg={12}>
                    <FormControl fullWidth>
                      <DateRangePicker
                        id="timeDuration"
                        placeholder="Start Date - End Date"
                        character=" - "
                        size="lg"
                        format="dd-MM-yyyy hh:mm a"
                        showMeridian
                        value={
                          props.values.startDate && props.values.endDate
                            ? [
                                new Date(props.values.startDate),
                                new Date(props.values.endDate),
                              ]
                            : undefined
                        }
                        ranges={[]}
                        onChange={(value) => {
                          if (value && value.length === 2) {
                            props.setFieldValue("startDate", value[0]);
                            props.setFieldValue("endDate", value[1]);
                          } else {
                            props.setFieldValue("startDate", null);
                            props.setFieldValue("endDate", null);
                          }
                        }}
                        onBlur={props.handleBlur}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={12} lg={12}>
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
                        }}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                      <MDTypography
                        variant="button"
                        fontWeight="regular"
                        color="text"
                      >
                        &nbsp;&nbsp;Mark as Extension rate&nbsp;
                      </MDTypography>
                    </MDBox>
                  </Grid>
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
                      Submit
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

export default SpecialEventsRates;
