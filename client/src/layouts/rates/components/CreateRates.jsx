import {
  Autocomplete,
  Chip,
  DialogContent,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import { Formik } from "formik";
import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import MDInput from "components/MDInput";
import Checkbox from "@mui/material/Checkbox";
import { generateNumbers } from "services/service";
import moment from "moment-timezone";
import { useMaterialUIController } from "context";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { createRate } from "store/slice/rates/rateSlice";
import CircularIndeterminate from "components/MDLoading";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import { createRateValidation } from "services/validation";
import MDDropDown from "components/MDDropDown";
import { getRatesByPlaceId } from "store/slice/rates/rateSlice";
import { DateRangePicker } from "rsuite";
// import { generateDisplayNameForRate } from "global/functions";

const CreateRates = (props) => {
  // const formikRef = useRef(null);
  const { dialogOpen, onClose, placeId, ratesData } = props;
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isEndDayTimePickerOpen, setEndDayTimePickerOpen] = useState(false);
  const [isStartDayTimePickerOpen, setStartDayTimePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handleCreateRate = (rateData) => {
    setIsLoading(true);
    dispatch(createRate(rateData))
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
          await dispatch(getRatesByPlaceId(placeId));
          onClose();
        }
      })
      .catch((err) => {
        console.error("Error creating rate:", err);
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

  const startDayOptions = [
    { label: "Same Day" },
    { label: "Next Day" },
    { label: "Day after Tomorrow" }
  ]

  const endDayOptions = {
    Custom: [
      { label: "Sunday" },
      { label: "Monday" },
      { label: "Tuesday" },
      { label: "Wednesday" },
      { label: "Thursday" },
      { label: "Friday" },
      { label: "Saturday" },
      { label: "Next Day" },
      { label: "Same Day" },
      { label: "Day after Tomorrow" },
    ],
    Overnight: [{ label: "Next Day" }, { label: "Same Day" }],
  };

  const hoursOptions = [
    { label: "15 MINUTE" },
    { label: "30 MINUTE" },
    { label: "45 MINUTE" },
    { label: "1 HOUR" },
    { label: "2 HOUR" },
    { label: "3 HOUR" },
    { label: "4 HOUR" },
    { label: "5 HOUR" },
    { label: "6 HOUR" },
    { label: "7 HOUR" },
    { label: "8 HOUR" },
    { label: "9 HOUR" },
    { label: "10 HOUR" },
    { label: "11 HOUR" },
    { label: "12 HOUR" },
    { label: "13 HOUR" },
    { label: "14 HOUR" },
    { label: "15 HOUR" },
    { label: "16 HOUR" },
    { label: "17 HOUR" },
    { label: "18 HOUR" },
    { label: "19 HOUR" },
    { label: "20 HOUR" },
    { label: "21 HOUR" },
    { label: "22 HOUR" },
    { label: "23 HOUR" },
    { label: "24 HOUR" },
  ];
  const gracePeriodOptions = [
    { label: "10 MINUTES" },
    { label: "15 MINUTES" },
    { label: "20 MINUTES" },
    { label: "25 MINUTES" },
    { label: "30 MINUTES" },
    { label: "35 MINUTES" },
    { label: "40 MINUTES" },
    { label: "45 MINUTES" },
    { label: "50 MINUTES" },
    { label: "55 MINUTES" },
  ];

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Creating Place "
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
        dialogTitle="Create Rates"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              rateType: "",
              title: "",
              displayName: displayName,
              amount: 0,
              minimumAmount: 0,
              endDay: null,
              endTime: null,
              endTimeObj: null,
              startDay: null,
              startTime: null,
              startTimeObj: null,
              hours: 0,
              gracePeriod: 0,
              isValidationCodeRequired: false,
              secondStepValidation: false,
              payNowValidationLaterFlow: false,
              timeType: "",
              hourUnit: "",
              isRateOption: false,
              isFreeRate: false,
              isPermit: false,
              isPass: false,
              isCustomSubscription: false,
              rates: [],
              rateArray: [],
              customStartDate: null,
              customEndDate: null,
            }}
            validationSchema={createRateValidation}
            onSubmit={(value, action) => {
              console.log("values", value);
              if (value.timeType === "Custom Duration") {
                value["customStartDate"] = moment(value["customStartDate"]).format("YYYY-MM-DDT00:00:00.000[Z]");
                value["customEndDate"] = moment(value["customEndDate"]).format("YYYY-MM-DDT23:59:59.999[Z]");
              }
              handleCreateRate({ ...value, placeId });
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12} md={12} lg={12}>
                    <FormControl fullWidth>
                      <Autocomplete
                        disableClearable
                        name="rateType"
                        value={props.values.rateType}
                        options={[
                          "Hourly",
                          "Daily",
                          "All Day",
                          "Overnight",
                          "Custom",
                          "Monthly",
                        ]}
                        onChange={(event, newValue) => {
                          props.setValues({
                            ...props?.initialValues,
                            rateType: newValue,
                          });
                          // if (props.values?.rateType === "Custom") {
                          //   setDisplayName(props.values?.displayName || "");
                          // } else {
                          //   setDisplayName(
                          //     generateDisplayNameForRate({
                          //       rateType: props.values?.rateType,
                          //       amount: props.values?.amount,
                          //       hours: props.values?.hours,
                          //       endTime: props.values?.endTime,
                          //       endDay: props.values?.endDay,
                          //     })
                          //   );
                          // }
                        }}
                        onBlur={props.handleBlur}
                        error={
                          props.errors.rateType && props.touched.rateType
                            ? true
                            : false
                        }
                        success={
                          props.errors.rateType && props.touched.rateType
                            ? false
                            : true
                        }
                        helperText={
                          props.errors.rateType && props.touched.rateType
                            ? props.errors.rateType
                            : null
                        }
                        freeSolo
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="contained"
                              label={option}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <MDInput
                            label="Rate type"
                            fullWidth={true}
                            {...params}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  {[
                    "Hourly",
                    "Daily",
                    "All Day",
                    "Overnight",
                    "Custom",
                    "Monthly",
                  ].includes(props.values.rateType) ? (
                    <>
                      <Grid item xs={12} md={12} lg={12}>
                        <FormControl fullWidth>
                          <MDInput
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            name="title"
                            value={props.values?.title}
                            label="Title"
                            onBlur={props.handleBlur}
                            onChange={props.handleChange}
                            error={
                              props.errors.title && props.touched.title
                                ? true
                                : false
                            }
                            success={
                              props.errors.title && props.touched.title
                                ? false
                                : true
                            }
                            helperText={
                              props.errors.title && props.touched.title
                                ? props.errors.title
                                : null
                            }
                          />
                        </FormControl>
                        {props.values.rateType === "Custom" && (
                          <FormControl fullWidth className="mt-3">
                            <MDInput
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              name="displayName"
                              value={displayName}
                              label="Display Name"
                              onBlur={props.handleBlur}
                              onChange={(e) => {
                                props.handleChange(e);
                                if (props.values.rateType === "Custom") {
                                  setDisplayName(e.target.value);
                                }
                              }}
                              disabled={
                                props.values.rateType !== "Custom"
                                  ? true
                                  : false
                              }
                              error={
                                props.errors.displayName &&
                                props.touched.displayName
                                  ? true
                                  : false
                              }
                              success={
                                props.errors.displayName &&
                                props.touched.displayName
                                  ? false
                                  : true
                              }
                              helperText={
                                props.errors.displayName &&
                                props.touched.displayName
                                  ? props.errors.displayName
                                  : null
                              }
                            />
                          </FormControl>
                        )}

                        {props.values.isRateOption ? (
                          <>
                            <FormControl fullWidth className="mt-3">
                              <Autocomplete
                                multiple
                                disableClearable
                                name="rateId"
                                value={props.values?.rateArray || []}
                                options={ratesData}
                                onChange={(event, newValues) => {
                                  props.setValues({
                                    ...props.values,
                                    rates: newValues?.map((rate) => ({
                                      _id: rate._id,
                                      displayName: rate.displayName,
                                      rateType: rate.rateType,
                                      amount: rate.amount,
                                    })),
                                    rateArray: newValues,
                                  });
                                }}
                                onBlur={props.handleBlur}
                                getOptionLabel={(option) =>
                                  `${option.displayName} ${
                                    option.title ? `(${option.title})` : ""
                                  }`
                                }
                                renderInput={(params) => (
                                  <MDInput label="Rate" fullWidth {...params} />
                                )}
                                renderTags={(value, getTagProps) =>
                                  value.map((option, index) => (
                                    <Chip
                                      key={index}
                                      variant="contained"
                                      label={option.displayName}
                                      {...getTagProps({ index })}
                                    />
                                  ))
                                }
                              />
                            </FormControl>
                          </>
                        ) : (!props.values.isFreeRate && !props.values.isPermit) ? (
                          <>
                            <FormControl fullWidth className="mt-3">
                              <MDInput
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                name="amount"
                                value={props.values?.amount ?? ""}
                                label="Amount"
                                type="number"
                                onBlur={props.handleBlur}
                                onChange={(e) => {
                                  const { value } = e.target;
                                  const parsedValue = parseFloat(value);
                                  props.setFieldValue("amount", parsedValue);

                                  // if (props.values?.rateType === "Custom") {
                                  //   setDisplayName(
                                  //     props.values?.displayName || ""
                                  //   );
                                  // } else {
                                  //   setDisplayName(
                                  //     generateDisplayNameForRate({
                                  //       rateType: props.values?.rateType,
                                  //       amount: parsedValue,
                                  //       hours: props.values?.hours,
                                  //       endTime: props.values?.endTime,
                                  //       endDay: props.values?.endDay,
                                  //     })
                                  //   );
                                  // }
                                }}
                                error={
                                  props.errors.amount && props.touched.amount
                                    ? true
                                    : false
                                }
                                success={
                                  props.errors.amount && props.touched.amount
                                    ? false
                                    : true
                                }
                                helperText={
                                  props.errors.amount && props.touched.amount
                                    ? props.errors.amount
                                    : null
                                }
                              />
                            </FormControl>
                            {props.values.rateType === "Monthly" &&
                            !props.values.isCustomSubscription && (
                              <FormControl fullWidth className="mt-3">
                                <MDInput
                                  labelId="demo-simple-select-label"
                                  id="demo-simple-select"
                                  name="minimumAmount"
                                  value={props.values?.minimumAmount ?? ""}
                                  label="Minimum Amount"
                                  type="number"
                                  onBlur={props.handleBlur}
                                  onChange={(e) => {
                                    const { value } = e.target;
                                    const parsedValue = parseFloat(value);
                                    props.setFieldValue(
                                      "minimumAmount",
                                      parsedValue
                                    );
                                  }}
                                  error={
                                    props.errors.minimumAmount &&
                                    props.touched.minimumAmount
                                      ? true
                                      : false
                                  }
                                  success={
                                    props.errors.minimumAmount &&
                                    props.touched.minimumAmount
                                      ? false
                                      : true
                                  }
                                  helperText={
                                    props.errors.minimumAmount &&
                                    props.touched.minimumAmount
                                      ? props.errors.minimumAmount
                                      : null
                                  }
                                />
                              </FormControl>
                            )}
                          </>
                        ) : null}
                      </Grid>
                    </>
                  ) : null}

                  {props.values.rateType === "Daily" ? (
                    <Grid item xs={12} md={12} lg={12}>
                      <Autocomplete
                        options={generateNumbers(1, 24)}
                        getOptionLabel={(option) => option.label ?? option}
                        name="hours"
                        value={props.values.hours}
                        isOptionEqualToValue={(option, value) => {
                          if (value === "" || option.label === value) {
                            return true;
                          }
                        }}
                        onChange={(event, newValue) => {
                          const parsedValue = parseFloat(newValue.label);
                          props.setFieldValue(
                            "hours",
                            !isNaN(parsedValue) ? parsedValue : null
                          );

                          // if (props.values?.rateType === "Custom") {
                          //   setDisplayName(props.values?.displayName || "");
                          // } else {
                          //   setDisplayName(
                          //     generateDisplayNameForRate({
                          //       rateType: props.values?.rateType,
                          //       amount: props.values?.amount,
                          //       hours: parsedValue,
                          //       endTime: props.values?.endTime,
                          //       endDay: props.values?.endDay,
                          //     })
                          //   );
                          // }
                        }}
                        onBlur={props.handleBlur}
                        autoHighlight
                        disableClearable
                        size="medium"
                        renderInput={(params) => (
                          <MDInput
                            label="Hours"
                            fullWidth={true}
                            inputProps={{
                              ...params.inputProps,
                              autoComplete: "new-password",
                            }}
                            error={
                              props.errors.hours && props.touched.hours
                                ? true
                                : false
                            }
                            helperText={
                              props.errors.hours && props.touched.hours
                                ? props.errors.hours
                                : null
                            }
                            {...params}
                          />
                        )}
                      />
                    </Grid>
                  ) : props.values.rateType === "Overnight" ? (
                    <>
                      <Grid item xs={12} md={12} lg={12}>
                        <Autocomplete
                          options={endDayOptions[props.values?.rateType]}
                          getOptionLabel={(option) => option.label ?? option}
                          name="endDay"
                          value={props.values.endDay}
                          isOptionEqualToValue={(option, value) => {
                            if (value === "" || option.label === value) {
                              return true;
                            }
                          }}
                          onChange={(event, newValue) => {
                            props.setFieldValue("endDay", newValue.label);
                          }}
                          onBlur={props.handleBlur}
                          autoHighlight
                          disableClearable
                          size="medium"
                          renderInput={(params) => (
                            <MDInput
                              label="End Day"
                              fullWidth={true}
                              inputProps={{
                                ...params.inputProps,
                                autoComplete: "new-password",
                              }}
                              error={
                                props.errors.endDay && props.touched.endDay
                                  ? true
                                  : false
                              }
                              helperText={
                                props.errors.endDay && props.touched.endDay
                                  ? props.errors.endDay
                                  : null
                              }
                              {...params}
                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={12}
                        lg={12}
                        onClick={() => setEndDayTimePickerOpen(true)}
                      >
                        <DesktopTimePicker
                          name="endTimeObj"
                          value={props.values.endTimeObj}
                          onChange={(newTime) => {
                            props.setFieldValue("endTimeObj", newTime);
                            props.setFieldValue(
                              "endTime",
                              moment(newTime)?.format("HH:mm")
                            );
                          }}
                          onBlur={props.handleBlur}
                          open={isEndDayTimePickerOpen}
                          onClose={() => setEndDayTimePickerOpen(false)}
                          timeSteps={{ minutes: 1 }}
                          sx={{ width: "100%", mb: 1 }}
                          label="End Day Time"
                        />
                      </Grid>
                    </>
                  ) : null}

                  {props.values.rateType === "All Day" ? (
                    <Grid
                      item
                      xs={12}
                      md={12}
                      lg={12}
                      onClick={() => setEndDayTimePickerOpen(true)}
                    >
                      <DesktopTimePicker
                        name="endTimeObj"
                        value={props.values.endTimeObj}
                        onChange={(newTime) => {
                          props.setFieldValue("endTimeObj", newTime);
                          props.setFieldValue(
                            "endTime",
                            moment(newTime)?.format("HH:mm")
                          );
                        }}
                        onBlur={props.handleBlur}
                        open={isEndDayTimePickerOpen}
                        onClose={() => setEndDayTimePickerOpen(false)}
                        timeSteps={{ minutes: 1 }}
                        sx={{ width: "100%", mb: 1 }}
                        label="End Day Time"
                      />
                    </Grid>
                  ) : null}

                  {(props.values.secondStepValidation ||
                    props.values.payNowValidationLaterFlow) && (
                    <Grid item xs={12} md={12} lg={12}>
                      <Autocomplete
                        options={gracePeriodOptions}
                        getOptionLabel={(option) => option.label ?? option}
                        name="gracePeriod"
                        value={props.values.gracePeriod}
                        isOptionEqualToValue={(option, value) => {
                          if (value === "" || option.label === value) {
                            return true;
                          }
                        }}
                        onChange={(event, newValue) => {
                          const parsedValue = parseFloat(newValue.label);
                          props.setFieldValue(
                            "gracePeriod",
                            !isNaN(parsedValue) ? parsedValue : null
                          );
                        }}
                        onBlur={props.handleBlur}
                        autoHighlight
                        disableClearable
                        size="medium"
                        renderInput={(params) => (
                          <MDInput
                            label="Validation Grace Period (Minutes)"
                            fullWidth={true}
                            inputProps={{
                              ...params.inputProps,
                              autoComplete: "new-password",
                            }}
                            error={
                              props.errors.gracePeriod &&
                              props.touched.gracePeriod
                                ? true
                                : false
                            }
                            helperText={
                              props.errors.gracePeriod &&
                              props.touched.gracePeriod
                                ? props.errors.gracePeriod
                                : null
                            }
                            {...params}
                          />
                        )}
                      />
                    </Grid>
                  )}

                  {props.values.rateType === "Custom" && (
                    <> 
                      {!props.values.isRateOption &&
                        !props.values.isPermit && (
                        <>
                          <Grid item xs={12} md={12} lg={12}>
                            <FormControl fullWidth>
                              <InputLabel id="demo-simple-select-label">
                                Time Type
                              </InputLabel>
                              <MDDropDown
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                name="timeType"
                                value={props.values.timeType}
                                label="Time Type"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                              >
                                <MenuItem value={"Hour Based"}>
                                  Hour Based
                                </MenuItem>
                                <MenuItem value={"Fixed End Time"}>
                                  Fixed End Time
                                </MenuItem>
                                <MenuItem value={"Custom Duration"}>
                                  Custom Duration
                                </MenuItem>
                              </MDDropDown>
                            </FormControl>
                          </Grid>

                          {props.values.isPass && (
                            <Grid
                              item
                              xs={12}
                              md={12}
                              lg={12}
                              onClick={() => setStartDayTimePickerOpen(true)}
                            >
                              <DesktopTimePicker
                                name="startTimeObj"
                                value={props.values.startTimeObj}
                                onChange={(newTime) => {
                                  props.setFieldValue("startTimeObj", newTime);
                                  props.setFieldValue(
                                    "startTime",
                                    moment(newTime)?.format("HH:mm")
                                  );
                                }}
                                onBlur={props.handleBlur}
                                open={isStartDayTimePickerOpen}
                                onClose={() => setStartDayTimePickerOpen(false)}
                                timeSteps={{ minutes: 1 }}
                                sx={{ width: "100%", mb: 1 }}
                                label="Start Day Time"
                              />
                            </Grid>
                          )}

                          {props.values.isPass && (
                            <Grid item xs={12} md={12} lg={12}>
                              <Autocomplete
                                options={startDayOptions}
                                getOptionLabel={(option) =>
                                  option.label ?? option
                                }
                                name="startDay"
                                value={props.values.startDay}
                                isOptionEqualToValue={(option, value) => {
                                  if (value === "" || option.label === value) {
                                    return true;
                                  }
                                }}
                                onChange={(event, newValue) => {
                                  props.setFieldValue(
                                    "startDay",
                                    newValue.label
                                  );
                                }}
                                onBlur={props.handleBlur}
                                autoHighlight
                                disableClearable
                                size="medium"
                                renderInput={(params) => (
                                  <MDInput
                                    label="Start Day"
                                    fullWidth={true}
                                    inputProps={{
                                      ...params.inputProps,
                                      autoComplete: "new-password",
                                    }}
                                    error={
                                      props.errors.startDay &&
                                      props.touched.startDay
                                        ? true
                                        : false
                                    }
                                    helperText={
                                      props.errors.startDay &&
                                      props.touched.startDay
                                        ? props.errors.startDay
                                        : null
                                    }
                                    {...params}
                                  />
                                )}
                              />
                            </Grid>
                          )}

                          {props.values.timeType === "Hour Based" ? (
                            <Grid item xs={12} md={12} lg={12}>
                              <Autocomplete
                                options={hoursOptions} //{generateNumbers(1, 24)}
                                getOptionLabel={(option) =>
                                  option.label ?? option
                                }
                                name="hours"
                                value={props.values.hours}
                                isOptionEqualToValue={(option, value) => {
                                  if (value === "" || option.label === value) {
                                    return true;
                                  }
                                }}
                                onChange={(event, newValue) => {
                                  const isMinValue =
                                    newValue.label.includes("MINUTE");
                                  props.setFieldValue(
                                    "hourUnit",
                                    isMinValue ? "MINUTES" : "HOURS"
                                  );
                                  const parsedValue = parseFloat(
                                    newValue.label
                                  );
                                  props.setFieldValue(
                                    "hours",
                                    !isNaN(parsedValue) ? parsedValue : null
                                  );
                                }}
                                onBlur={props.handleBlur}
                                autoHighlight
                                disableClearable
                                size="medium"
                                renderInput={(params) => (
                                  <MDInput
                                    label="Hours"
                                    fullWidth={true}
                                    inputProps={{
                                      ...params.inputProps,
                                      autoComplete: "new-password",
                                    }}
                                    error={
                                      props.errors.hours && props.touched.hours
                                        ? true
                                        : false
                                    }
                                    helperText={
                                      props.errors.hours && props.touched.hours
                                        ? props.errors.hours
                                        : null
                                    }
                                    {...params}
                                  />
                                )}
                              />
                            </Grid>
                          ) : props.values.timeType === "Custom Duration" ?
                            <Grid item xs={12} md={12} lg={12}>
                              <FormControl fullWidth>
                                <DateRangePicker
                                  id="dateDuration"
                                  placeholder="Rate Start Date - Rate End Date"
                                  character=" - "
                                  size="lg"
                                  format="dd-MM-yyyy"
                                  showMeridian
                                  block
                                  placement="top"
                                  value={
                                    props.values.customStartDate && props.values.customEndDate
                                      ? [
                                        new Date(props.values.customStartDate),
                                        new Date(props.values.customEndDate),
                                      ]
                                      : undefined
                                  }
                                  ranges={[]}
                                  onChange={(value) => {
                                    if (value && value.length === 2) {
                                      props.setFieldValue(
                                        "customStartDate",
                                        moment(value[0]).format()
                                      );
                                      props.setFieldValue(
                                        "customEndDate",
                                        moment(value[1]).format()
                                      );
                                    } else {
                                      props.setFieldValue("customStartDate", null);
                                      props.setFieldValue("customEndDate", null);
                                    }
                                  }}
                                  onBlur={props.handleBlur}
                                />
                              </FormControl>
                            </Grid>
                          : (
                            <>
                              <Grid
                                item
                                xs={12}
                                md={12}
                                lg={12}
                                onClick={() => setEndDayTimePickerOpen(true)}
                              >
                                <DesktopTimePicker
                                  name="endTimeObj"
                                  value={props.values.endTimeObj}
                                  onChange={(newTime) => {
                                    props.setFieldValue("endTimeObj", newTime);
                                    props.setFieldValue(
                                      "endTime",
                                      moment(newTime)?.format("HH:mm")
                                    );
                                  }}
                                  onBlur={props.handleBlur}
                                  open={isEndDayTimePickerOpen}
                                  onClose={() => setEndDayTimePickerOpen(false)}
                                  timeSteps={{ minutes: 1 }}
                                  sx={{ width: "100%", mb: 1 }}
                                  label="End Day Time"
                                />
                              </Grid>
                              <Grid item xs={12} md={12} lg={12}>
                                <Autocomplete
                                  options={
                                    endDayOptions[props.values?.rateType]
                                  }
                                  getOptionLabel={(option) =>
                                    option.label ?? option
                                  }
                                  name="endDay"
                                  value={props.values.endDay}
                                  isOptionEqualToValue={(option, value) => {
                                    if (
                                      value === "" ||
                                      option.label === value
                                    ) {
                                      return true;
                                    }
                                  }}
                                  onChange={(event, newValue) => {
                                    props.setFieldValue(
                                      "endDay",
                                      newValue.label
                                    );
                                  }}
                                  onBlur={props.handleBlur}
                                  autoHighlight
                                  disableClearable
                                  size="medium"
                                  renderInput={(params) => (
                                    <MDInput
                                      label="End Day"
                                      fullWidth={true}
                                      inputProps={{
                                        ...params.inputProps,
                                        autoComplete: "new-password",
                                      }}
                                      error={
                                        props.errors.end_day &&
                                        props.touched.end_day
                                          ? true
                                          : false
                                      }
                                      helperText={
                                        props.errors.end_day &&
                                        props.touched.end_day
                                          ? props.errors.end_day
                                          : null
                                      }
                                      {...params}
                                    />
                                  )}
                                />
                              </Grid>
                            </>
                          )}

                          {!props.values.isFreeRate && <></>}
                        </>
                      )}
                      {!props.values.isFreeRate &&
                        !props.values.isPass &&
                        !props.values.secondStepValidation &&
                        !props.values.isPermit && (
                          <Grid item xs={12} md={6} lg={6}>
                            <MDBox display="flex" alignItems="center" ml={-1}>
                              <Checkbox
                                checked={props.values.isRateOption}
                                onChange={(e) => {
                                  props.handleChange(e);

                                  props.setFieldValue(
                                    "isRateOption",
                                    e.target.checked
                                  );
                                }}
                                inputProps={{
                                  "aria-label": "controlled",
                                }}
                              />
                              <MDTypography
                                variant="button"
                                fontWeight="regular"
                                color="text"
                              >
                                &nbsp;&nbsp;Create Parent Rate&nbsp;
                              </MDTypography>
                            </MDBox>
                          </Grid>
                        )}

                      {!props.values.isRateOption &&
                        !props.values.secondStepValidation &&
                        !props.values.isPass &&
                        !props.values.isPermit && (
                          <Grid item xs={12} md={6} lg={6}>
                            <MDBox display="flex" alignItems="center" ml={-1}>
                              <Checkbox
                                checked={props.values.isFreeRate}
                                onChange={(e) => {
                                  props.handleChange(e);

                                  props.setFieldValue(
                                    "isFreeRate",
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
                                &nbsp;&nbsp;Create Free Rate&nbsp;
                              </MDTypography>
                            </MDBox>
                          </Grid>
                        )}

                        {!props.values.isFreeRate &&
                          !props.values.isRateOption &&
                          !props.values.secondStepValidation &&
                          !props.values.secondStepValidation &&
                          !props.values.isValidationCodeRequired &&
                          !props.values.payNowValidationLaterFlow &&
                          !props.values.isPass &&
                          <Grid item xs={12} md={6} lg={6}>
                            <MDBox display="flex" alignItems="center" ml={-1}>
                              <Checkbox
                                checked={props.values.isPermit}
                                onChange={(e) => {
                                  props.handleChange(e);

                                  props.setFieldValue(
                                    "isPermit",
                                    e.target.checked
                                  );
                                }}
                                inputProps={{
                                  "aria-label": "controlled",
                                }}
                              />
                              <MDTypography
                                variant="button"
                                fontWeight="regular"
                                color="text"
                              >
                                &nbsp;&nbsp;Create Permit Rate&nbsp;
                              </MDTypography>
                            </MDBox>
                          </Grid>
                        }
                        <Grid item xs={12} md={12} lg={12}>
                          <MDBox display="flex" alignItems="center" ml={-1}>
                            <Checkbox
                              checked={props.values.isPass}
                              onChange={(e) => {
                                props.handleChange(e);

                                props.setFieldValue(
                                  "isPass",
                                  e.target.checked
                                );
                              }}
                              inputProps={{
                                "aria-label": "controlled",
                              }}
                            />
                            <MDTypography
                              variant="button"
                              fontWeight="regular"
                              color="text"
                            >
                              &nbsp;&nbsp;Is Pass?&nbsp;
                            </MDTypography>
                          </MDBox>
                        </Grid>
                    </>
                  )}
                  {props.values.rateType !== "" &&
                    !props.values.isFreeRate &&
                    !props.values.isRateOption &&
                    props.values.rateType !== "Monthly" &&
                    !props.values.isPass &&
                    !props.values.isPermit && (
                      <>
                        {!props.values.payNowValidationLaterFlow && (
                          <Grid item xs={12} md={6} lg={6}>
                            <MDBox display="flex" alignItems="center" ml={-1}>
                              <Checkbox
                                checked={props.values.secondStepValidation}
                                onChange={(e) => {
                                  props.handleChange(e);
                                  props.setFieldValue(
                                    "secondStepValidation",
                                    e.target.checked
                                  );
                                  if (e.target.checked) {
                                    props.setFieldValue(
                                      "isValidationCodeRequired",
                                      false
                                    );
                                  }
                                }}
                                inputProps={{ "aria-label": "controlled" }}
                              />
                              <MDTypography
                                variant="button"
                                fontWeight="regular"
                                color="text"
                              >
                                &nbsp;&nbsp;Create Rate with Validate Later&nbsp;
                              </MDTypography>
                            </MDBox>
                          </Grid>
                        )}

                        {!props.values.secondStepValidation && !props.values.isPass && (
                    
                          <Grid item xs={12} md={6} lg={6}>
                            <MDBox display="flex" alignItems="center" ml={-1}>
                              <Checkbox
                                checked={props.values.payNowValidationLaterFlow}
                                onChange={(e) => {
                                  props.handleChange(e);
                                  props.setFieldValue(
                                    "payNowValidationLaterFlow",
                                    e.target.checked
                                  );
                                  if (e.target.checked) {
                                    props.setFieldValue(
                                      "isValidationCodeRequired",
                                      false
                                    );
                                  }
                                }}
                                inputProps={{ "aria-label": "controlled" }}
                              />
                              <MDTypography
                                variant="button"
                                fontWeight="regular"
                                color="text"
                              >
                                &nbsp;&nbsp;Create Rate with Pay Now &nbsp;&nbsp;Validate Later&nbsp;
                              </MDTypography>
                            </MDBox>
                          </Grid>
                        )}
                        {!props.values.payNowValidationLaterFlow &&
                          !props.values.isPass &&
                          !props.values.secondStepValidation && (
                            <Grid item xs={12} md={6} lg={6}>
                              <MDBox display="flex" alignItems="center" ml={-1}>
                                <Checkbox
                                  checked={
                                    props.values.isValidationCodeRequired
                                  }
                                  onChange={(e) => {
                                    props.handleChange(e);
                                    props.setFieldValue(
                                      "isValidationCodeRequired",
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
                                  &nbsp;&nbsp;Require Validation Code&nbsp;
                                </MDTypography>
                              </MDBox>
                            </Grid>
                          )}
                      </>
                    )}
                     {props.values.rateType !== "" &&
                          props.values.rateType === "Monthly" && 
                            <Grid item xs={12} md={12} lg={12}>
                              <MDBox display="flex" alignItems="center" ml={-1}>
                                <Checkbox
                                  checked={
                                    props.values.isCustomSubscription
                                  }
                                  onChange={(e) => {
                                    props.handleChange(e);
                                    props.setFieldValue(
                                      "isCustomSubscription",
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
                                  &nbsp;&nbsp;Is Custom Subscription?
                                  &nbsp;
                                </MDTypography>
                              </MDBox>
                            </Grid>
                          }
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

export default CreateRates;
