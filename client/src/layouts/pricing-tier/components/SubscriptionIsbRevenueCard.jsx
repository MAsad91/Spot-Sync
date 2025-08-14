import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  Card,
  Icon,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { Formik } from "formik";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { get, isEmpty } from "lodash";
import { updatePlace } from "store/slice/places/placeSlice";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import MDDropDown from "components/MDDropDown";
import { getPlaces } from "store/slice/places/placeSlice";
import { setSelectedPlace } from "store/slice/places/placeSlice";
import { formateValue } from "global/functions";

const SubscriptionSpotsyncRevenueCard = (props) => {
  const { userRole } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const formikRef = useRef(null);
  const [paymentEdit, setPaymentEdit] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  let placeId =
    selectedPlace?._id || new URLSearchParams(location?.search).get("placeId");

  useEffect(() => {
    if (!isEmpty(selectedPlace)) {
      formikRef?.current?.setFieldValue(
        "placeId",
        get(selectedPlace, "_id", null)
      );
      formikRef?.current?.setFieldValue(
        "subscriptionSpotsyncRevenue",
        get(selectedPlace, "subscriptionSpotsyncRevenue", 0)
      );
      formikRef?.current?.setFieldValue(
        "subscriptionSpotsyncRevenueType",
        get(selectedPlace, "subscriptionSpotsyncRevenueType", "fixed")
      );
      formikRef?.current?.setFieldValue(
        "subscriptionSpotsyncRevenuePercentOf",
        get(selectedPlace, "subscriptionSpotsyncRevenuePercentOf", "amount")
      );
    }
  }, [selectedPlace]);

  const handelPaymentFeeUpdate = (rest) => {
    const type = "UPDATE";
    setIsLoading(true);
    dispatch(updatePlace({ placeId, type, ...rest }))
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
          await dispatch(getPlaces());
          await dispatch(setSelectedPlace(res?.updatedPlaceData));
          setPaymentEdit(false);
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

  return (
    <>
      <Card sx={{ boxShadow: 3 }}>
        <MDBox p={2}>
          <Formik
            innerRef={formikRef}
            initialValues={{
              subscriptionSpotsyncRevenue: 0,
              subscriptionSpotsyncRevenueType: "fixed",
              subscriptionSpotsyncRevenuePercentOf: "",
            }}
            onSubmit={(value, action) => {
              console.log("values", value);
              handelPaymentFeeUpdate(value);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={paymentEdit ? 1 : 0} height={paymentEdit ? null : 100}>
                  <Grid item xs={12} container alignItems="center">
                    <MDTypography
                      color="dark"
                      display="block"
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ flex: 1 }}
                    >
                      Subscription Spotsync Revenue
                    </MDTypography>
                    {!paymentEdit && userRole === 100 && (
                      <IconButton
                        onClick={() => {
                          setPaymentEdit(true);
                        }}
                        color="secondary"
                      >
                        <Icon fontSize="small" title="Edit">
                          editable
                        </Icon>
                      </IconButton>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <RadioGroup
                      name="subscriptionSpotsyncRevenueType"
                      sx={{ flexDirection: "row" }}
                                              value={props.values.subscriptionSpotsyncRevenueType}
                      onChange={(e) =>
                                                  props.setFieldValue(
                            "subscriptionSpotsyncRevenueType",
                          e.target.value
                        )
                      }
                    >
                      <FormControlLabel
                        value="fixed"
                        control={<Radio />}
                        label="Fixed"
                        disabled={!paymentEdit}
                      />
                      <FormControlLabel
                        value="percentage"
                        control={<Radio />}
                        label="Percentage"
                        disabled={!paymentEdit}
                      />
                    </RadioGroup>
                  </Grid>

                                        {props.values.subscriptionSpotsyncRevenueType ===
                    "percentage" && (
                    <>
                      <Grid
                        item
                        xs={12}
                        md={paymentEdit ? 6 : 4}
                        py={paymentEdit ? 2 : 0}
                      >
                        {paymentEdit ? (
                          <>
                            <FormControl fullWidth>
                              <InputLabel id="demo-simple-select-label">
                                Percent OF
                              </InputLabel>
                              <MDDropDown
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                name="subscriptionSpotsyncRevenuePercentOf"
                                                                  value={
                                    props.values.subscriptionSpotsyncRevenuePercentOf
                                  }
                                                                  label="Spotsync Revenue Type"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                error={
                                  props.errors
                                    .subscriptionSpotsyncRevenuePercentOf &&
                                  props.touched.subscriptionSpotsyncRevenuePercentOf
                                    ? true
                                    : false
                                }
                                success={
                                  props.errors
                                    .subscriptionSpotsyncRevenuePercentOf &&
                                  props.touched.subscriptionSpotsyncRevenuePercentOf
                                    ? false
                                    : true
                                }
                                helperText={
                                  props.errors
                                    .subscriptionSpotsyncRevenuePercentOf &&
                                  props.touched.subscriptionSpotsyncRevenuePercentOf
                                    ? props.errors
                                        .subscriptionSpotsyncRevenuePercentOf
                                    : null
                                }
                              >
                                <MenuItem value={"baseRate"}>
                                  Base Rate
                                </MenuItem>
                                <MenuItem value={"serviceFee"}>
                                  Service Fee
                                </MenuItem>
                                <MenuItem value={"totalAmount"}>
                                  Total Amount
                                </MenuItem>
                              </MDDropDown>
                            </FormControl>
                          </>
                        ) : (
                          <>
                            <MDTypography variant="subtitle2"></MDTypography>
                          </>
                        )}
                      </Grid>
                    </>
                  )}

                  <Grid
                    item
                    xs={12}
                    md={paymentEdit ? 6 : 8}
                    py={paymentEdit ? 2 : 0}
                  >
                    {paymentEdit ? (
                      <MDInput
                        name="subscriptionSpotsyncRevenue"
                        value={props.values.subscriptionSpotsyncRevenue}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        label={`Spotsync Revenue (${
                          props.values.subscriptionSpotsyncRevenueType ===
                          "percentage"
                            ? "%"
                            : "$"
                        }) `}
                        error={
                          props.errors.subscriptionSpotsyncRevenue &&
                          props.touched.subscriptionSpotsyncRevenue
                            ? true
                            : false
                        }
                        success={
                          props.errors.subscriptionSpotsyncRevenue &&
                          props.touched.subscriptionSpotsyncRevenue
                            ? false
                            : true
                        }
                        helperText={
                          props.errors.subscriptionSpotsyncRevenue &&
                          props.touched.subscriptionSpotsyncRevenue
                            ? props.errors.subscriptionSpotsyncRevenue
                            : null
                        }
                      />
                    ) : (
                      <MDTypography variant="subtitle2"></MDTypography>
                    )}
                  </Grid>
                  {!paymentEdit && (
                    <>
                      <MDTypography variant="subtitle2">
                        {props.values.subscriptionSpotsyncRevenueType ===
                        "percentage"
                          ? `${
                              props.values.subscriptionSpotsyncRevenue
                            } % of ${formateValue(
                              props.values.subscriptionSpotsyncRevenuePercentOf
                            )} `
                          : `Spotsync Revenue $${props.values.subscriptionSpotsyncRevenue}`}
                      </MDTypography>
                    </>
                  )}
                  <Grid
                    xs={12}
                    item
                    gap={2}
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    {paymentEdit && (
                      <>
                        <MDButton
                          color={sidenavColor}
                          variant="contained"
                          onClick={() => setPaymentEdit(false)}
                        >
                          Cancel
                        </MDButton>
                        <MDButton
                          color={sidenavColor}
                          variant="contained"
                          type="submit"
                        >
                          Save
                        </MDButton>
                      </>
                    )}
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </MDBox>
      </Card>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Updating Pricing.. "
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
    </>
  );
};

export default SubscriptionSpotsyncRevenueCard;
