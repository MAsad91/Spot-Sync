import {
  DialogContent,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
} from "@mui/material";

import { Formik } from "formik";
import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";
import MDDropDown from "components/MDDropDown";
import { useMaterialUIController } from "context";
import { createPricingTierValidation } from "services/validation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { createPricingTier } from "store/slice/pricingTier/pricingTierSlice";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import MDTypography from "components/MDTypography";
import { getPricingTier } from "store/slice/pricingTier/pricingTierSlice";

const CreateServiceFee = (props) => {
  const [controller] = useMaterialUIController();
  const dispatch = useDispatch();
  const location = useLocation();
  const { sidenavColor } = controller;
  const { dialogOpen, onClose, isDefault } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const placesData = useSelector((state) => state.places?.selectedPlace);
  let placeId =
    placesData?._id || new URLSearchParams(location?.search).get("placeId");

  let initialValues = isDefault
    ? {
      placeId: placeId || null,
      default: false,
      serviceFee: null,
      condition_on: "",
      condition_operator: "",
      condition_value: "",
    }
    : {
      placeId: placeId || null,
      serviceFee: null,
      subscriptionServiceFee: null,
    };

  const handelCreatePricing = (pricingData) => {
    setIsLoading(true);
    dispatch(createPricingTier(pricingData))
      .unwrap()
      .then(async (res) => {
        console.log("pricing creation response:", res);
        const success = res?.success;
        setIsLoading(false);
        await dispatch(getPricingTier(placeId));
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        if (success) {
          console.log("res=>");
          dispatch(getPricingTier(placeId));
          onClose();
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

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Creating Pricing "
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
      <MDDialog
        dialogTitle="Create Service Fee"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={initialValues}
            validationSchema={createPricingTierValidation(
              isDefault,
              initialValues
            )}
            onSubmit={(value, action) => {
              console.log("values", value);
              handelCreatePricing(value);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  {!isDefault ? (
                    <>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <MDInput
                            name="serviceFee"
                            InputProps={{
                              startAdornment: props.values.serviceFee ? "$" : "",
                            }}
                            value={props.values.serviceFee}
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            label="Service Fee ( USD )"
                            error={
                              props.errors.serviceFee &&
                                props.touched.serviceFee
                                ? true
                                : false
                            }
                            success={
                              props.errors.serviceFee &&
                                props.touched.serviceFee
                                ? false
                                : true
                            }
                            helperText={
                              props.errors.serviceFee &&
                                props.touched.serviceFee
                                ? props.errors.serviceFee
                                : null
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <MDInput
                            name="subscriptionServiceFee"
                            InputProps={{
                              startAdornment: props.values.subscriptionServiceFee ? "$" : "",
                            }}
                            value={props.values.subscriptionServiceFee}
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            label="Subscription Service Fee ( USD )"
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
                        </FormControl>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} lg={1}>
                        <MDTypography variant="subtitle1" fontWeight="regular">
                          If
                        </MDTypography>
                      </Grid>
                      <Grid item xs={12} lg={4}>
                        <FormControl fullWidth>
                          <InputLabel id="demo-simple-select-label">
                            Condition
                          </InputLabel>
                          <MDDropDown
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            name="condition_on"
                            value={props.values.condition_on}
                            label="Condition On"
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            error={
                              props.errors.condition_on &&
                                props.touched.condition_on
                                ? true
                                : false
                            }
                            success={
                              props.errors.condition_on &&
                                props.touched.condition_on
                                ? false
                                : true
                            }
                            helperText={
                              props.errors.condition_on &&
                                props.touched.condition_on
                                ? props.errors.condition_on
                                : null
                            }
                          >
                            <MenuItem value={"Base Rate"}>Base Rate</MenuItem>
                          </MDDropDown>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} lg={1}>
                        <MDTypography variant="subtitle1" fontWeight="regular">
                          is
                        </MDTypography>
                      </Grid>
                      <Grid item xs={12} lg={3}>
                        <FormControl fullWidth>
                          <InputLabel id="demo-simple-select-label">
                            Operator
                          </InputLabel>
                          <MDDropDown
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            name="condition_operator"
                            value={props.values.condition_operator}
                            label="Operator"
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            error={
                              props.errors.condition_operator &&
                                props.touched.condition_operator
                                ? true
                                : false
                            }
                            success={
                              props.errors.condition_operator &&
                                props.touched.condition_operator
                                ? false
                                : true
                            }
                            helperText={
                              props.errors.condition_operator &&
                                props.touched.condition_operator
                                ? props.errors.condition_operator
                                : null
                            }
                          >
                            <MenuItem value={"<"}>{"<"}</MenuItem>
                            <MenuItem value={">"}>{">"}</MenuItem>
                            <MenuItem value={"="}>=</MenuItem>
                          </MDDropDown>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} lg={3}>
                        <FormControl fullWidth>
                          <MDInput
                            name="condition_value"
                            InputProps={{
                              startAdornment: props.values.condition_value ? "$" : "",
                            }}
                            value={props.values.condition_value}
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            label="Amount"
                            error={
                              props.errors.condition_value &&
                                props.touched.condition_value
                                ? true
                                : false
                            }
                            success={
                              props.errors.condition_value &&
                                props.touched.condition_value
                                ? false
                                : true
                            }
                            helperText={
                              props.errors.condition_value &&
                                props.touched.condition_value
                                ? props.errors.condition_value
                                : null
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} lg={1}>
                        <MDTypography variant="subtitle1" fontWeight="regular">
                          then
                        </MDTypography>
                      </Grid>
                      <Grid item xs={12} lg={4}>
                        <FormControl fullWidth>
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
                              props.errors.serviceFee &&
                                props.touched.serviceFee
                                ? true
                                : false
                            }
                            success={
                              props.errors.serviceFee &&
                                props.touched.serviceFee
                                ? false
                                : true
                            }
                            helperText={
                              props.errors.serviceFee &&
                                props.touched.serviceFee
                                ? props.errors.serviceFee
                                : null
                            }

                          />
                        </FormControl>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} className="text-right">
                    <MDButton
                      color={sidenavColor}
                      variant="contained"
                      type="submit"
                    >
                      Create
                    </MDButton>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </DialogContent>
      </MDDialog>
    </>
  );
};

export default CreateServiceFee;
