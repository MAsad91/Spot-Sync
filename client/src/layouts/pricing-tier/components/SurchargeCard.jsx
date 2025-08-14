import React, { useEffect, useRef, useState } from "react";
import { Grid, Card, Icon, IconButton } from "@mui/material";
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
  tax: Yup.number()
    .min(0, "Tax must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("Tax is required!"),
  cityTax: Yup.number()
    .min(0, "City Tax must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("City Tax is required!"),
  countyTax: Yup.number()
    .min(0, "County Tax must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("County Tax is required!"),
});

const SurchargeCard = (props) => {
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
      formikRef?.current?.setFieldValue("tax", get(selectedPlace, "tax", 0));
      formikRef?.current?.setFieldValue(
        "cityTax",
        get(selectedPlace, "cityTax", 0)
      );
      formikRef?.current?.setFieldValue(
        "countyTax",
        get(selectedPlace, "countyTax", 0)
      );
    }
  }, [selectedPlace]);

  const handelTaxFeeUpdate = (rest) => {
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
              tax: 1,
              cityTax: 1,
              countyTax: 1,
            }}
            validationSchema={validationSchema}
            onSubmit={(value, action) => {
              console.log("values", value);
              handelTaxFeeUpdate(value);
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
                      Transient Tax
                    </MDTypography>
                    {!paymentEdit && (
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
                        <MDTypography
                          variant="subtitle2"
                          style={{ minWidth: "120px" }}
                        >
                          State Tax:
                        </MDTypography>
                        <MDInput
                          name="tax"
                          value={props.values.tax}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          error={props.errors.tax && props.touched.tax}
                          success={!props.errors.tax && props.touched.tax}
                          helperText={
                            props.errors.tax &&
                            props.touched.tax &&
                            props.errors.tax
                          }
                        />
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <MDTypography
                          variant="subtitle2"
                          style={{ minWidth: "120px" }}
                        >
                          City Tax:
                        </MDTypography>
                        <MDInput
                          name="cityTax"
                          value={props.values.cityTax}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          error={props.errors.cityTax && props.touched.cityTax}
                          success={
                            !props.errors.cityTax && props.touched.cityTax
                          }
                          helperText={
                            props.errors.cityTax &&
                            props.touched.cityTax &&
                            props.errors.cityTax
                          }
                        />
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <MDTypography
                          variant="subtitle2"
                          style={{ minWidth: "120px" }}
                        >
                          County Tax:
                        </MDTypography>
                        <MDInput
                          name="countyTax"
                          value={props.values.countyTax}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          error={
                            props.errors.countyTax && props.touched.countyTax
                          }
                          success={
                            !props.errors.countyTax && props.touched.countyTax
                          }
                          helperText={
                            props.errors.countyTax &&
                            props.touched.countyTax &&
                            props.errors.countyTax
                          }
                        />
                      </div>
                    </Grid>
                  )}

                  {!paymentEdit && (
                    <Grid
                      item
                      xs={12}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <MDTypography variant="subtitle2">
                        {`State Tax: ${props.values.tax}%`}
                      </MDTypography>
                      <MDTypography variant="subtitle2">
                        {`City Tax: ${props.values.cityTax}%`}
                      </MDTypography>
                      <MDTypography variant="subtitle2">
                        {`County Tax: ${props.values.countyTax}%`}
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

export default SurchargeCard;
