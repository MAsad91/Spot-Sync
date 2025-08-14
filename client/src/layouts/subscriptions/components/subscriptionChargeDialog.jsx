import { useState } from "react";
import { DialogActions, DialogContent, Stack, Typography } from "@mui/material";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import CircularIndeterminate from "components/MDLoading";
import MDButton from "components/MDButton";
import MDTextButton from "components/MDTextButton";
import { useMaterialUIController } from "context";
import { amountToShow } from "global/functions";
import { useDispatch } from "react-redux";
import { renewSubscription } from "store/slice/subscriptions/subscriptionSlice";
import { getSubscriptionsByPlaceId } from "store/slice/subscriptions/subscriptionSlice";
import { getSubscriptionDetail } from "store/slice/subscriptions/subscriptionSlice";

const SubscriptionChargeDialog = (props) => {
  const [controller] = useMaterialUIController();
  const dispatch = useDispatch();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const { dialogOpen, onClose, subscriptionData } = props;

  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handelRenew = () => {
    setIsLoading(true);
    dispatch(renewSubscription(subscriptionData._id))
      .unwrap()
      .then(async (res) => {
        const success = res?.success;
        if (success) {
          await dispatch(
            getSubscriptionsByPlaceId(subscriptionData?.placeId?._id)
          );
          await dispatch(getSubscriptionDetail(subscriptionData._id));
          setIsLoading(false);
          onClose();
        }
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        setIsLoading(false);
        onClose();
      })
      .catch((err) => {
        console.error("Error getting delete:", err);
      });
  };

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Please wait..! "
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
        dialogTitle="Charge Confirmation!"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle1" fontSize={16} fontWeight="regular">
              {`Subscription ID : ${subscriptionData.subscriptionNumber}`}
            </Typography>
            <Typography variant="subtitle1" fontSize={16} fontWeight="regular">
              {`Total Amount : $${amountToShow(subscriptionData.totalAmount)}`}
            </Typography>
          </Stack>

          <Typography
            variant="subtitle1"
            fontSize={16}
            fontWeight="regular"
            color="red"
          >
            Are you sure you want to charge this subscription!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="end"
          >
            <MDTextButton onClick={() => onClose()}>Cancel</MDTextButton>
            <MDButton
              size="small"
              variant="contained"
              color={sidenavColor}
              onClick={handelRenew}
            >
              Yes
            </MDButton>
          </Stack>
        </DialogActions>
      </MDDialog>
    </>
  );
};

export default SubscriptionChargeDialog;
