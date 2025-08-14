import React, { useState } from "react";
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Box,
  Divider,
} from "@mui/material";
import { get } from "lodash";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { amountToShow } from "global/functions";

const CashPaymentForm = ({ subscriptionData, formikProps }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errorAlert, setErrorAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cashCollectorName, setCashCollectorName] = useState("");

  const totalPayAmount = subscriptionData.isMonthly
    ? get(subscriptionData, "firstMonthTotalAmount", 0)
    : get(subscriptionData, "totalAmount", 0);

  const handleCashPayment = async (e) => {
    e.preventDefault();
    
    if (!cashCollectorName.trim()) {
      setErrorAlert(true);
      return;
    }

    setErrorAlert(false);
    setLoading(true);

    try {
      const payload = {
        subscriptionId: subscriptionData._id,
        cashPaymentCollectedBy: cashCollectorName.trim(),
        customerId: get(subscriptionData, "customerId._id", ""),
        shortlyId: get(subscriptionData, "shortlyId", ""),
      };

      // Import the API function
      const { cashPaymentAPI } = await import("../../api/paymentApi");
      const response = await cashPaymentAPI(payload);

      if (response.data.success) {
        // Navigate to success page
        navigate("/payment/result", {
          state: {
            status: "paid",
            data: response.data.data,
            paymentMethod: "cash",
          },
        });
      } else {
        setErrorAlert(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Cash payment error:", error);
      setErrorAlert(true);
      setLoading(false);
    }
  };

  return (
    <MDBox>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <MDTypography variant="h6" fontWeight="bold" mb={2}>
          Cash Payment
        </MDTypography>
        
        <MDTypography variant="body2" color="text.secondary" mb={3}>
          Please enter the name of the person who collected the cash payment.
        </MDTypography>

        {errorAlert && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Please enter the cash collector's name.
          </Alert>
        )}

        <form onSubmit={handleCashPayment}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Cash Collector Name"
              variant="outlined"
              value={cashCollectorName}
              onChange={(e) => setCashCollectorName(e.target.value)}
              placeholder="Enter the name of person who collected cash"
              required
              error={errorAlert && !cashCollectorName.trim()}
              helperText={errorAlert && !cashCollectorName.trim() ? "Cash collector name is required" : ""}
            />

            <Divider />

            <Box>
              <MDTypography variant="h6" fontWeight="bold" mb={1}>
                Payment Summary
              </MDTypography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
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
                  <Box display="flex" justifyContent="space-between">
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
                  <Box display="flex" justifyContent="space-between">
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

                <Divider />

                <Box display="flex" justifyContent="space-between">
                  <MDTypography variant="h6" fontWeight="bold">
                    Total Amount:
                  </MDTypography>
                  <MDTypography variant="h6" fontWeight="bold" color="primary">
                    {amountToShow(totalPayAmount)}
                  </MDTypography>
                </Box>
              </Stack>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !cashCollectorName.trim()}
              sx={{ mt: 2 }}
            >
              {loading ? "Processing..." : "Confirm Cash Payment"}
            </Button>
          </Stack>
        </form>
      </Paper>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </MDBox>
  );
};

export default CashPaymentForm; 