import { useState } from "react";
import {
  Checkbox,
  Collapse,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Stack,
} from "@mui/material";
import MDButton from "components/MDButton";
import { useDispatch } from "react-redux";
import MDDialog from "components/MDDialog";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import MDSnackbar from "components/MDSnackbar";
import { FieldArray, Formik } from "formik";
import { useMaterialUIController } from "context";
import CircularIndeterminate from "components/MDLoading";
import MDBox from "components/MDBox";
import { TransitionGroup } from "react-transition-group";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { UpdateLicensePlateValidationSchema } from "services/validation";
import DeclineUpdateDialog from "./DeclineUpdatesDialog";
import { updateLicensePlate } from "store/slice/subscriptions/subscriptionSlice";
import { getSubscriptionsByPlaceId } from "store/slice/subscriptions/subscriptionSlice";

const LicensePlateUpdateDialog = (props) => {
  const dispatch = useDispatch();
  const { dialogOpen, onClose, subscription } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [declineDialog, setDeclineDialog] = useState(false);

  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handelUpdateLicensePlate = async (payload) => {
    console.log("payload ---->", payload);
    setIsLoading(true);
    await dispatch(
      updateLicensePlate({ subscriptionId: subscription._id, ...payload })
    )
      .unwrap()
      .then(async (res) => {
        const success = res?.success;
        if (success) {
          await dispatch(getSubscriptionsByPlaceId(subscription?.placeId?._id));
          setIsLoading(false);
          onClose();
        }
        setIsLoading(false);
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        // onClose();
      })
      .catch((err) => {
        console.error("Error getting cancel:", err);
      });
  };

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Updating License Plate.. "
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
        dialogTitle="Update License Plate"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              licensePlate: subscription?.licensePlate
                ? subscription.licensePlate
                    .filter((plate) => plate.status === 1)
                    .map((plate) => ({
                      _id: plate._id,
                      licensePlateNumber: plate.licensePlateNumber || "",
                      assignName: plate.assignName || "",
                      price: plate.price / 100 || null,
                    }))
                : [],
              message: subscription?.licensePlateUpdateMessage || "",
              isChargeable: false,
            }}
            validationSchema={UpdateLicensePlateValidationSchema}
            onSubmit={(value, action) => {
              handelUpdateLicensePlate(value);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <FieldArray name="licensePlate">
                      {({ remove, push }) => (
                        <MDBox className="pt-2">
                          <TransitionGroup component="div" appear>
                            {props.values.licensePlate.map(
                              (licensePlate, index) => (
                                <Collapse key={index}>
                                  <MDBox>
                                    {index !== 0 && (
                                      <MDBox mt={1}>
                                        <Stack
                                          direction="row"
                                          justifyContent="flex-start"
                                          alignItems="center"
                                          spacing={1}
                                        >
                                          <Divider
                                            orientation="horizontal"
                                            flexItem
                                            light
                                            sx={{
                                              width: `calc(100% - 40px)`,
                                              margin: "auto 0 !important",
                                            }}
                                          />
                                          {props.values.licensePlate.length >
                                            1 && (
                                            <IconButton
                                              color="error"
                                              size="small"
                                              onClick={() => {
                                                remove(index);
                                              }}
                                            >
                                              <ClearOutlinedIcon />
                                            </IconButton>
                                          )}
                                        </Stack>
                                      </MDBox>
                                    )}
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} md={4}>
                                        <MDInput
                                          label="License Plate"
                                          name={`licensePlate.${index}.licensePlateNumber`}
                                          value={
                                            licensePlate.licensePlateNumber
                                          }
                                          onChange={props.handleChange}
                                          onBlur={props.handleBlur}
                                          error={Boolean(
                                            props.errors.licensePlate?.[index]
                                              ?.licensePlateNumber
                                          )}
                                          helperText={
                                            props.errors.licensePlate?.[index]
                                              ?.licensePlateNumber
                                          }
                                        />
                                      </Grid>
                                      <Grid item xs={12} md={5}>
                                        <MDInput
                                          label="Assigned Name (Optional)"
                                          name={`licensePlate.${index}.assignName`}
                                          value={licensePlate.assignName}
                                          onChange={props.handleChange}
                                          onBlur={props.handleBlur}
                                        />
                                      </Grid>
                                      <Grid item xs={12} md={3}>
                                        <MDInput
                                          label="Price"
                                          name={`licensePlate.${index}.price`}
                                          value={licensePlate.price}
                                          onChange={(e) => {
                                            const { value } = e.target;
                                            if (
                                              value === "" ||
                                              /^\d+$/.test(value)
                                            ) {
                                              let parsedValue =
                                                value === ""
                                                  ? ""
                                                  : parseInt(value, 10);
                                              props.setFieldValue(
                                                `licensePlate.${index}.price`,
                                                parsedValue
                                              );
                                            }
                                          }}
                                          onBlur={props.handleBlur}
                                          error={Boolean(
                                            props.errors.licensePlate?.[index]
                                              ?.price
                                          )}
                                          helperText={
                                            props.errors.licensePlate?.[index]
                                              ?.price
                                          }
                                        />
                                      </Grid>
                                    </Grid>
                                  </MDBox>
                                </Collapse>
                              )
                            )}
                          </TransitionGroup>
                          <MDBox sx={{ mr: 2, mt: 3, mb: 1 }}>
                            <MDButton
                              variant="contained"
                              color={sidenavColor}
                              onClick={() =>
                                push({ licensePlateNumber: "", assignName: "" })
                              }
                            >
                              +
                            </MDButton>
                          </MDBox>
                        </MDBox>
                      )}
                    </FieldArray>
                  </Grid>
                  <Grid item xs={12}>
                    {subscription?.licensePlateUpdateMessage &&
                      subscription?.licensePlateUpdateMessage !== "" && (
                        <MDInput
                          label="Message (Optional)"
                          name="message"
                          value={props.values.message}
                          disabled
                        />
                      )}
                  </Grid>
                  <Grid item xs={12}>
                    <MDBox display="flex" alignItems="center" ml={-1}>
                      <Checkbox
                        id="isChargeable"
                        name="isChargeable"
                        checked={props.values.isChargeable}
                        onChange={(e) => {
                          props.handleChange(e);

                          props.setFieldValue("isChargeable", e.target.checked);
                        }}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                      <MDTypography
                        variant="button"
                        fontWeight="regular"
                        color="text"
                      >
                        &nbsp;&nbsp;Do you want to charge this amount for
                        current month ?&nbsp;
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12}>
                    <MDBox display="flex" justifyContent="end" gap={2}>
                      <MDButton
                        color="danger"
                        variant="contained"
                        type="submit"
                        onClick={() => {
                          setDeclineDialog(true);
                        }}
                      >
                        Decline
                      </MDButton>
                      <MDButton
                        color={sidenavColor}
                        variant="contained"
                        type="submit"
                      >
                        Approve
                      </MDButton>
                    </MDBox>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </DialogContent>
        <DeclineUpdateDialog
          dialogOpen={declineDialog}
          onClose={() => {
            setDeclineDialog(false);
          }}
          onSubmit={() => {
            onClose();
          }}
          subscription={subscription}
        />
      </MDDialog>
    </>
  );
};

export default LicensePlateUpdateDialog;
