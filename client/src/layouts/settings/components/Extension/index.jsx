// @mui material components
import { Autocomplete, Switch } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useRef, useState, useEffect } from "react";
// PMS components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import { Formik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { assignSetting } from "store/slice/places/placeSlice";
import MDSnackbar from "components/MDSnackbar";
import { getPlaceById } from "store/slice/places/placeSlice";
import { setSinglePlace } from "store/slice/places/placeSlice";
import { setSelectedPlace } from "store/slice/places/placeSlice";

function Extension() {
  const [controller] = useMaterialUIController();

  const { sidenavColor } = controller;
  const formikRef = useRef(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const placesData = useSelector((state) => state.places?.selectedPlace);
  let placeId =
    placesData?._id || new URLSearchParams(location?.search).get("placeId");
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  console.log("placeData ===>", placesData);

  useEffect(() => {
    getPlace();
  }, [placesData?._id]);

  function getPlace() {
    if (placesData?.isExtensionEnable) {
      console.log("ENtewrrrrrrr");
      formikRef?.current?.setFieldValue(
        "extensionExpireLimit",
        placesData?.extensionExpireLimit
      );
      formikRef?.current?.setFieldValue(
        "isExtensionEnable",
        placesData?.isExtensionEnable
      );
      return;
    }
  }

  const handleExtensionSubmit = (value) => {
    console.log("data ==========>", value);
    dispatch(assignSetting({ placeId, ...value }))
      .unwrap()
      .then((res) => {
        console.log(" response:", res);
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
      <MDBox pt={2} pb={3}>
        <Formik
          innerRef={formikRef}
          initialValues={{
            extensionExpireLimit: "",
            isExtensionEnable: false,
          }}
          onSubmit={(value, action) => {
            console.log("values", value);
            handleExtensionSubmit(value);
          }}
        >
          {(props) => (
            <form onSubmit={props.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <MDBox>
                    <Autocomplete
                      options={[15, 20, 25, 30, 35, 40, 45, 50, 55, 60]}
                      getOptionLabel={(option) => option.label ?? option}
                      name="extensionExpireLimit"
                      value={props.values.extensionExpireLimit}
                      isOptionEqualToValue={(option, value) => {
                        return option.label === value;
                      }}
                      onChange={(event, newValue) => {
                        props.setFieldValue("extensionExpireLimit", newValue);
                      }}
                      disabled={!props.values.isExtensionEnable}
                      onBlur={props.handleBlur}
                      autoHighlight
                      disableClearable
                      size="medium"
                      renderInput={(params) => (
                        <MDInput
                          label="Extension Expire Limit (Minutes)"
                          fullWidth={true}
                          inputProps={{
                            ...params.inputProps,
                            autoComplete: "new-password",
                          }}
                          error={
                            props.errors.extensionExpireLimit &&
                            props.touched.extensionExpireLimit
                              ? true
                              : false
                          }
                          helperText={
                            props.errors.extensionExpireLimit &&
                            props.touched.extensionExpireLimit
                              ? props.errors.extensionExpireLimit
                              : null
                          }
                          {...params}
                        />
                      )}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={6}>
                  <Switch
                    checked={props.values.isExtensionEnable}
                    onChange={(e) => {
                      props.handleChange(e);

                      props.setFieldValue(
                        "isExtensionEnable",
                        e.target.checked
                      );
                    }}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                </Grid>
                <Grid xs={12}>
                  <MDBox pt={2} display="flex" justifyContent="end">
                    <MDButton
                      color={sidenavColor}
                      variant="contained"
                      type="submit"
                    >
                      Save
                    </MDButton>
                  </MDBox>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      </MDBox>
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />
    </MDBox>
  );
}

export default Extension;
