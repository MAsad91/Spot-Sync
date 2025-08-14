import React, { useEffect, useRef, useState } from "react";
import { Grid, Card, Icon, IconButton, Switch } from "@mui/material";
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
import { getPlaces } from "store/slice/places/placeSlice";
import { setSelectedPlace } from "store/slice/places/placeSlice";

const SaasSubscriptionCard = (props) => {
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
        "saasSubscription",
        get(selectedPlace, "saasSubscription", false)
      );
      formikRef?.current?.setFieldValue(
        "saasSubscriptionValue",
        get(selectedPlace, "saasSubscriptionValue", 0)
      );
    }
  }, [selectedPlace]);

  const handelSaasSSubscriptionUpdate = (rest) => {
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
              saasSubscription: false,
              saasSubscriptionValue: 0,
            }}
            onSubmit={(value, action) => {
              console.log("values", value);
              handelSaasSSubscriptionUpdate(value);
            }}
            enableReinitialize
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
                      Saas Revenue
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
                    <Switch
                      disabled={!paymentEdit}
                      checked={props.values.saasSubscription}
                      onChange={(event) =>
                        props.setFieldValue(
                          "saasSubscription",
                          event.target.checked
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12} py={paymentEdit ? 2 : 0}>
                    {paymentEdit ? (
                      <MDInput
                        name="saasSubscriptionValue"
                        value={props.values.saasSubscriptionValue}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        label="Saas Value"
                        error={
                          props.errors.saasSubscriptionValue &&
                          props.touched.saasSubscriptionValue
                            ? true
                            : false
                        }
                        success={
                          props.errors.saasSubscriptionValue &&
                          props.touched.saasSubscriptionValue
                            ? false
                            : true
                        }
                        helperText={
                          props.errors.saasSubscriptionValue &&
                          props.touched.saasSubscriptionValue
                            ? props.errors.saasSubscriptionValue
                            : null
                        }
                      />
                    ) : (
                      <MDTypography variant="subtitle2">
                        {`$${props.values.saasSubscriptionValue} / Month`}
                      </MDTypography>
                    )}
                  </Grid>

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
                          onClick={() => {
                            formikRef?.current?.setFieldValue(
                              "saasValue",
                              get(selectedPlace, "saasValue", 0)
                            );
                            setPaymentEdit(false);
                          }}
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

export default SaasSubscriptionCard;
