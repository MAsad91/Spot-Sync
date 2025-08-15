import { useEffect, useRef, useState } from "react";
import {
  Grid,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { Formik } from "formik";
import MDButton from "components/MDButton";
import { grey } from "@mui/material/colors";
import MDSnackbar from "components/MDSnackbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDDropDown from "components/MDDropDown";
import { useMaterialUIController } from "context";
import { paymentGatewayValidationSchema } from "services/validation";
import { assignSetting } from "store/slice/places/placeSlice";
import { get } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getPlaceById } from "store/slice/places/placeSlice";
import { getConnectAccounts } from "store/slice/paymentGateway/paymentGatewaySlice";
import { setConnectAccounts } from "store/slice/paymentGateway/paymentGatewaySlice";

function PaymentGateway() {
  const formikRef = useRef(null);
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const color = grey[900];
  const dispatch = useDispatch();
  const location = useLocation();
  const [connectAccountData, setConnectAccountData] = useState([]);

  const placesData = useSelector((state) => state.places?.selectedPlace);
  const connectAccounts = useSelector(
    (state) => state.paymentGateway?.connectAccounts
  );
  let placeId =
    placesData?._id || new URLSearchParams(location?.search).get("placeId");
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => onCloseNotification(),
  });

  function onCloseNotification() {
    setNotification({ ...notification, show: false });
  }

  function getPlace() {
    if (placesData?.paymentGateway) {
      formikRef?.current?.setFieldValue(
        "paymentGateway",
        placesData?.paymentGateway
      );
      formikRef?.current?.setFieldValue(
        "connectAccountId",
        placesData?.connectAccountId
      );
      formikRef?.current?.setFieldValue(
        "stripeAccount",
        get(placesData, "stripeConfiguration.name", "default")
      );
    } else {
      dispatch(getPlaceById(placeId))
        .unwrap()
        .then((res) => {
          if (res?.success) {
            formikRef?.current?.setFieldValue(
              "paymentGateway",
              res?.place?.paymentGateway
            );
            formikRef?.current?.setFieldValue(
              "connectAccountId",
              res?.place?.connectAccountId
            );
            formikRef?.current?.setFieldValue(
              "stripeAccount",
              get(res?.place, "stripeConfiguration.name", "default")
            );
          }
        });
    }
  }
  function getConnectAccountList() {
    if (connectAccounts && connectAccounts.length < 1) {
      dispatch(getConnectAccounts())
        .unwrap()
        .then((res) => {
          if (res?.success) {
            dispatch(setConnectAccounts(res?.connectAccounts));
            setConnectAccountData(res?.connectAccounts);
          }
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
    } else {
      setConnectAccountData(connectAccounts);
    }
  }

  useEffect(() => {
    getConnectAccountList();
    getPlace();
  }, [placesData?._id]);

  const handlePaymentGatewaySubmit = (value) => {
    dispatch(assignSetting({ placeId, ...value }))
      .unwrap()
      .then((res) => {
        console.log(" response:", res);
        const success = res?.success;
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
          paymentGateway: "",
          connectAccountId: "",
          stripeAccount: "default",
        }}
        validationSchema={paymentGatewayValidationSchema}
        onSubmit={(value, action) => {
          console.log("values", action, value);
          const payload = {
            connectAccountId: value?.connectAccountId,
            paymentGateway: value?.paymentGateway,
            stripeConfiguration: {
              name: value?.stripeAccount,
            },
          }
          handlePaymentGatewaySubmit(payload);
        }}
      >
        {({ values, setFieldValue, handleSubmit, errors }) => (
          <form
            onSubmit={(e) => {
              console.log(e, "<<e");
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Grid container spacing={2} className="mt-1">
              <Grid item xs={12} md={3} lg={3}>
                <MDBox
                  fontSize="12px"
                  mb={1.5}
                  bgColor={
                    "JAZZ_CASH" === values?.paymentGateway
                      ? sidenavColor
                      : color
                  }
                  sx={{
                    color: "primary.contrastText",
                    pt: 4,
                    pb: 4,
                    borderRadius: "16px",
                  }}
                  display="flex"
                  justifyContent="center"
                  onClick={() =>
                    setFieldValue("paymentGateway", "JAZZ_CASH")
                  }
                >
                  Jazz Cash
                </MDBox>
              </Grid>
              <Grid item xs={12} md={3} lg={3}>
                <MDBox
                  fontSize="12px"
                  mb={1.5}
                  bgColor={
                    "EASY_PAISA" === values?.paymentGateway
                      ? sidenavColor
                      : color
                  }
                  sx={{
                    color: "primary.contrastText",
                    pt: 4,
                    pb: 4,
                    borderRadius: "16px",
                  }}
                  display="flex"
                  justifyContent="center"
                  onClick={() =>
                    setFieldValue("paymentGateway", "EASY_PAISA")
                  }
                >
                  EasyPaisa
                </MDBox>
              </Grid>
              <Grid item xs={12} md={3} lg={3}>
                <MDBox
                  fontSize="12px"
                  mb={1.5}
                  bgColor={
                    "STRIPE" === values?.paymentGateway ? sidenavColor : color
                  }
                  sx={{
                    color: "primary.contrastText",
                    pt: 4,
                    pb: 4,
                    borderRadius: "16px",
                  }}
                  display="flex"
                  justifyContent="center"
                  onClick={() => setFieldValue("paymentGateway", "STRIPE")}
                >
                  Stripe <br />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={3} lg={3}>

              </Grid>

              { values?.paymentGateway === "STRIPE" && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                      Stripe Account
                    </InputLabel>
                    <MDDropDown
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      name="stripeAccount"
                      value={values.stripeAccount}
                      label="Stripe Account"
                      onChange={ (_event, value) => {
                        setFieldValue("stripeAccount", value.props.value);
                      }}
                    >
                      <MenuItem value={"default"}>
                        Default
                      </MenuItem>
                      <MenuItem value={"umair-test"}>
                        Umair Test
                      </MenuItem>
                    </MDDropDown>
                  </FormControl>
                </Grid>
              )}

              {"STRIPE" === values?.paymentGateway && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <RadioGroup
                      name="select-connect-account-group"
                      value={values.connectAccountId}
                      onChange={(_event, value) => {
                        setFieldValue("connectAccountId", value);
                      }}
                    >
                      <Grid container spacing={2} className="mt-1" width="100%">
                        {connectAccountData.map((item, _index) => (
                          <Grid item xs={12} md={6} lg={4}>
                            <FormControlLabel
                              value={item.connectAccountId}
                              control={<Radio />}
                              label={
                                <Stack
                                  justifyContent="space-between"
                                  className="h-100"
                                >
                                  <MDTypography
                                    variant="body2"
                                    fontWeight="regular"
                                  >
                                    {item.title}
                                  </MDTypography>
                                  <MDTypography
                                    variant="body2"
                                    fontWeight="regular"
                                  >
                                    {item.connectAccountId}
                                  </MDTypography>
                                </Stack>
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </RadioGroup>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} className="text-right">
                <MDTypography
                  display="block"
                  variant="span"
                  color="error"
                  sx={{ mb: 2 }}
                >
                  {errors?.paymentGateway}
                </MDTypography>
                <MDButton
                  color={sidenavColor}
                  disabled={
                    !values?.paymentGateway ||
                    (values?.paymentGateway === "STRIPE" &&
                      !values.connectAccountId)
                  }
                  variant="contained"
                  type="submit"
                >
                  Save
                </MDButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </MDBox>
  );
}

export default PaymentGateway;
