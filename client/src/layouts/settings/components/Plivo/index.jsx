import { useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import { Formik } from "formik";
import MDButton from "components/MDButton";
import { grey } from "@mui/material/colors";
// PMS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useMaterialUIController } from "context";

import MDSnackbar from "components/MDSnackbar";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getPlaceById } from "store/slice/places/placeSlice";
import { assignSetting } from "store/slice/places/placeSlice";
import { getPlivos } from "store/slice/plivo/plivoSlice";
import { get } from "lodash";
import { mobileNumberMasking } from "global/functions";
import { setPlivos } from "store/slice/plivo/plivoSlice";
import { setSinglePlace } from "store/slice/places/placeSlice";
import { setSelectedPlace } from "store/slice/places/placeSlice";

function Plivo() {
  const formikRef = useRef(null);
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const color = grey[900];
  const dispatch = useDispatch();
  const location = useLocation();
  const placesData = useSelector((state) => state.places?.selectedPlace);
  const plivos = useSelector((state) => state.plivos?.plivos);
  const singlePlace = useSelector((state) => state.places?.singlePlace);

  let placeId =
    placesData?._id || new URLSearchParams(location?.search).get("placeId");

  const [plivoNumbers, setPlivoNumbers] = useState([]);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  useEffect(() => {
    getPlivo();
    getPlaceData();
  }, [placesData?._id]);

  useEffect(() => {
    if (!singlePlace?.plivoId?.number) {
      return;
    }

    formikRef?.current?.setFieldValue(
      "plivoNumber",
      singlePlace?.plivoId?.number
    );
  }, [singlePlace]);

  function getPlaceData() {
    if (singlePlace?.plivoId) {
      formikRef?.current?.setFieldValue(
        "plivoNumber",
        get(singlePlace?.plivoId, "number", null)
      );
      formikRef?.current?.setFieldValue(
        "plivoId",
        get(singlePlace?.plivoId, "_id", "")
      );
    } else {
      dispatch(getPlaceById(placeId))
        .unwrap()
        .then((res) => {
          if (res?.success) {
            formikRef?.current?.setFieldValue(
              "plivoNumber",
              get(res?.place, "plivoNumber", null)
            );
            formikRef?.current?.setFieldValue(
              "plivoId",
              get(res?.place?.plivoId, "_id", "")
            );

            dispatch(setSinglePlace(res?.place));
          }
        });
    }
  }

  function getPlivo() {
    if (plivos && plivos.length < 1) {
      dispatch(getPlivos(placeId))
        .unwrap()
        .then((res) => {
          if (res?.success) {
            setPlivoNumbers(res?.plivos);
            dispatch(setPlivos(res?.plivos));
          }
        });
    } else {
      setPlivoNumbers(plivos);
    }
  }

  const handlePlivoNumberSubmit = (value) => {
    dispatch(assignSetting({ placeId, ...value }))
      .unwrap()
      .then((res) => {
        const success = res?.success;
        if (success) {
          dispatch(getPlaceById(placeId))
            .unwrap()
            .then((res) => {
              if (res?.success) {
                dispatch(setSelectedPlace(res?.place));
              }
            });
        }
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
      })
      .catch((err) => {
        console.error("Error creating:", err);
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
    <MDBox>
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />
      <Formik
        innerRef={formikRef}
        initialValues={{
          plivoNumber: null,
          plivoId: "",
        }}
        // validationSchema={plivoNumberValidationSchema}
        onSubmit={(value, action) => {
          console.log("value ===>", value);
          handlePlivoNumberSubmit(value);
        }}
      >
        {({ values, setFieldValue, errors, handleSubmit }) => (
          <form onSubmit={handleSubmit} component="fieldset">
            <Grid container spacing={2} className="mt-1">
              {plivoNumbers?.map((n, i) => (
                <Grid item xs={12} md={3} lg={3} key={i}>
                  <MDBox
                    fontSize="12px"
                    mb={1.5}
                    sx={{
                      color: "primary.contrastText",
                      p: 2,
                      borderRadius: "16px",
                    }}
                    onClick={() => {
                      setFieldValue("plivoNumber", n.number);
                      setFieldValue("plivoId", n._id);
                    }}
                    bgColor={
                      n.number == values?.plivoNumber ? sidenavColor : color
                    }
                    display="flex"
                    justifyContent="center"
                  >
                    {n.number}
                    {/* {mobileNumberMasking(n.number)} */}
                  </MDBox>
                </Grid>
              ))}
              <Grid item xs={12} className="text-right">
                <MDTypography
                  display="block"
                  variant="span"
                  color="error"
                  sx={{ mb: 2 }}
                >
                  {errors?.plivoNumber}
                </MDTypography>
                <MDButton
                  variant="contained"
                  disabled={!values?.plivoNumber}
                  color={sidenavColor}
                  type="submit"
                >
                  Submit
                </MDButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </MDBox>
  );
}

export default Plivo;
