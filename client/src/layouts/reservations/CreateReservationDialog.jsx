import React, { useState, useEffect } from "react";
import {
  DialogContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import CircularIndeterminate from "components/MDLoading";
import { useDispatch, useSelector } from "react-redux";
import { useMaterialUIController } from "context";
import { createReservation } from "store/slice/reservation/reservationSlice";
import { getRatesByPlaceId } from "store/slice/reservation/reservationSlice";
import { amountToShow } from "global/functions";
import moment from "moment";

const validationSchema = Yup.object()
  .shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    email: Yup.string().email("Please enter a valid Email"),
    mobile: Yup.string(),
    licensePlate: Yup.string().required("License Plate is required"),
    rateId: Yup.string().required("Rate is required"),
    hours: Yup.number().min(1, "Hours must be at least 1").max(24, "Hours cannot exceed 24"),
    paymentMethodType: Yup.string().required("Payment method is required"),
    message: Yup.string(),
  })
  .test(
    "email-or-mobile",
    "Either Email or Mobile is required",
    (value) => value.email || value.mobile
  )
  .test(
    "hours-required-for-hourly",
    "Hours is required for hourly rates",
    function(value) {
      // Get the selected rate to check if it's hourly
      const rates = this.options.context?.rates || [];
      const selectedRate = rates.find(rate => rate._id === value.rateId);
      
      if (selectedRate?.rateType === "hourly") {
        return value.hours && value.hours >= 1;
      }
      return true; // Not required for non-hourly rates
    }
  )
  .test(
    "payment-method-required-for-paid-rates",
    "Payment method is required for paid rates",
    function(value) {
      // Get the selected rate to check if it's free
      const rates = this.options.context?.rates || [];
      const selectedRate = rates.find(rate => rate._id === value.rateId);
      
      if (selectedRate?.isFreeRate) {
        return true; // Not required for free rates
      }
      return value.paymentMethodType && value.paymentMethodType.length > 0;
    }
  );

