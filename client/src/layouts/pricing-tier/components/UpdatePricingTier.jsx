import {
  DialogContent,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
} from "@mui/material";

import { Formik } from "formik";
// import * as Yup from "yup";
import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";
import MDDropDown from "components/MDDropDown";
import { useMaterialUIController } from "context";
import { createPricingTierValidation } from "services/validation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import { get } from "lodash";
import { updatePricingTier } from "store/slice/pricingTier/pricingTierSlice";

const UpdatePricingTier = (props) => {
  const [controller] = useMaterialUIController();
  const dispatch = useDispatch();
  const location = useLocation();
  const { sidenavColor } = controller;
  const { dialogOpen, onClose, userRole, updateParentData, pricingData } =
    props;
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  let placeId = new URLSearchParams(location?.search).get("placeId");
  if (!placeId) {
    placeId = localStorage.getItem("placeId");
  }

  const isDefault = get(pricingData, "default", false);

  let initialValues = !isDefault
    ? {
        placeId: get(pricingData, "placeId", ""),
        default: get(pricingData, "default", false),
        isbp_revenue: get(pricingData, "isbp_revenue", ""),
        serviceFee: get(pricingData, "serviceFee", ""),
        condition_on: get(pricingData, "condition_on", ""),
        condition_operator: get(pricingData, "condition_operator", ""),
        condition_value: get(pricingData, "condition_value", ""),
      }
    : {
        placeId: get(pricingData, "placeId", ""),
        isbp_revenue: get(pricingData, "isbp_revenue", ""),
        serviceFee: get(pricingData, "serviceFee", ""),
        isbp_revenue_type: get(pricingData, "isbp_revenue_type", ""),
        isbp_revenue_percent_of: get(pricingData, "isbp_revenue_percent_of", ""),
      };

  const handelUpdatePricing = (data) => {
    const pricingId = get(pricingData, "_id", false);
    setIsLoading(true);
    dispatch(updatePricingTier({ pricingId, ...data }))
      .unwrap()
      .then((res) => {
        console.log("pricing update response:", res);
        const success = res?.success;
        setIsLoading(false);
        updateParentData();
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
        dialogTitle="Edit Pricing Tier"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={initialValues}
            // validationSchema={createPricingTierValidation(
            //   isDefault,
            //   initialValues,
            //   userRole
            // )}
            onSubmit={(value, action) => {
              console.log("values", value);
              handelUpdatePricing(value);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  {isDefault ? (
                    <>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <MDInput
                            name="serviceFee"
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

                      {userRole === 100 && (
                        <>
                          <Grid item xs={12}>
                            <FormControl fullWidth>
                              <MDInput
                                name="isbp_revenue"
                                value={props.values.isbp_revenue}
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                label="ISBParking Revenue"
                                error={
                                  props.errors.isbp_revenue &&
                                  props.touched.isbp_revenue
                                    ? true
                                    : false
                                }
                                success={
                                  props.errors.isbp_revenue &&
                                  props.touched.isbp_revenue
                                    ? false
                                    : true
                                }
                                helperText={
                                  props.errors.isbp_revenue &&
                                  props.touched.isbp_revenue
                                    ? props.errors.isbp_revenue
                                    : null
                                }
                              />
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <FormControl fullWidth>
                              <InputLabel id="demo-simple-select-label">
                                ISBParking Revenue Type
                              </InputLabel>
                              <MDDropDown
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                name="isbp_revenue_type"
                                value={props.values.isbp_revenue_type}
                                label="ISBParking Revenue Type"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                error={
                                  props.errors.isbp_revenue_type &&
                                  props.touched.isbp_revenue_type
                                    ? true
                                    : false
                                }
                                success={
                                  props.errors.isbp_revenue_type &&
                                  props.touched.isbp_revenue_type
                                    ? false
                                    : true
                                }
                                helperText={
                                      props.errors.isbp_revenue_type &&
                                  props.touched.isbp_revenue_type
                                    ? props.errors.isbp_revenue_type
                                    : null
                                }
                              >
                                <MenuItem value={"Fixed"}>Fixed</MenuItem>
                                <MenuItem value={"Percentage"}>
                                  Percentage
                                </MenuItem>
                              </MDDropDown>
                            </FormControl>
                          </Grid>
                        </>
                      )}

                      {props.values.isbp_revenue_type === "Percentage" && (
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                              Percentage OF
                            </InputLabel>
                            <MDDropDown
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={props.values.percentage_of}
                              name="percentage_of"
                              label="Percentage OF"
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              error={
                                props.errors.percentage_of &&
                                props.touched.percentage_of
                                  ? true
                                  : false
                              }
                              success={
                                props.errors.percentage_of &&
                                props.touched.percentage_of
                                  ? false
                                  : true
                              }
                              helperText={
                                props.errors.percentage_of &&
                                props.touched.percentage_of
                                  ? props.errors.percentage_of
                                  : null
                              }
                            >
                              <MenuItem value={"Total Revenue"}>
                                Total Revenue
                              </MenuItem>
                              <MenuItem value={"Base Rate"}>Base Rate</MenuItem>
                              <MenuItem value={"Service Fee"}>
                                Service Fee
                              </MenuItem>
                            </MDDropDown>
                          </FormControl>
                        </Grid>
                      )}
                    </>
                  ) : (
                    <>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <MDInput
                            name="serviceFee"
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
                      {userRole === 100 && (
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <MDInput
                              name="isbp_revenue"
                              value={props.values.isbp_revenue}
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              label="ISBParking Revenue"
                              error={
                                props.errors.isbp_revenue &&
                                props.touched.isbp_revenue
                                  ? true
                                  : false
                              }
                              success={
                                props.errors.isbp_revenue &&
                                props.touched.isbp_revenue
                                  ? false
                                  : true
                              }
                              helperText={
                                props.errors.isbp_revenue &&
                                props.touched.isbp_revenue
                                  ? props.errors.isbp_revenue
                                  : null
                              }
                            />
                          </FormControl>
                        </Grid>
                      )}

                      <Grid item xs={12} lg={5}>
                        <FormControl fullWidth>
                          <InputLabel id="demo-simple-select-label">
                            Condition On
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
                            <MenuItem value={"Total Revenue"}>
                              Total Revenue
                            </MenuItem>
                            <MenuItem value={"Base Rate"}>Base Rate</MenuItem>
                            <MenuItem value={"Service Fee"}>
                              Service Fee
                            </MenuItem>
                          </MDDropDown>
                        </FormControl>
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
                      <Grid item xs={12} lg={4}>
                        <FormControl fullWidth>
                          <MDInput
                            name="condition_value"
                            value={props.values.condition_value}
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            label="Value"
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
                    </>
                  )}
                  <Grid item xs={12} className="text-right">
                    <MDButton
                      color={sidenavColor}
                      variant="contained"
                      type="submit"
                    >
                      Submit
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

export default UpdatePricingTier;
