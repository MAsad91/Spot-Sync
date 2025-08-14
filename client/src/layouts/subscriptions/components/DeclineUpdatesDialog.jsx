import { Dialog, DialogContent, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import { useMaterialUIController } from "context";
import { Formik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { getSubscriptionsByPlaceId } from "store/slice/subscriptions/subscriptionSlice";
import { declineUpdateLicensePlate } from "store/slice/subscriptions/subscriptionSlice";
import * as Yup from "yup";

const DeclineUpdateDialog = (props) => {
  const { dialogOpen, onClose, subscription, onSubmit } = props;
  const [controller] = useMaterialUIController();
  const dispatch = useDispatch();
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

  const DeclineValidationSchema = Yup.object().shape({
    reasonForDeclineMessage: Yup.string().required("Reason is required"),
  });

  console.log("Subscription ===>", subscription);

  const handelDeclineUpdateLicensePlate = async (payload) => {
    console.log("payload ---->", payload);
    setIsLoading(true);
    await dispatch(
      declineUpdateLicensePlate({
        subscriptionId: subscription._id,
        ...payload,
      })
    )
      .unwrap()
      .then(async (res) => {
        const success = res?.success;
        if (success) {
          await dispatch(getSubscriptionsByPlaceId(subscription?.placeId?._id));
          setIsLoading(false);
          onSubmit();
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
      <Dialog open={dialogOpen} onClose={onClose}>
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
              reasonForDeclineMessage: "",
            }}
            validationSchema={DeclineValidationSchema}
            onSubmit={(values, actions) => {
              handelDeclineUpdateLicensePlate(values);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <MDInput
                      name="reasonForDeclineMessage"
                      value={props.values.reasonForDeclineMessage}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Decline Reason"
                      error={
                        props.errors.reasonForDeclineMessage &&
                        props.touched.reasonForDeclineMessage
                      }
                      helperText={
                        props.errors.reasonForDeclineMessage &&
                        props.touched.reasonForDeclineMessage
                          ? props.errors.reasonForDeclineMessage
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDBox display="flex" justifyContent="end">
                      <MDButton onClick={onClose}>Cancel</MDButton>
                      <MDButton
                        color={sidenavColor}
                        variant="contained"
                        type="submit"
                      >
                        Submit
                      </MDButton>
                    </MDBox>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeclineUpdateDialog;