const CreateReservation = ({ dialogOpen, onClose, placeData, onSuccess }) => {
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);

  useEffect(() => {
    if (dialogOpen && placeData?._id) {
      fetchRates();
    }
  }, [dialogOpen, placeData]);

  const fetchRates = async () => {
    try {
      const response = await dispatch(getRatesByPlaceId(placeData._id));
      if (response.payload?.success) {
        setRates(response.payload.data);
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
    }
  };

         const calculateAmount = (rate, hours) => {
         if (!rate) return 0;
         
         let amount = rate.amount || 0;
         
         // Handle different rate types
         if (rate.rateType === "hourly") {
           // For hourly rates, multiply by hours
           amount = amount * (hours || 1);
         } else if (rate.rateType === "daily") {
           // For daily rates, use the rate amount as is (it's already for the full day)
           amount = amount;
         } else if (rate.rateType === "custom") {
           // For custom rates, use the rate amount as is
           amount = amount;
         } else {
           // For other rate types (all_day, overnight, etc.), use the rate amount as is
           amount = amount;
         }
         
         return amount;
       };

  const handleRateChange = (rateId, hours) => {
    const rate = rates.find(r => r._id === rateId);
    setSelectedRate(rate);

    if (rate) {
      const amount = calculateAmount(rate, hours);
      setCalculatedAmount(amount);
    }
  };

    const handleCreateReservation = (data) => {
    setIsLoading(true);
    dispatch(createReservation(data))
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

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    licensePlate: "",
    rateId: "",
    hours: 1,
    paymentMethodType: "card",
    message: "",
  };

    return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Creating Reservation.. "
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
        dialogTitle="Create New Reservation"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >

              <DialogContent>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            context={{ rates }}
            onSubmit={(values, actions) => {
              handleCreateReservation({
                ...values,
                placeId: placeData._id,
                totalAmount: calculatedAmount,
              });
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
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
                      name="licensePlate"
                      value={props.values.licensePlate}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="License Plate"
                      error={
                        props.errors.licensePlate && props.touched.licensePlate
                          ? true
                          : false
                      }
                      success={
                        props.errors.licensePlate && props.touched.licensePlate
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.licensePlate && props.touched.licensePlate
                          ? props.errors.licensePlate
                          : null
                      }
                    />
                  </Grid>

                  {/* Rate Selection */}
                                       <Grid item xs={12} md={6}>
                       <FormControl fullWidth>
                         <InputLabel>Select Rate</InputLabel>
                         <Select
                           name="rateId"
                           value={props.values.rateId}
                           onChange={(e) => {
                             props.handleChange(e);
                             handleRateChange(e.target.value, props.values.hours);
                           }}
                           error={props.errors.rateId && props.touched.rateId}
                         >
                           {rates.map((rate) => (
                             <MenuItem key={rate._id} value={rate._id}>
                               {rate.displayName || rate.title} - ${amountToShow(rate.amount || 0)}
                               {rate.rateType === "hourly" && " /hr"}
                               {rate.rateType === "daily" && " /day"}
                               {rate.rateType === "all_day" && " (All Day)"}
                               {rate.rateType === "overnight" && " (Overnight)"}
                             </MenuItem>
                           ))}
                         </Select>
                       </FormControl>
                     </Grid>

                     {/* Show hours field only for hourly rates */}
                     {selectedRate?.rateType === "hourly" && (
                       <Grid item xs={12} md={6}>
                         <MDInput
                           name="hours"
                           value={props.values.hours}
                           onChange={(e) => {
                             props.handleChange(e);
                             handleRateChange(props.values.rateId, e.target.value);
                           }}
                           onBlur={props.handleBlur}
                           label="Hours"
                           type="number"
                           error={
                             props.errors.hours && props.touched.hours
                               ? true
                               : false
                           }
                           success={
                             props.errors.hours && props.touched.hours
                               ? false
                               : true
                           }
                           helperText={
                             props.errors.hours && props.touched.hours
                               ? props.errors.hours
                               : null
                           }
                           inputProps={{ min: 1, max: 24 }}
                         />
                       </Grid>
                     )}

                  {/* Payment Method */}
                  {!selectedRate?.isFreeRate && (
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
                        <FormControlLabel
                          value="card"
                          control={<Radio color="primary" />}
                          label="Card Payment (Send Payment Link)"
                        />
                        <FormControlLabel
                          value="cash"
                          control={<Radio />}
                          label="Cash Payment (Collect Now)"
                        />
                      </RadioGroup>
                    </Grid>
                  )}

                  {/* Amount Display */}
                  {calculatedAmount > 0 && (
                    <Grid item xs={12}>
                      <MDBox
                        sx={{
                          p: 2,
                          bgcolor: "primary.light",
                          borderRadius: 1,
                          textAlign: "center",
                        }}
                      >
                        <MDTypography variant="h5" color="white" fontWeight="bold">
                          Total Amount: ${amountToShow(calculatedAmount)}
                        </MDTypography>
                        {selectedRate?.isFreeRate && (
                          <MDTypography variant="body2" color="white" mt={1}>
                            Free Rate - No Payment Required
                          </MDTypography>
                        )}
                        {selectedRate?.isPass && (
                          <MDTypography variant="body2" color="white" mt={1}>
                            Pass Rate - Special Pricing
                          </MDTypography>
                        )}
                      </MDBox>
                    </Grid>
                  )}

                  {/* Free Rate Message */}
                  {selectedRate?.isFreeRate && calculatedAmount === 0 && (
                    <Grid item xs={12}>
                      <MDBox
                        sx={{
                          p: 2,
                          bgcolor: "success.light",
                          borderRadius: 1,
                          textAlign: "center",
                        }}
                      >
                        <MDTypography variant="h6" color="white" fontWeight="bold">
                          Free Rate - No Payment Required
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  )}

                  {/* Message */}
                  <Grid item xs={12}>
                    <MDInput
                      name="message"
                      value={props.values.message}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Message (Optional)"
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

export default CreateReservation; 