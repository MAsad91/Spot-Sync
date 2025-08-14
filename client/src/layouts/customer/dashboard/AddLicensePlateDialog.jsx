import { useState } from "react";
import {
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
import { getSubscriptionsList } from "store/slice/customer/customerSlice";
import { addLicensePlate } from "store/slice/customer/customerSlice";
import { AddLicensePlateValidationSchema } from "services/validation";

const AddLicensePlateDialog = (props) => {
  const dispatch = useDispatch();
  const { dialogOpen, onClose, subscriptionId } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);

  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  console.log("subscriptionId ---->", subscriptionId);

  const handelAddLicensePlat = async (payload) => {
    console.log("payload ---->", payload);
    setIsLoading(true);
    await dispatch(
      addLicensePlate({ subscriptionId: subscriptionId, ...payload })
    )
      .unwrap()
      .then(async (res) => {
        const success = res?.success;
        if (success) {
          await dispatch(getSubscriptionsList());
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
        text="Adding License Plate.. "
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
        dialogTitle="Add License Plate"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="xs"
      >
        <DialogContent>
          <Formik
            initialValues={{
              licensePlate: [
                { licensePlateNumber: "", assignName: "", price: 0, status: 1 },
              ],
              licensePlateUpdateMessage: "",
            }}
            validationSchema={AddLicensePlateValidationSchema}
            onSubmit={(value, action) => {
              console.log("values", value);
              handelAddLicensePlat(value);
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
                                                // handleRemove(index);
                                              }}
                                            >
                                              <ClearOutlinedIcon />
                                            </IconButton>
                                          )}
                                        </Stack>
                                      </MDBox>
                                    )}
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} md={6}>
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
                                      <Grid item xs={12} md={6}>
                                        <MDInput
                                          label="Assigned Name (Optional)"
                                          name={`licensePlate.${index}.assignName`}
                                          value={licensePlate.assignName}
                                          onChange={props.handleChange}
                                          onBlur={props.handleBlur}
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
                    <MDInput
                      label="Message (Optional)"
                      name="message"
                      value={props.values.message}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                    />
                  </Grid>
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

export default AddLicensePlateDialog;
