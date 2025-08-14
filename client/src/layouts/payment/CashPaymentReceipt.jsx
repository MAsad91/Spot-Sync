import React from "react";
import {
  Paper,
  Box,
  Divider,
  Grid,
  Button,
} from "@mui/material";
import { get } from "lodash";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { amountToShow, getSubscriptionDuration, getDatesFromDuration } from "global/functions";

const CashPaymentReceipt = ({ paymentData, subscriptionData }) => {
  const duration = getSubscriptionDuration({
    startDate: subscriptionData.startDate,
    endDate: subscriptionData.endDate,
    timezone: get(subscriptionData, "placeId.timeZoneId", ""),
  });
  const dates = getDatesFromDuration({ duration });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implementation for downloading receipt as PDF
    console.log("Download receipt");
  };

  return (
    <MDBox>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <MDTypography variant="h4" fontWeight="bold" color="primary">
            CASH PAYMENT RECEIPT
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary" mt={1}>
            Receipt #{get(paymentData, "receiptNumber", "N/A")}
          </MDTypography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Payment Details */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={6}>
            <MDTypography variant="subtitle2" color="text.secondary">
              Subscription Number:
            </MDTypography>
            <MDTypography variant="body1" fontWeight="bold">
              {get(paymentData, "subscriptionNumber", "N/A")}
            </MDTypography>
          </Grid>
          <Grid item xs={6}>
            <MDTypography variant="subtitle2" color="text.secondary">
              Payment Date:
            </MDTypography>
            <MDTypography variant="body1">
              {new Date(get(paymentData, "cashPaymentCollectedAt", new Date())).toLocaleDateString()}
            </MDTypography>
          </Grid>
          <Grid item xs={6}>
            <MDTypography variant="subtitle2" color="text.secondary">
              Cash Collected By:
            </MDTypography>
            <MDTypography variant="body1" fontWeight="bold">
              {get(paymentData, "cashPaymentCollectedBy", "N/A")}
            </MDTypography>
          </Grid>
          <Grid item xs={6}>
            <MDTypography variant="subtitle2" color="text.secondary">
              Payment Method:
            </MDTypography>
            <MDTypography variant="body1" fontWeight="bold" color="success.main">
              CASH
            </MDTypography>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Customer Information */}
        <Box mb={3}>
          <MDTypography variant="h6" fontWeight="bold" mb={2}>
            Customer Information
          </MDTypography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <MDTypography variant="body2" color="text.secondary">
                Name:
              </MDTypography>
              <MDTypography variant="body1">
                {get(subscriptionData, "customerId.firstName", "")} {get(subscriptionData, "customerId.lastName", "")}
              </MDTypography>
            </Grid>
            <Grid item xs={6}>
              <MDTypography variant="body2" color="text.secondary">
                Email:
              </MDTypography>
              <MDTypography variant="body1">
                {get(subscriptionData, "customerId.email", "N/A")}
              </MDTypography>
            </Grid>
            <Grid item xs={6}>
              <MDTypography variant="body2" color="text.secondary">
                Phone:
              </MDTypography>
              <MDTypography variant="body1">
                {get(subscriptionData, "customerId.mobile", "N/A")}
              </MDTypography>
            </Grid>
            <Grid item xs={6}>
              <MDTypography variant="body2" color="text.secondary">
                License Plates:
              </MDTypography>
              <MDTypography variant="body1">
                {subscriptionData.licensePlate.map(plate => plate.licensePlateNumber).join(", ")}
              </MDTypography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Subscription Details */}
        <Box mb={3}>
          <MDTypography variant="h6" fontWeight="bold" mb={2}>
            Subscription Details
          </MDTypography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <MDTypography variant="body2" color="text.secondary">
                Start Date:
              </MDTypography>
              <MDTypography variant="body1">
                {dates.startDate}
              </MDTypography>
            </Grid>
            <Grid item xs={6}>
              <MDTypography variant="body2" color="text.secondary">
                End Date:
              </MDTypography>
              <MDTypography variant="body1">
                {dates.endDate}
              </MDTypography>
            </Grid>
            <Grid item xs={6}>
              <MDTypography variant="body2" color="text.secondary">
                Auto Renewal:
              </MDTypography>
              <MDTypography variant="body1">
                {subscriptionData.isAutoRenew ? "Yes" : "No"}
              </MDTypography>
            </Grid>
            <Grid item xs={6}>
              <MDTypography variant="body2" color="text.secondary">
                Location:
              </MDTypography>
              <MDTypography variant="body1">
                {get(subscriptionData, "placeId.lotName", "N/A")}
              </MDTypography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Payment Breakdown */}
        <Box mb={3}>
          <MDTypography variant="h6" fontWeight="bold" mb={2}>
            Payment Breakdown
          </MDTypography>
          <Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <MDTypography variant="body2">Base Rate:</MDTypography>
              <MDTypography variant="body2">
                {amountToShow(
                  subscriptionData.isMonthly
                    ? get(subscriptionData, "firstMonthBaseRate", 0)
                    : get(subscriptionData, "baseRate", 0)
                )}
              </MDTypography>
            </Box>
            
            {get(subscriptionData, "tax", 0) > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <MDTypography variant="body2">Tax:</MDTypography>
                <MDTypography variant="body2">
                  {amountToShow(
                    subscriptionData.isMonthly
                      ? get(subscriptionData, "firstMonthTax", 0)
                      : get(subscriptionData, "tax", 0)
                  )}
                </MDTypography>
              </Box>
            )}

            {get(subscriptionData, "serviceFee", 0) > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <MDTypography variant="body2">Service Fee:</MDTypography>
                <MDTypography variant="body2">
                  {amountToShow(
                    subscriptionData.isMonthly
                      ? get(subscriptionData, "firstMonthServiceFee", 0)
                      : get(subscriptionData, "serviceFee", 0)
                  )}
                </MDTypography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-between">
              <MDTypography variant="h6" fontWeight="bold">
                Total Amount:
              </MDTypography>
              <MDTypography variant="h6" fontWeight="bold" color="primary">
                {amountToShow(get(paymentData, "totalAmount", 0))}
              </MDTypography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Footer */}
        <Box textAlign="center" mt={4}>
          <MDTypography variant="body2" color="text.secondary" mb={2}>
            Thank you for your payment!
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary">
            This receipt serves as proof of payment for your subscription.
          </MDTypography>
        </Box>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="center" gap={2} mt={4}>
          <Button
            variant="outlined"
            onClick={handlePrint}
            sx={{ minWidth: 120 }}
          >
            Print Receipt
          </Button>
          <Button
            variant="contained"
            onClick={handleDownload}
            sx={{ minWidth: 120 }}
          >
            Download PDF
          </Button>
        </Box>
      </Paper>
    </MDBox>
  );
};

export default CashPaymentReceipt; 