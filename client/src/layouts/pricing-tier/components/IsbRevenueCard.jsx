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

const IsbRevenueCard = (props) => {
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
        "isbpRevenue",
        get(selectedPlace, "isbpRevenue", 0)
      );
      formikRef?.current?.setFieldValue(
        "isbpRevenueType",
        get(selectedPlace, "isbpRevenueType", "fixed")
      );
      formikRef?.current?.setFieldValue(
        "isbpRevenuePercentOf",
        get(selectedPlace, "isbpRevenuePercentOf", "baseRate")
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
              isbpRevenue: 0,
              isbpRevenueType: "fixed",
              isbpRevenuePercentOf: "",
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
                      Spotsync Revenue
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
                      name="isbpRevenueType"
                      sx={{ flexDirection: "row" }}
                      value={props.values.isbpRevenueType}
                      onChange={(e) =>
                        props.setFieldValue("isbpRevenueType", e.target.value)
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

                  {props.values.isbpRevenueType === "percentage" && (
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
                                name="isbpRevenuePercentOf"
                                value={props.values.isbpRevenuePercentOf}
                                label="ISBParking Revenue Type"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                error={
                                  props.errors.isbpRevenuePercentOf &&
                                  props.touched.isbpRevenuePercentOf
                                    ? true
                                    : false
                                }
                                success={
                                  props.errors.isbpRevenuePercentOf &&
                                  props.touched.isbpRevenuePercentOf
                                    ? false
                                    : true
                                }
                                helperText={
                                  props.errors.isbpRevenuePercentOf &&
                                  props.touched.isbpRevenuePercentOf
                                    ? props.errors.isbpRevenuePercentOf
                                    : null
                                }
                              >
                                <MenuItem value={"baseRate"}>Base Rate</MenuItem>
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
                        name="isbpRevenue"
                        value={props.values.isbpRevenue}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        label={`ISBParking Revenue (${
                          props.values.isbpRevenueType === "percentage"
                            ? "%"
                            : "$"
                        }) `}
                        error={
                            props.errors.isbpRevenue && props.touched.isbpRevenue
                            ? true
                            : false
                        }
                        success={
                          props.errors.isbpRevenue && props.touched.isbpRevenue
                            ? false
                            : true
                        }
                        helperText={
                          props.errors.isbpRevenue && props.touched.isbpRevenue
                            ? props.errors.isbpRevenue
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
                        {props.values.isbpRevenueType === "percentage"
                          ? `${props.values.isbpRevenue} % of ${formateValue(
                              props.values.isbpRevenuePercentOf
                            )} `
                          : `ISBParking Revenue $${props.values.isbpRevenue}`}
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

export default IsbRevenueCard;
