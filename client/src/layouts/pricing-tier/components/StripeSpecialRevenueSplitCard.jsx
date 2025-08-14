import React, { useEffect, useRef, useState } from "react";
import { Grid, Card, Icon, IconButton, Switch, TextField } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { get, isEmpty, split } from "lodash";
import { updatePlace } from "store/slice/places/placeSlice";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import { getPlaces } from "store/slice/places/placeSlice";
import { setSelectedPlace } from "store/slice/places/placeSlice";
import { CheckBox } from "@mui/icons-material";

const StripeSpecialRevenueSplitCard = (props) => {
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
    setInitValues();
  }, [selectedPlace]);

  const setInitValues = () => {
    if (!isEmpty(selectedPlace)) {
      formikRef?.current?.setFieldValue(
        "placeId",
        get(selectedPlace, "_id", null)
      );
      formikRef?.current?.setFieldValue(
        "enabled",
        get(selectedPlace, "splitRevenue.enabled", false)
      );
      formikRef?.current?.setFieldValue(
        "primaryAccountPer",
        get(selectedPlace, "splitRevenue.primaryAccountPer", 0)
      );
      formikRef?.current?.setFieldValue(
        "secondaryAccountPer",
        get(selectedPlace, "splitRevenue.secondaryAccountPer", 0)
      );
      formikRef?.current?.setFieldValue(
        "secondaryConnectAccountId",
        get(selectedPlace, "splitRevenue.secondaryConnectAccountId", "")
      );
      formikRef?.current?.setFieldValue(
        "isFixedSplit",
        get(selectedPlace, "splitRevenue.isFixedSplit", false)
      );
      formikRef?.current?.setFieldValue(
        "secondaryAccountFixedAmount",
        get(selectedPlace, "splitRevenue.secondaryAccountFixedAmount", 0)
      );
    }
  }

  const handelSplitLogicUpdate = (rest) => {
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
          await dispatch(setSelectedPlace(res?.updatedPlaceData));
          setPaymentEdit(false);
          await dispatch(getPlaces());
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

  const validationSchema = Yup.object().shape({
    primaryAccountPer: Yup.number()
      .when('isFixedSplit', {
        is: false,
        then: () => Yup.number()
          .min(0, "Must be at least 0")
          .max(100, "Please enter value under 100!")
          .required("Primary Account Percentage is required"),
        otherwise: () => Yup.string().nullable(),
      }),
    secondaryAccountPer: Yup.number()
      .when('isFixedSplit', {
        is: false,
        then: () => Yup.number()
          .min(0, "Must be at least 0")
          .max(100, "Please enter value under 100!")
          .required("Secondary Account Percentage is required"),
        otherwise: () => Yup.string().nullable(),
      }),
    secondaryAccountFixedAmount: Yup.number()
      .when('isFixedSplit', {
        is: true,
        then: () => Yup.number()
          .min(0, "Must be at least 0")
          .max(100, "Please enter value under 100!")
          .required("Secondary Account Amount is required"),
        otherwise: () => Yup.string().nullable(),
      }),
  });
  

  return (
    <>
      <Card sx={{ boxShadow: 3 }}>
        <MDBox p={2}>
          <Formik
            innerRef={formikRef}
            initialValues={{
              enabled: false,
              primaryAccountPer: 0,
              secondaryAccountPer: 0,
              secondaryConnectAccountId: "",
              isFixedSplit: false,
              secondaryAccountFixedAmount: 0,
            }}
            validationSchema={validationSchema}
            onSubmit={(value, action) => {
              console.log("values", value);
              const splitRevenue = {
                enabled: value.enabled,
                primaryAccountPer: parseInt(value.primaryAccountPer),
                secondaryAccountPer: parseInt(value.secondaryAccountPer),
                secondaryConnectAccountId: value.secondaryConnectAccountId,
                isFixedSplit: value.isFixedSplit,
                secondaryAccountFixedAmount: parseInt(value.secondaryAccountFixedAmount),
              };

              handelSplitLogicUpdate({ splitRevenue });
            }}
            enableReinitialize
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={paymentEdit ? 1 : 0} height={paymentEdit ? null : 180}>
                  <Grid item xs={12} container alignItems="center">
                    <MDTypography
                      color="dark"
                      display="block"
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ flex: 1 }}
                    >
                      Special Revenue Split Settings
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

                  {paymentEdit ? (
                    <Grid item xs={12}>
                      <Grid container className="d-flex justify-content-between w-full" alignItems="center" spacing={1}>
                        <Grid item>
                          <MDTypography variant="subtitle2">
                            Enabled
                          </MDTypography>
                        </Grid>
                        <Grid item>
                          <Switch
                            disabled={!paymentEdit}
                            checked={props.values.enabled}
                            onChange={(event) =>
                              props.setFieldValue(
                                "enabled",
                                event.target.checked
                              )
                            }
                          />
                        </Grid>
                      </Grid>

                      <Grid container className="d-flex" alignItems="center" spacing={1}>
                        <Grid item className="w-40-per">
                          <MDTypography variant="subtitle2">
                            Secondary Connect Account Id:
                          </MDTypography>
                        </Grid>
                        <Grid item>
                          <MDInput
                            name={`secondaryConnectAccountId`}
                            style={{ width: 216 }}
                            value={props.values.secondaryConnectAccountId}
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            error={
                              props.errors.secondaryConnectAccountId && props.touched.secondaryConnectAccountId
                            }
                            success={
                              !props.errors.secondaryConnectAccountId && props.touched.secondaryConnectAccountId
                            }
                            helperText={
                              props.errors.secondaryConnectAccountId &&
                              props.touched.secondaryConnectAccountId &&
                              props.errors.secondaryConnectAccountId
                            }
                          />
                        </Grid>
                      </Grid>

                      <Grid container className="my-3 d-flex justify-content-between" alignItems="center" spacing={1}>
                        <Grid item>
                          <MDTypography variant="subtitle2">
                            Percentage Revenue
                          </MDTypography>
                        </Grid>
                        <Grid item>
                          <Switch
                            disabled={!paymentEdit}
                            checked={props.values.isFixedSplit}
                            onChange={(event) =>
                              props.setFieldValue(
                                "isFixedSplit",
                                event.target.checked
                              )
                            }
                          />
                        </Grid>
                        <Grid item>
                          <MDTypography variant="subtitle2">
                            Fixed Revenue
                          </MDTypography>
                        </Grid>
                      </Grid>
                      
                      { props.values.isFixedSplit ? (
                        <div className="d-flex justify-content-between align-items-center">
                          <MDTypography
                            variant="subtitle2"
                            style={{ minWidth: "150px" }}
                          >
                            Secondary Account Fixed Amount ($):
                          </MDTypography>
                          <MDInput
                            name={`secondaryAccountFixedAmount`}
                            value={props.values.secondaryAccountFixedAmount}
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            error={
                              props.errors.secondaryAccountFixedAmount && props.touched.secondaryAccountFixedAmount
                            }
                            success={
                              !props.errors.secondaryAccountFixedAmount && props.touched.secondaryAccountFixedAmount
                            }
                            helperText={
                              props.errors.secondaryAccountFixedAmount &&
                              props.touched.secondaryAccountFixedAmount &&
                              props.errors.secondaryAccountFixedAmount
                            }
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="d-flex justify-content-between align-items-center">
                            <MDTypography
                              variant="subtitle2"
                              style={{ minWidth: "150px" }}
                            >
                              Primary Account Percentage (%):
                            </MDTypography>
                            <MDInput
                              name={`primaryAccountPer`}
                              value={props.values.primaryAccountPer}
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              error={
                                props.errors.primaryAccountPer && props.touched.primaryAccountPer
                              }
                              success={
                                !props.errors.primaryAccountPer && props.touched.primaryAccountPer
                              }
                              helperText={
                                props.errors.primaryAccountPer &&
                                props.touched.primaryAccountPer &&
                                props.errors.primaryAccountPer
                              }
                            />
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <MDTypography
                              variant="subtitle2"
                              style={{ minWidth: "120px" }}
                            >
                              Secondary Account Percentage (%):
                            </MDTypography>
                            <MDInput
                              name={`secondaryAccountPer`}
                              value={props.values.secondaryAccountPer}
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              error={
                                props.errors.secondaryAccountPer && props.touched.secondaryAccountPer
                              }
                              success={
                                !props.errors.secondaryAccountPer && props.touched.secondaryAccountPer
                              }
                              helperText={
                                props.errors.secondaryAccountPer &&
                                props.touched.secondaryAccountPer &&
                                props.errors.secondaryAccountPer
                              }
                            />
                          </div>
                        </div>
                      )}
                    </Grid>
                  ) : (
                    <Grid item xs={12}>
                      <Grid item>
                        <MDTypography variant="subtitle2">
                          <span className="fw-medium">Enabled:</span> {props.values.enabled ? "Yes" : "No"}
                        </MDTypography>
                      </Grid>

                      <Grid item>
                        <MDTypography variant="subtitle2">
                          <span className="fw-medium">Secondary Connect Account Id:</span>
                          <span className="ms-3">
                          {props.values.secondaryConnectAccountId}
                          </span>
                        </MDTypography>
                      </Grid>

                      <Grid item>
                        <MDTypography variant="subtitle2">
                          <span className="fw-medium">Split Type:</span> {props.values.isFixedSplit ? "Fixed" : "Percentage"}
                        </MDTypography>
                      </Grid>

                      {props.values.isFixedSplit ? (
                        <Grid item>
                          <MDTypography variant="subtitle2">
                            <span className="fw-medium">Secondary Account Fixed Amount ($):</span> {props.values.secondaryAccountFixedAmount}
                          </MDTypography>
                        </Grid>
                      ) : (
                        <>
                          <Grid item>
                            <MDTypography variant="subtitle2">
                              <span className="fw-medium">Primary Account Percentage (%):</span> {props.values.primaryAccountPer}
                            </MDTypography>
                          </Grid>

                          <Grid item>
                            <MDTypography variant="subtitle2">
                              <span className="fw-medium">Secondary Account Percentage (%):</span> {props.values.secondaryAccountPer}
                            </MDTypography>
                          </Grid>
                        </>
                      )}
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
                          onClick={() => {
                            setInitValues();
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

export default StripeSpecialRevenueSplitCard;
