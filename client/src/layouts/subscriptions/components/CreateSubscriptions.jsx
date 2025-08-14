import { useEffect, useRef, useState } from "react";
import {
  DialogContent,
  Grid,
  Collapse,
  Divider,
  Checkbox,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import MDButton from "components/MDButton";
import { useDispatch } from "react-redux";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import { FieldArray, Formik } from "formik";
import { useMaterialUIController } from "context";
import CircularIndeterminate from "components/MDLoading";
import moment from "moment";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { CreateSubscriptionValidationSchema } from "services/validation";
import { createSubscription } from "store/slice/subscriptions/subscriptionSlice";
import { getSubscriptionsByPlaceId } from "store/slice/subscriptions/subscriptionSlice";
import { DateRangePicker } from "rsuite";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { capitalizeFirstLetter } from "global/functions";
import { getDateInfo } from "global/functions";
import { get } from "lodash";
import { amountToShow } from "global/functions";
import { calculateTotalAmountWithTaxAndFee } from "global/functions";

const CreateSubscription = (props) => {
  const dispatch = useDispatch();
  const formikRef = useRef();
  const { dialogOpen, onClose, placeId, placeData, serviceFee, setTabValue } =
    props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [netPayableAmount, setNetPayableAmount] = useState(0);
  const [dateInfo, setDateInfo] = useState({});

  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  useEffect(() => {
    if (formikRef.current) {
      const totalAmount = formikRef.current.values.licensePlate.reduce(
        (acc, current) => acc + (Number(current.price) || 0),
        0
      );
      formikRef.current.setFieldValue("amount", totalAmount);
    }
  }, [formikRef.current?.values.licensePlate]);

  const handelCreateSubscription = (data) => {
    setIsLoading(true);
    dispatch(createSubscription(data))
      .unwrap()
      .then((res) => {
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
          dispatch(getSubscriptionsByPlaceId(placeId));
          setTabValue("pending");
          onClose();
        }
      })
      .catch((err) => {
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

  const handleStartDateChange = (newValue, setFieldValue) => {
    setFieldValue("startDateObj", newValue);
    setFieldValue("startDate", moment(newValue).startOf("day").utc());
    const endOfMonth = moment(newValue).clone().endOf("month");

    setFieldValue("endDateObj", endOfMonth);
    setFieldValue("endDate", endOfMonth.utc());

    setDateInfo(getDateInfo(newValue));
  };

  const handleRemove = (index) => {
    let licensePlateArray = formikRef.current.values.licensePlate;
    licensePlateArray.splice(index, 1);
    let totalPrice = 0;
    for (const plate of licensePlateArray) {
      totalPrice += parseInt(plate.price) || 0;
    }
    formikRef.current.setFieldValue("amount", totalPrice);
  };

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Creating Subscription.. "
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
        dialogTitle="Create Subscription"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            innerRef={formikRef}
            initialValues={{
              endDateObj: null,
              startDateObj: null,
              startDate: "",
              endDate: "",
              firstName: "",
              lastName: "",
              email: "",
              mobile: "",
              companyName: "",
              licensePlate: [
                { licensePlateNumber: "", price: null, assignName: "" },
              ],
              licensePlateCount: 0,
              amount: null,
              netPayableAmount: 0,
              isAutoRenew: true,
              isApplyTax: true,
              isApplyServiceFee: true,
              isDirectChargeSubscription: placeData?.isDirectChargeLocation,
              totalAmount: 0,
              message: "",
              durationType: "monthly",
              isCustomSubscription: true,
              subscriptionDurationInDays: get(dateInfo, "daysLeftInMonth", 0),
              paymentMethodType: "card", // Default to card payment
            }}
            validationSchema={CreateSubscriptionValidationSchema}
            onSubmit={(values, actions) => {
              handelCreateSubscription({
                ...values,
                placeId,
                isMonthly: values.durationType === "monthly" ? true : false,
                netPayableAmount: netPayableAmount * 100,
                amount: values.amount * 100,
              });
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <Grid item xs={12}>
                      <RadioGroup
                        name="durationType"
                        sx={{ flexDirection: "row" }}
                        value={props.values.durationType}
                        onChange={(e) =>
                          props.setFieldValue("durationType", e.target.value)
                        }
                      >
                        <FormControlLabel
                          value="monthly"
                          control={<Radio color="primary" />}
                          label="Monthly"
                        />
                        <FormControlLabel
                          value="custom"
                          control={<Radio />}
                          label="Custom"
                        />
                      </RadioGroup>
                    </Grid>

                    <MDBox mt={2}>
                      {props.values.durationType === "custom" ? (
                        <FormControl fullWidth>
                          <DateRangePicker
                            id="duration"
                            placeholder="Start Date - End Date"
                            character=" - "
                            showOneCalendar={false}
                            size="lg"
                            format="MM/dd/yyyy"
                            ranges={[]}
                            clearButton={true}
                            value={
                              props.values.startDate && props.values.endDate
                                ? [
                                    moment(props.values.startDate).toDate(),
                                    moment(props.values.endDate).toDate(),
                                  ]
                                : undefined
                            }
                            onChange={(value) => {
                              if (value && value.length === 2) {
                                const [startDate, endDate] = value;
                                props.setFieldValue(
                                  "startDate",
                                  moment(startDate)
                                );
                                props.setFieldValue("endDate", moment(endDate));
                              } else {
                                props.setFieldValue("startDate", null);
                                props.setFieldValue("endDate", null);
                              }
                            }}
                            error={
                              props.errors.startDate && props.touched.startDate
                                ? true
                                : false
                            }
                            success={
                              props.errors.startDate && props.touched.startDate
                                ? false
                                : true
                            }
                            helperText={
                              props.errors.startDate && props.touched.startDate
                                ? props.errors.startDate
                                : null
                            }
                          />
                        </FormControl>
                      ) : (
                        <>
                          <Grid container spacing={2}>
                            <Grid
                              item
                              xs={12}
                              md={6}
                              onClick={() => setStartDatePickerOpen(true)}
                            >
                              <DesktopDatePicker
                                name="startDate"
                                label="Start Date"
                                value={props.values?.startDateObj}
                                onChange={(newValue) => {
                                  handleStartDateChange(
                                    newValue,
                                    props.setFieldValue
                                  );
                                }}
                                onBlur={props.handleBlur}
                                sx={{ width: "100%", mb: 1 }}
                                open={startDatePickerOpen}
                                onClose={() => setStartDatePickerOpen(false)}
                                renderInput={(params) => (
                                  <TextField {...params} />
                                )}
                                format="MM/DD/YYYY"
                                error={
                                  props.errors.startDate &&
                                  props.touched.startDate
                                    ? true
                                    : false
                                }
                                success={
                                  props.errors.startDate &&
                                  props.touched.startDate
                                    ? false
                                    : true
                                }
                                helperText={
                                  props.errors.startDate &&
                                  props.touched.startDate
                                    ? props.errors.startDate
                                    : null
                                }
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <DesktopDatePicker
                                name="endDate"
                                label="End Date"
                                value={props.values?.endDateObj}
                                onBlur={props.handleBlur}
                                sx={{ width: "100%", mb: 1 }}
                                renderInput={(params) => (
                                  <TextField {...params} />
                                )}
                                format="MM/DD/YYYY"
                                disabled={true}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}
                    </MDBox>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <MDInput
                      name="firstName"
                      value={props.values.firstName}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="First Name"
                      error={
                        props.errors.firstName && props.touched.firstName
                          ? true
                          : false
                      }
                      success={
                        props.errors.firstName && props.touched.firstName
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.firstName && props.touched.firstName
                          ? props.errors.firstName
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      name="lastName"
                      value={props.values.lastName}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Last Name"
                      error={
                        props.errors.lastName && props.touched.lastName
                          ? true
                          : false
                      }
                      success={
                        props.errors.lastName && props.touched.lastName
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.lastName && props.touched.lastName
                          ? props.errors.lastName
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      name="email"
                      value={props.values.email}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Email"
                      error={
                        props.errors.email && props.touched.email ? true : false
                      }
                      success={
                        props.errors.email && props.touched.email ? false : true
                      }
                      helperText={
                        props.errors.email && props.touched.email
                          ? props.errors.email
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      name="mobile"
                      value={props.values.mobile}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Mobile"
                      error={
                        props.errors.mobile && props.touched.mobile
                          ? true
                          : false
                      }
                      success={
                        props.errors.mobile && props.touched.mobile
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.mobile && props.touched.mobile
                          ? props.errors.mobile
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      name="companyName"
                      value={props.values.companyName}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Company Name (Optional)"
                      error={
                        props.errors.companyName && props.touched.companyName
                          ? true
                          : false
                      }
                      success={
                        props.errors.companyName && props.touched.companyName
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.companyName && props.touched.companyName
                          ? props.errors.companyName
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FieldArray name="licensePlate">
                          {({ remove, push }) => (
                            <MDBox className="pt-2">
                              <TransitionGroup component="div" appear>
                                {props.values.licensePlate.map(
                                  (licensePlate, index) => (
                                    <Collapse key={index}>
                                      <MDBox>
                                        {index !== 0 && (
                                          <MDBox mt={1}>
                                            <Stack
                                              direction="row"
                                              justifyContent="flex-start"
                                              alignItems="center"
                                              spacing={1}
                                            >
                                              <Divider
                                                orientation="horizontal"
                                                flexItem
                                                light
                                                sx={{
                                                  width: `calc(100% - 40px)`,
                                                  margin: "auto 0 !important",
                                                }}
                                              />
                                              {props.values.licensePlate
                                                .length > 1 && (
                                                <IconButton
                                                  color="error"
                                                  size="small"
                                                  onClick={() => {
                                                    remove(index);
                                                    handleRemove(index);
                                                  }}
                                                >
                                                  <ClearOutlinedIcon />
                                                </IconButton>
                                              )}
                                            </Stack>
                                          </MDBox>
                                        )}
                                        <Grid container spacing={2}>
                                          <Grid item xs={12} md={4}>
                                            <MDInput
                                              label="License Plate"
                                              name={`licensePlate.${index}.licensePlateNumber`}
                                              value={
                                                licensePlate.licensePlateNumber
                                              }
                                              onChange={props.handleChange}
                                              onBlur={props.handleBlur}
                                              error={Boolean(
                                                props.errors.licensePlate?.[
                                                  index
                                                ]?.licensePlateNumber
                                              )}
                                              helperText={
                                                props.errors.licensePlate?.[
                                                  index
                                                ]?.licensePlateNumber
                                              }
                                            />
                                          </Grid>
                                          <Grid item xs={12} md={5}>
                                            <MDInput
                                              label="Assigned Name (Optional)"
                                              name={`licensePlate.${index}.assignName`}
                                              value={licensePlate.assignName}
                                              onChange={props.handleChange}
                                              onBlur={props.handleBlur}
                                            />
                                          </Grid>
                                          <Grid item xs={12} md={3}>
                                            <MDInput
                                              label="Price"
                                              name={`licensePlate.${index}.price`}
                                              value={licensePlate.price}
                                              onChange={(e) => {
                                                const { value } = e.target;
                                                if (
                                                  value === "" ||
                                                  /^\d+$/.test(value)
                                                ) {
                                                  let parsedValue =
                                                    value === ""
                                                      ? ""
                                                      : parseInt(value, 10);
                                                  props.setFieldValue(
                                                    `licensePlate.${index}.price`,
                                                    parsedValue
                                                  );
                                                  const updatedLicensePlates = [
                                                    ...props.values
                                                      .licensePlate,
                                                  ];
                                                  updatedLicensePlates[
                                                    index
                                                  ].price = parsedValue;
                                                  const totalAmount =
                                                    updatedLicensePlates.reduce(
                                                      (acc, current) =>
                                                        acc +
                                                        (Number(
                                                          current.price
                                                        ) || 0),
                                                      0
                                                    );
                                                  props.setFieldValue(
                                                    "amount",
                                                    Math.ceil(totalAmount)
                                                  );
                                                }
                                              }}
                                              onBlur={props.handleBlur}
                                              error={Boolean(
                                                props.errors.licensePlate?.[
                                                  index
                                                ]?.price
                                              )}
                                              helperText={
                                                props.errors.licensePlate?.[
                                                  index
                                                ]?.price
                                              }
                                            />
                                          </Grid>
                                        </Grid>
                                      </MDBox>
                                    </Collapse>
                                  )
                                )}
                              </TransitionGroup>
                              <MDBox sx={{ mr: 2, mt: 3, mb: 1 }}>
                                <MDButton
                                  variant="contained"
                                  color={sidenavColor}
                                  onClick={() =>
                                    push({ licensePlateNumber: "", price: "" })
                                  }
                                >
                                  +
                                </MDButton>
                              </MDBox>
                            </MDBox>
                          )}
                        </FieldArray>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack display="flex" rowGap={1}>
                      {props.values.durationType === "monthly" && (
                        <MDTypography
                          fontWeight="regular"
                          color="success"
                          variant="caption"
                        >
                          {`$${(
                            (props.values?.amount || 0) /
                            (dateInfo.daysInMonth || 1)
                          ).toFixed(2)}/ Per Day `}
                        </MDTypography>
                      )}
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6} lg={6}>
                    <Grid item xs={12} md={12} lg={12}>
                      <MDBox display="flex" alignItems="center" ml={-1}>
                        <Checkbox
                          id="isAutoRenew"
                          name="isAutoRenew"
                          checked={props.values.isAutoRenew}
                          onChange={(e) => {
                            props.handleChange(e);

                            props.setFieldValue(
                              "isAutoRenew",
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
                          &nbsp;&nbsp;Is recurring (Auto Renew)&nbsp;
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                      <MDBox display="flex" alignItems="center" ml={-1}>
                        <Checkbox
                          id="isApplyTax"
                          name="isApplyTax"
                          checked={props.values.isApplyTax}
                          onChange={(e) => {
                            props.handleChange(e);

                            props.setFieldValue("isApplyTax", e.target.checked);
                          }}
                          inputProps={{ "aria-label": "controlled" }}
                        />
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                        >
                          &nbsp;&nbsp;Apply Tax&nbsp;
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                      <MDBox display="flex" alignItems="center" ml={-1}>
                        <Checkbox
                          id="isApplyServiceFee"
                          name="isApplyServiceFee"
                          checked={props.values.isApplyServiceFee}
                          onChange={(e) => {
                            props.handleChange(e);

                            props.setFieldValue(
                              "isApplyServiceFee",
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
                          &nbsp;&nbsp;Apply Service Fee&nbsp;
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    
                    <Grid item xs={12} md={12} lg={12}>
                      <MDBox display="flex" alignItems="center" ml={-1}>
                        <Tooltip
                          title={props.values.isDirectChargeSubscription ? 
                            "Payment will be a direct charge. Unselect it for destination charge" : 
                            "Select it for direct charge"}
                          arrow
                        >
                          <Checkbox
                            id="isDirectCharge"
                            name="isDirectCharge"
                            tooltip="Direct Charge"
                            checked={props.values.isDirectChargeSubscription}
                            onChange={(e) => {
                              props.handleChange(e);

                              props.setFieldValue(
                                "isDirectChargeSubscription",
                                e.target.checked
                              );
                            }}
                            inputProps={{ "aria-label": "controlled" }}
                          />
                        </Tooltip>
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                        >
                          &nbsp;&nbsp;Direct Charge&nbsp;
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>

                  {/* Payment Method Selection */}
                  <Grid item xs={12}>
                    <MDTypography
                      variant="button"
                      fontWeight="regular"
                      color="text"
                      fontSize="small"
                    >
                      Payment Method:
                    </MDTypography>
                    <RadioGroup
                      name="paymentMethodType"
                      sx={{ flexDirection: "row", mt: 1 }}
                      value={props.values.paymentMethodType}
                      onChange={(e) =>
                        props.setFieldValue("paymentMethodType", e.target.value)
                      }
                    >
                      {placeData?.brandId?.isPaymentByCard && (
                        <FormControlLabel
                          value="card"
                          control={<Radio color="primary" />}
                          label="Card"
                        />
                      )}
                      {placeData?.brandId?.isPaymentByAch && (
                        <FormControlLabel
                          value="ach"
                          control={<Radio />}
                          label="ACH"
                        />
                      )}
                      {placeData?.brandId?.isPaymentByCash && (
                        <FormControlLabel
                          value="cash"
                          control={<Radio />}
                          label="Cash"
                        />
                      )}
                    </RadioGroup>
                  </Grid>

                  <Grid item xs={12} md={6} lg={6}>
                    <Grid item xs={12} md={12} lg={12}>
                      <MDBox
                        display="flex"
                        alignItems="center"
                        ml={-1}
                        sx={{
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                          fontSize="small"
                        >
                          Payment Gateway Fee Paid By :
                        </MDTypography>
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                          fontSize="small"
                        >
                          {` ${capitalizeFirstLetter(
                            placeData?.paymentGatewayFeePayBy
                          )}`}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                      <MDBox
                        display="flex"
                        alignItems="center"
                        ml={-1}
                        sx={{
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                          fontSize="small"
                        >
                          Tax Applied On Service Fee :
                        </MDTypography>
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                          fontSize="small"
                        >
                          {` ${placeData?.applyTaxOnServiceFee ? "Yes" : "No"}`}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                      <MDBox
                        display="flex"
                        alignItems="center"
                        ml={-1}
                        sx={{
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                        >
                          Base rate :
                        </MDTypography>
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                        >
                          {`$ ${
                            props.values.amount !== null
                              ? props.values.amount
                              : 0
                          }`}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                      <MDBox
                        display="flex"
                        alignItems="center"
                        ml={-1}
                        sx={{
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                        >
                          {`State Tax ( ${get(placeData, "subscriptionSurcharge.stateTax", 0)}% ) :`}
                        </MDTypography>
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                        >
                          {props?.values.amount !== null &&
                          props?.values.amount !== undefined &&
                          props?.values.amount > 0
                            ? (() => {
                                const amount = parseFloat(props?.values.amount);
                                const taxPercentage =
                                  parseFloat(get(placeData, "subscriptionSurcharge.stateTax", 0)) || 0;
                                const isApplyTax = props?.values.isApplyTax;
                                const isApplyServiceFee =
                                  props?.values.isApplyServiceFee;
                                const isApplyTaxOnServiceFee = get(
                                  placeData,
                                  "applyTaxOnServiceFee",
                                  false
                                );
                                const response =
                                  calculateTotalAmountWithTaxAndFee({
                                    amount: amount * 100,
                                    serviceFee: serviceFee * 100,
                                    taxPercentage,
                                    isApplyTax,
                                    isApplyServiceFee,
                                    isApplyTaxOnServiceFee,
                                    placeData,
                                  });
                                return `$${amountToShow(response.tax)}`;
                              })()
                            : "$ 0"}
                        </MDTypography>
                      </MDBox>
                    </Grid>

                    {get(placeData, "subscriptionSurcharge.cityTax", 0) > 0 &&
                      <Grid item xs={12} md={12} lg={12}>
                        <MDBox
                          display="flex"
                          alignItems="center"
                          ml={-1}
                          sx={{
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <MDTypography
                            variant="button"
                            fontWeight="regular"
                            color="text"
                          >
                            {`City Tax ( ${get(placeData, "subscriptionSurcharge.cityTax", 0)}% ) :`}
                          </MDTypography>
                          <MDTypography
                            variant="button"
                            fontWeight="regular"
                            color="text"
                          >
                            {props?.values.amount !== null &&
                            props?.values.amount !== undefined &&
                            props?.values.amount > 0
                              ? (() => {
                                  const amount = parseFloat(props?.values.amount);
                                  const taxPercentage =
                                    parseFloat(get(placeData, "subscriptionSurcharge.cityTax", 0)) || 0;
                                  const isApplyTax = props?.values.isApplyTax;
                                  const isApplyServiceFee =
                                    props?.values.isApplyServiceFee;
                                  const isApplyTaxOnServiceFee = get(
                                    placeData,
                                    "applyTaxOnServiceFee",
                                    false
                                  );
                                  const response =
                                    calculateTotalAmountWithTaxAndFee({
                                      amount: amount * 100,
                                      serviceFee: serviceFee * 100,
                                      taxPercentage,
                                      isApplyTax,
                                      isApplyServiceFee,
                                      isApplyTaxOnServiceFee,
                                      placeData,
                                    });
                                  return `$${amountToShow(response.tax)}`;
                                })()
                              : "$ 0"}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                    }

                    {get(placeData, "subscriptionSurcharge.countyTax", 0) > 0 &&
                      <Grid item xs={12} md={12} lg={12}>
                        <MDBox
                          display="flex"
                          alignItems="center"
                          ml={-1}
                          sx={{
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <MDTypography
                            variant="button"
                            fontWeight="regular"
                            color="text"
                          >
                            {`County Tax ( ${get(placeData, "subscriptionSurcharge.countyTax", 0)}% ) :`}
                          </MDTypography>
                          <MDTypography
                            variant="button"
                            fontWeight="regular"
                            color="text"
                          >
                            {props?.values.amount !== null &&
                            props?.values.amount !== undefined &&
                            props?.values.amount > 0
                              ? (() => {
                                  const amount = parseFloat(props?.values.amount);
                                  const taxPercentage =
                                    parseFloat(get(placeData, "subscriptionSurcharge.countyTax", 0)) || 0;
                                  const isApplyTax = props?.values.isApplyTax;
                                  const isApplyServiceFee =
                                    props?.values.isApplyServiceFee;
                                  const isApplyTaxOnServiceFee = get(
                                    placeData,
                                    "applyTaxOnServiceFee",
                                    false
                                  );
                                  const response =
                                    calculateTotalAmountWithTaxAndFee({
                                      amount: amount * 100,
                                      serviceFee: serviceFee * 100,
                                      taxPercentage,
                                      isApplyTax,
                                      isApplyServiceFee,
                                      isApplyTaxOnServiceFee,
                                      placeData,
                                    });
                                  return `$${amountToShow(response.tax)}`;
                                })()
                              : "$ 0"}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                    }

                    <Grid item xs={12} md={12} lg={12}>
                      <MDBox
                        display="flex"
                        alignItems="center"
                        ml={-1}
                        sx={{
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                        >
                          Service Fee:
                        </MDTypography>
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                        >
                          {`$ ${
                            props.values.isApplyServiceFee ? serviceFee || 0 : 0
                          }`}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    {placeData?.paymentGatewayFeePayBy === "customer" && (
                      <Grid item xs={12} md={12} lg={12}>
                        <MDBox
                          display="flex"
                          alignItems="center"
                          ml={-1}
                          sx={{
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <MDTypography
                            variant="button"
                            fontWeight="regular"
                            color="text"
                          >
                            Payment Gateway Fee:
                          </MDTypography>
                          <MDTypography
                            variant="button"
                            fontWeight="regular"
                            color="text"
                          >
                            {props?.values.amount !== null &&
                            props?.values.amount !== undefined &&
                            props?.values.amount > 0
                              ? (() => {
                                  const amount = parseFloat(
                                    props?.values.amount
                                  );
                                  const taxPercentage =
                                    parseFloat(get(placeData, "subscriptionSurcharge.stateTax", 0));
                                  const cityTaxPercentage =
                                    parseFloat(get(placeData, "subscriptionSurcharge.cityTax", 0));
                                  const countyTaxPercentage =
                                    parseFloat(get(placeData, "subscriptionSurcharge.countyTax", 0));
                                  const isApplyTax = props?.values.isApplyTax;
                                  const isApplyServiceFee =
                                    props?.values.isApplyServiceFee;
                                  const isApplyTaxOnServiceFee = get(
                                    placeData,
                                    "applyTaxOnServiceFee",
                                    false
                                  );
                                  const calculation =
                                    calculateTotalAmountWithTaxAndFee({
                                      amount: amount * 100,
                                      serviceFee: serviceFee * 100,
                                      taxPercentage,
                                      cityTaxPercentage,
                                      countyTaxPercentage,
                                      isApplyTax,
                                      placeData,
                                      isApplyServiceFee,
                                      isApplyTaxOnServiceFee,
                                      paymentGatewayFeePayBy:
                                        placeData?.paymentGatewayFeePayBy,
                                    });

                                  return `$${amountToShow(
                                    calculation.paymentGatewayFee
                                  )}`;
                                })()
                              : "$ 0"}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                    )}

                    <Grid item xs={12} md={12} lg={12}>
                      <MDBox
                        display="flex"
                        alignItems="center"
                        ml={-1}
                        sx={{
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                        >
                          Total :
                        </MDTypography>
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                        >
                          {props?.values.amount !== null &&
                          props?.values.amount !== undefined &&
                          props?.values.amount > 0
                            ? (() => {
                                const amount = parseFloat(props?.values.amount);
                                const taxPercentage =
                                  parseFloat(get(placeData, "subscriptionSurcharge.stateTax", 0));
                                const cityTaxPercentage =
                                  parseFloat(get(placeData, "subscriptionSurcharge.cityTax", 0));
                                const countyTaxPercentage =
                                  parseFloat(get(placeData, "subscriptionSurcharge.countyTax", 0));
                                const isApplyTax = props?.values.isApplyTax;
                                const isApplyServiceFee =
                                  props?.values.isApplyServiceFee;
                                const isApplyTaxOnServiceFee = get(
                                  placeData,
                                  "applyTaxOnServiceFee",
                                  false
                                );
                                const response =
                                  calculateTotalAmountWithTaxAndFee({
                                    amount: amount * 100,
                                    serviceFee: serviceFee * 100,
                                    taxPercentage,
                                    cityTaxPercentage,
                                    countyTaxPercentage,
                                    isApplyTax,
                                    placeData,
                                    isApplyServiceFee,
                                    isApplyTaxOnServiceFee,
                                    paymentGatewayFeePayBy:
                                      placeData?.paymentGatewayFeePayBy,
                                  });
                                return `$${amountToShow(response.totalAmount)}`;
                              })()
                            : "$ 0"}
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    {props.values.durationType === "monthly" && (
                      <Grid item xs={12} md={12} lg={12}>
                        <MDBox
                          display="flex"
                          alignItems="center"
                          ml={-1}
                          sx={{
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <MDTypography
                            variant="button"
                            fontWeight="regular"
                            color="text"
                          >
                            {`Net payable for ${
                              dateInfo.daysLeftInMonth || 0
                            } days :`}
                          </MDTypography>
                          <MDTypography
                            variant="button"
                            fontWeight="regular"
                            color="text"
                          >
                            {props?.values.amount !== null &&
                            props?.values.startDateObj !== null &&
                            props?.values.amount > 0
                              ? (() => {
                                  const netPayable =
                                    (props.values?.amount /
                                      get(dateInfo, "daysInMonth", 0)) *
                                    get(dateInfo, "daysLeftInMonth", 0);

                                  setNetPayableAmount(netPayable);

                                  const taxPercentage =
                                    parseFloat(get(placeData, "subscriptionSurcharge.stateTax", 0));
                                  const cityTaxPercentage =
                                    parseFloat(get(placeData, "subscriptionSurcharge.cityTax", 0));
                                  const countyTaxPercentage =
                                    parseFloat(get(placeData, "subscriptionSurcharge.countyTax", 0));
                                  const isApplyTax = props?.values.isApplyTax;
                                  const isApplyServiceFee =
                                    props?.values.isApplyServiceFee;
                                  const isApplyTaxOnServiceFee = get(
                                    placeData,
                                    "applyTaxOnServiceFee",
                                    false
                                  );
                                  const response =
                                    calculateTotalAmountWithTaxAndFee({
                                      amount: netPayable * 100,
                                      serviceFee: serviceFee * 100,
                                      taxPercentage,
                                      cityTaxPercentage,
                                      countyTaxPercentage,
                                      isApplyTax,
                                      placeData,
                                      isApplyServiceFee,
                                      isApplyTaxOnServiceFee,
                                      paymentGatewayFeePayBy:
                                        placeData?.paymentGatewayFeePayBy,
                                    });
                                  return `$${amountToShow(
                                    response.totalAmount
                                  )}`;
                                })()
                              : "$ 0"}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                    )}
                  </Grid>

                  <Grid item xs={12} md={12} lg={12}>
                    <MDInput
                      name="message"
                      value={props.values.message}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Message"
                      error={
                        props.errors.message && props.touched.message
                          ? true
                          : false
                      }
                      success={
                        props.errors.message && props.touched.message
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.message && props.touched.message
                          ? props.errors.message
                          : null
                      }
                    />
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

export default CreateSubscription;
