import React, { useEffect, useRef, useState } from "react";
import { Grid, Card, Icon, IconButton } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
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

// Pakistani Tax Validation Schema
const pakistaniTaxValidationSchema = Yup.object().shape({
  gst: Yup.number()
    .min(0, "GST must be at least 0")
    .max(100, "GST should be maximum 100%")
    .required("GST is required!"),
  federalExciseDuty: Yup.number()
    .min(0, "Federal Excise Duty must be at least 0")
    .max(100, "Federal Excise Duty should be maximum 100%")
    .required("Federal Excise Duty is required!"),
  provincialTax: Yup.number()
    .min(0, "Provincial Tax must be at least 0")
    .max(100, "Provincial Tax should be maximum 100%")
    .required("Provincial Tax is required!"),
  withholdingTax: Yup.number()
    .min(0, "Withholding Tax must be at least 0")
    .max(100, "Withholding Tax should be maximum 100%")
    .required("Withholding Tax is required!"),
});

const PakistaniTaxCard = (props) => {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const formikRef = useRef(null);
  const [taxEdit, setTaxEdit] = useState(false);
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
      formikRef?.current?.setFieldValue("gst", get(selectedPlace, "gst", 17));
      formikRef?.current?.setFieldValue(
        "federalExciseDuty",
        get(selectedPlace, "federalExciseDuty", 0)
      );
      formikRef?.current?.setFieldValue(
        "provincialTax",
        get(selectedPlace, "provincialTax", 0)
      );
      formikRef?.current?.setFieldValue(
        "withholdingTax",
        get(selectedPlace, "withholdingTax", 0)
      );
    }
  }, [selectedPlace]);

  const handlePakistaniTaxUpdate = (values) => {
    const type = "UPDATE";
    setIsLoading(true);
    dispatch(updatePlace({ placeId, type, ...values }))
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
          setTaxEdit(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setNotification({
          ...notification,
          color: "error",
          title: "Error",
          content: err?.message || "Something went wrong!",
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
              placeId: "",
              gst: 17,
              federalExciseDuty: 0,
              provincialTax: 0,
              withholdingTax: 0,
            }}
            validationSchema={pakistaniTaxValidationSchema}
            onSubmit={handlePakistaniTaxUpdate}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={taxEdit ? 1 : 0} height={taxEdit ? null : 140}>
                  <Grid item xs={12} container alignItems="center">
                    <MDTypography
                      color="dark"
                      display="block"
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ flex: 1 }}
                    >
                      Pakistani Tax Settings
                    </MDTypography>
                    {!taxEdit && (
                      <IconButton
                        onClick={() => {
                          setTaxEdit(true);
                        }}
                        color="secondary"
                      >
                        <Icon fontSize="small" title="Edit">
                          editable
                        </Icon>
                      </IconButton>
                    )}
                  </Grid>

                  {taxEdit && (
                    <Grid item xs={12}>
                      <div className="d-flex justify-content-between align-items-center">
                        <MDTypography
                          variant="subtitle2"
                          style={{ minWidth: "120px" }}
                        >
                          GST:
                        </MDTypography>
                        <MDInput
                          name="gst"
                          value={props.values.gst}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          error={props.errors.gst && props.touched.gst}
                          success={!props.errors.gst && props.touched.gst}
                          helperText={
                            props.errors.gst &&
                            props.touched.gst &&
                            props.errors.gst
                          }
                        />
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <MDTypography
                          variant="subtitle2"
                          style={{ minWidth: "120px" }}
                        >
                          Federal Excise Duty:
                        </MDTypography>
                        <MDInput
                          name="federalExciseDuty"
                          value={props.values.federalExciseDuty}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          error={props.errors.federalExciseDuty && props.touched.federalExciseDuty}
                          success={!props.errors.federalExciseDuty && props.touched.federalExciseDuty}
                          helperText={
                            props.errors.federalExciseDuty &&
                            props.touched.federalExciseDuty &&
                            props.errors.federalExciseDuty
                          }
                        />
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <MDTypography
                          variant="subtitle2"
                          style={{ minWidth: "120px" }}
                        >
                          Provincial Tax:
                        </MDTypography>
                        <MDInput
                          name="provincialTax"
                          value={props.values.provincialTax}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          error={props.errors.provincialTax && props.touched.provincialTax}
                          success={!props.errors.provincialTax && props.touched.provincialTax}
                          helperText={
                            props.errors.provincialTax &&
                            props.touched.provincialTax &&
                            props.errors.provincialTax
                          }
                        />
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <MDTypography
                          variant="subtitle2"
                          style={{ minWidth: "120px" }}
                        >
                          Withholding Tax:
                        </MDTypography>
                        <MDInput
                          name="withholdingTax"
                          value={props.values.withholdingTax}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          error={props.errors.withholdingTax && props.touched.withholdingTax}
                          success={!props.errors.withholdingTax && props.touched.withholdingTax}
                          helperText={
                            props.errors.withholdingTax &&
                            props.touched.withholdingTax &&
                            props.errors.withholdingTax
                          }
                        />
                      </div>
                    </Grid>
                  )}

                  {!taxEdit && (
                    <Grid item xs={12}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <MDTypography variant="subtitle2">
                            {`GST: ${props.values.gst}%`}
                          </MDTypography>
                        </Grid>
                        <Grid item xs={6}>
                          <MDTypography variant="subtitle2">
                            {`Federal Excise Duty: ${props.values.federalExciseDuty}%`}
                          </MDTypography>
                        </Grid>
                        <Grid item xs={6}>
                          <MDTypography variant="subtitle2">
                            {`Provincial Tax: ${props.values.provincialTax}%`}
                          </MDTypography>
                        </Grid>
                        <Grid item xs={6}>
                          <MDTypography variant="subtitle2">
                            {`Withholding Tax: ${props.values.withholdingTax}%`}
                          </MDTypography>
                        </Grid>
                      </Grid>
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
                    {taxEdit && (
                      <>
                        <MDButton
                          color={sidenavColor}
                          variant="contained"
                          onClick={() => setTaxEdit(false)}
                        >
                          Cancel
                        </MDButton>
                        <MDButton
                          color={sidenavColor}
                          variant="contained"
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading ? <CircularIndeterminate /> : "Save"}
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
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        onClose={notification.close}
        close={() => setNotification({ ...notification, show: false })}
        bgWhite
      />
    </>
  );
};

export default PakistaniTaxCard; 