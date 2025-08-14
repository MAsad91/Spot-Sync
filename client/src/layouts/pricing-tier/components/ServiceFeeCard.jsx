import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  Card,
  Icon,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Switch,
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
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import MDDropDown from "components/MDDropDown";
import { updatePricingTier } from "store/slice/pricingTier/pricingTierSlice";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import { deletePricingTier } from "store/slice/pricingTier/pricingTierSlice";
import { getPricingTier } from "store/slice/pricingTier/pricingTierSlice";
import { createPricingTierUpdateValidation } from "services/validation";

const ServiceFeeCard = (props) => {
  const { serviceFeeData } = props;
  const [controller] = useMaterialUIController();
  const formikRef = useRef(null);
  const { sidenavColor } = controller;
  const [paymentEdit, setPaymentEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
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
    if (!isEmpty(serviceFeeData)) {
      formikRef?.current?.setFieldValue(
        "placeId",
        get(serviceFeeData, "placeId", null)
      );
      formikRef?.current?.setFieldValue(
        "serviceFee",
        get(serviceFeeData, "serviceFee", 0)
      );
      formikRef?.current?.setFieldValue(
        "subscriptionServiceFee",
        get(serviceFeeData, "subscriptionServiceFee", 0)
      );
      formikRef?.current?.setFieldValue(
        "condition_on",
        get(serviceFeeData, "condition_on", "")
      );
      formikRef?.current?.setFieldValue(
        "condition_operator",
        get(serviceFeeData, "condition_operator", "")
      );
      formikRef?.current?.setFieldValue(
        "condition_value",
        get(serviceFeeData, "condition_value", "")
      );
      formikRef?.current?.setFieldValue(
        "default",
        get(serviceFeeData, "default", false)
      );
    }
  }, [serviceFeeData]);

  const isDefault = get(serviceFeeData, "default", false)

  console.log("isDefault ===>", isDefault)

  let initialValues = isDefault
    ? {
      placeId,
      default: isDefault,
      serviceFee: get(serviceFeeData, "serviceFee", 0),
      condition_on: get(serviceFeeData, "condition_on", ""),
      condition_operator: get(serviceFeeData, "condition_operator", ""),
      condition_value: get(serviceFeeData, "condition_value", ""),
    }
    : {
      placeId,
      default: isDefault,
      serviceFee: get(serviceFeeData, "serviceFee", 0),
      subscriptionServiceFee: get(
        serviceFeeData,
        "subscriptionServiceFee",
        0
      ),
    };
  console.log(isDefault)

  const handelUpdatePricing = (data) => {
    const pricingId = get(serviceFeeData, "_id", false);
    setIsLoading(true);
    dispatch(updatePricingTier({ pricingId, ...data }))
      .unwrap()
      .then((res) => {
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
          setPaymentEdit(false);
        }
      })
      .catch((err) => {
        console.error("Error creating pricing:", err);
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

  const handelDelete = () => {
    console.log("clicked");
    const pricingId = get(serviceFeeData, "_id", false);
    dispatch(deletePricingTier({ pricingId }))
      .unwrap()
      .then(async (res) => {
        console.log("delete response:", res);
        if (res?.success) {
          dispatch(getPricingTier(placeId));
          setDeleteDialogOpen(false);
        }
      })
      .catch((err) => {
        console.error("Error getting brand:", err);
      });
  };

  return (
    <>
      <Card sx={{ boxShadow: 3 }}>
        <MDBox p={2}>
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={createPricingTierUpdateValidation(isDefault, initialValues)}
            onSubmit={(value, action) => {
              console.log("values", value);
              handelUpdatePricing(value);
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
                      {`${serviceFeeData.default ? "Default" : "Conditional"
                        } Service Fee`}
                    </MDTypography>

                    {!paymentEdit && (
                      <>
                        <Switch
                          disabled={toggleLoading === serviceFeeData._id}
                          checked={serviceFeeData?.status === 10}
                        // onChange={() =>
                        //   handleUpdatePricing(
                        //     serviceFeeData?._id,
                        //     serviceFeeData?.status === 10 ? "INACTIVE" : "ACTIVE"
                        //   )
                        // }
                        />

                        {!serviceFeeData.default &&
                          <IconButton
                            color="error"
                            onClick={() => setDeleteDialogOpen(true)}
                          >
                            <Icon fontSize="small" title="Edit">
                              delete
                            </Icon>
                          </IconButton>
                        }

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
                      </>
                    )}
                  </Grid>

                  {!serviceFeeData.default && paymentEdit ? (
                    <>
                      <Grid item xs={12} mt={1}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <MDTypography
                            variant="subtitle1"
                            fontWeight="regular"
                            sx={{ marginRight: "10px" }}
                          >
                            If
                          </MDTypography>
                          <FormControl
                            fullWidth
                            style={{ marginRight: "10px" }}
                          >
                            <InputLabel id="demo-simple-select-label">
                              Condition
                            </InputLabel>
                            <MDDropDown
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              name="condition_on"
                              label="Condition On"
                              value={props.values.condition_on}
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              error={
                                props.errors.condition_on &&
                                props.touched.condition_on
                              }
                              success={
                                !props.errors.condition_on &&
                                props.touched.condition_on
                              }
                              helperText={
                                props.errors.condition_on &&
                                props.touched.condition_on &&
                                props.errors.condition_on
                              }
                            >
                             {/* <MenuItem value={"Total Revenue"}>
                                Total Revenue
                              </MenuItem>*/ }
                              <MenuItem value={"Base Rate"}>Base Rate</MenuItem>
                            </MDDropDown>
                          </FormControl>
                          <MDTypography
                            variant="subtitle1"
                            fontWeight="regular"
                            sx={{ marginRight: "10px" }}
                          >
                            is
                          </MDTypography>
                          <FormControl
                            fullWidth
                            style={{ marginRight: "10px" }}
                          >
                            <InputLabel id="demo-simple-select-label">
                              Operator
                            </InputLabel>
                            <MDDropDown
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              name="condition_operator"
                              label="Operator"
                              value={props.values.condition_operator}
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              error={
                                props.errors.condition_operator &&
                                props.touched.condition_operator
                              }
                              success={
                                !props.errors.condition_operator &&
                                props.touched.condition_operator
                              }
                              helperText={
                                props.errors.condition_operator &&
                                props.touched.condition_operator &&
                                props.errors.condition_operator
                              }
                            >
                              <MenuItem value={"<"}>{"<"}</MenuItem>
                              <MenuItem value={">"}>{">"}</MenuItem>
                              <MenuItem value={"="}>=</MenuItem>
                            </MDDropDown>
                          </FormControl>
                          <FormControl fullWidth>
                            <MDInput
                              name="condition_value"
                              InputProps={{
                                startAdornment: props.values.condition_value ? "$" : "",
                              }}
                              label="Amount"
                              value={props.values.condition_value}
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              error={
                                props.errors.condition_value && props.touched.condition_value
                                  ? true
                                  : false
                              }
                              success={
                                props.errors.condition_value && props.touched.condition_value
                                  ? false
                                  : true
                              }
                              helperText={
                                props.errors.condition_value && props.touched.condition_value
                                  ? props.errors.condition_value
                                  : null
                              }

                            />

                          </FormControl>
                        </div>
                      </Grid>
                    </>
                  ) : (
                    !serviceFeeData.default &&
                    !paymentEdit && (
                      <>
                        <Grid item xs={12}>
                          <MDTypography variant="subtitle2">
                            {`If ${props.values.condition_on} is ${props.values.condition_operator} ${props.values.condition_value}`}
                          </MDTypography>
                        </Grid>
                      </>
                    )
                  )}

                  <Grid
                    item
                    xs={12}
                    md={paymentEdit ? 6 : 9}
                    mt={paymentEdit ? 2 : 0}
                  >
                    {paymentEdit ? (
                      <Grid container xs={12}>
                        {!serviceFeeData.default &&
                          <Grid item xs={1}>
                            <MDTypography
                              variant="subtitle1"
                              fontWeight="regular"
                            >
                              then
                            </MDTypography>
                          </Grid>
                        }
                        <Grid item xs={serviceFeeData.default ? 12: 8}>
                          <MDInput
                            name="serviceFee"
                            InputProps={{
                              startAdornment: props.values.serviceFee ? "$" : "",
                            }}
                            value={props.values.serviceFee}
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            label="Service Fee"
                            error={
                              props.errors.serviceFee && props.touched.serviceFee
                                ? true
                                : false
                            }
                            success={
                              props.errors.serviceFee && props.touched.serviceFee
                                ? false
                                : true
                            }
                            helperText={
                              props.errors.serviceFee && props.touched.serviceFee
                                ? props.errors.serviceFee
                                : null
                            }
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <MDTypography variant="subtitle2">
                        {`Service Fee : $${props?.values?.serviceFee}`}
                      </MDTypography>
                    )}
                  </Grid>
                  {serviceFeeData.default && (
                    <Grid
                      item
                      xs={12}
                      md={paymentEdit ? 6 : 9}
                      mt={paymentEdit ? 2 : 0}
                      py={paymentEdit ? 2 : 0}
                    >
                      {paymentEdit ? (
                        <MDInput
                          name="subscriptionServiceFee"
                          InputProps={{
                            startAdornment: props.values.subscriptionServiceFee ? "$" : "",
                          }}
                          value={props.values.subscriptionServiceFee}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          label="Subscription Service Fee"
                          error={
                            props.errors.subscriptionServiceFee &&
                              props.touched.subscriptionServiceFee
                              ? true
                              : false
                          }
                          success={
                            props.errors.subscriptionServiceFee &&
                              props.touched.subscriptionServiceFee
                              ? false
                              : true
                          }
                          helperText={
                            props.errors.subscriptionServiceFee &&
                              props.touched.subscriptionServiceFee
                              ? props.errors.subscriptionServiceFee
                              : null
                          }
                        />
                      ) : (
                        <MDTypography variant="subtitle2">
                          {`Subscription Service Fee : $${props?.values?.subscriptionServiceFee}`}
                        </MDTypography>
                      )}
                    </Grid>
                  )}

                  <Grid
                    xs={12}
                    gap={2}
                    item
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
                              "serviceFee",
                              get(serviceFeeData, "serviceFee", 0)
                            );
                            formikRef?.current?.setFieldValue(
                              "subscriptionServiceFee",
                              get(serviceFeeData, "subscriptionServiceFee", 0)
                            );
                            setPaymentEdit(false)
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
      <DeleteDialog
        dialogOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
        }}
        handelClick={handelDelete}
      />
    </>
  );
};

export default ServiceFeeCard;
