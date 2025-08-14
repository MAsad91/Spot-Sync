import MDDialog from "components/MDDialog";
import React, { useEffect } from "react";
import { DialogContent, Grid, IconButton, Icon } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import CircularIndeterminate from "components/MDLoading";
import { useDispatch, useSelector } from "react-redux";
import { getSubscriptionPaymentLogs } from "store/slice/subscriptions/subscriptionSlice";
import { map, isEmpty } from "lodash"; // Make sure to import isEmpty
import moment from "moment";

const PaymentLogDialog = (props) => {
  const { dialogOpen, onClose, subscriptionId } = props;
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.subscriptions?.loading);
  const paymentLogs = useSelector((state) => state.subscriptions?.paymentLogs);

  useEffect(() => {
    dispatch(getSubscriptionPaymentLogs(subscriptionId));
  }, [dispatch, subscriptionId]);

  const alertContent = (item) => {
    const { paymentStatus, paymentInfo, createdAt, paymentMethodType } = item;
    return (
      <>
        <Grid container spacing={1}>
          <Grid item xs={12} md={11}>
            <MDBox  display="flex" flexDirection="column">
              <MDTypography variant="body2" color="white">
                {`Amount : $${
                  paymentStatus === "success"
                    ? (paymentInfo?.amount / 100).toFixed(2)
                    : (paymentInfo?.payment_intent?.amount / 100).toFixed(2)
                }`}
              </MDTypography>
              <MDTypography variant="body2" color="white">
                {`Date : ${moment(createdAt).format("MMMM Do YYYY hh:mm A")}`}
              </MDTypography>
              <MDTypography variant="body2" color="white">
                {`Payment Method : ${
                  paymentMethodType === "card"
                    ? "Credit Card"
                    : paymentMethodType
                }`}
              </MDTypography>
              {paymentStatus === "failed" && (
                <MDTypography variant="body2" color="white">
                  {`Reason : ${paymentInfo.message}`}
                </MDTypography>
              )}
            </MDBox>
          </Grid>
          <Grid item xs={12} md={1}>
            <MDBox display="flex" justifyContent="center" alignItem="center">
              <IconButton color="white" onClick={() => {}}>
                <Icon fontSize="small">visibility</Icon>
              </IconButton>
            </MDBox>
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Please wait..."
        open={loading}
      />
      <MDDialog
        dialogTitle="Payment Logs"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="lg"
      >
        <DialogContent>
          <Grid container justifyContent="center">
            <Grid item xs={12} mt={2}>
              {isEmpty(paymentLogs) ? (
                <MDBox p={2}>
                  <MDTypography variant="body2" color="text" textAlign="center">
                    There are no payment logs.
                  </MDTypography>
                </MDBox>
              ) : (
                map(paymentLogs, (item, index) => (
                  <MDBox px={2}  key={index}>
                    <MDAlert
                      color={
                        item.paymentStatus === "success"
                          ? "success"
                          : item.paymentStatus === "failed"
                          ? "error"
                          : ""
                      }
                    >
                      {alertContent(item)}
                    </MDAlert>
                  </MDBox>
                ))
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </MDDialog>
    </>
  );
};

export default PaymentLogDialog;
