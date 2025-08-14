import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  Card,
  Icon,
  IconButton,
} from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup"; // Import Yup for validation
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
import { getPlaces } from "store/slice/places/placeSlice";
import { setSelectedPlace } from "store/slice/places/placeSlice";

// Define the validation schema
const validationSchema = Yup.object().shape({
  percentage: Yup.number()
    .min(0, "Percentage must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("percentage is required!"),
  fixedCents: Yup.number()
    .min(0, "Fixed Cents must be at least 0")
    .max(500, "Please enter value under 500!")
    .required("Fixed Cents are required!")
});

const PaymentGatewayFeeCard = (props) => {
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
        "percentage",
        get(selectedPlace, "merchantFee.percentage", 2.9)
      );
      formikRef?.current?.setFieldValue(
        "fixedCents",
        get(selectedPlace, "merchantFee.fixedCents", 30)
      );
    }
  }, [selectedPlace]);

  const handelMerchantFeeUpdate = (rest) => {
    const type = "UPDATE";
    setIsLoading(true);
    const merchantFee = {
      percentage: rest.percentage,
      fixedCents: rest.fixedCents
    }

    dispatch(updatePlace({ placeId, type, merchantFee }))
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
							percentage: 1,
							fixedCents: 1
            }}
            validationSchema={validationSchema}
            onSubmit={(value, action) => {
              console.log("values", value);
              handelMerchantFeeUpdate(value);
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
                      Payment Gateway Fee
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

									{paymentEdit && (
										<Grid item xs={12}>
											<div className="d-flex justify-content-between align-items-center">
												<MDTypography variant="subtitle2" style={{minWidth: "120px"}}>
													Percentage:
												</MDTypography>
												<MDInput
													inputProps={{
														type: "float",
														min: 0,
														max: 100,
													}}
													name={`percentage`}
                          required
													value={props.values.percentage}
													onChange={props.handleChange}
													onBlur={props.handleBlur}
                          error={props.errors.percentage && props.touched.percentage}
                          success={
                            !props.errors.percentage && props.touched.percentage
                          }
                          helperText={
                            props.errors.percentage &&
                            props.touched.percentage &&
                            props.errors.percentage
                          }
												/>
											</div>
											<div className="d-flex justify-content-between align-items-center">
												<MDTypography variant="subtitle2" style={{minWidth: "120px"}}>
													Fixed Cents:
												</MDTypography>
												<MDInput
													inputProps={{
														type: "number",
														min: 0,
														max: 500,
													}}
													name={`fixedCents`}
                          required
													value={props.values.fixedCents}
													onChange={props.handleChange}
													onBlur={props.handleBlur}
                          error={props.errors.fixedCents && props.touched.fixedCents}
                          success={
                            !props.errors.fixedCents && props.touched.fixedCents
                          }
                          helperText={
                            props.errors.fixedCents &&
                            props.touched.fixedCents &&
                            props.errors.fixedCents
                          }
												/>
											</div>
										</Grid>
									)}
                  {!paymentEdit && (
										<Grid item xs={12} className="d-flex justify-content-between align-items-center">
											<MDTypography variant="subtitle2">
												{`Percentage: ${props.values.percentage}%`}
											</MDTypography>
											<MDTypography variant="subtitle2">
												{`Fixed Cents: ${props.values.fixedCents}`}
											</MDTypography>
										</Grid>
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

export default PaymentGatewayFeeCard;
