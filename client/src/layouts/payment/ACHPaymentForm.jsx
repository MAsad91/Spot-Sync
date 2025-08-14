import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { get } from "lodash";
import {
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { amountToShow } from "global/functions";
import { useNavigate } from "react-router-dom";

const ACHPaymentForm = (props) => {
  const navigate = useNavigate();
  const { clientSecret, subscriptionData } = props;
  const stripe = useStripe();
  const elements = useElements();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    isAlert: false,
  });
  const customerEmail = get(subscriptionData, "customerId.email", false);
  const totalPayAmount = subscriptionData.isMonthly
    ? get(subscriptionData, "firstMonthTotalAmount", 0)
    : get(subscriptionData, "totalAmount", 0);

  console.log("clientSecret in from =====>", clientSecret);
  console.log("subscriptionData in from =====>", subscriptionData);

  useEffect(() => {
    if (!stripe) {
      return;
    }
    if (!clientSecret) {
      return;
    }
    stripe
      .retrievePaymentIntent(clientSecret)
      .then(({ paymentIntent }) => {
        console.log("intent ====>", paymentIntent);
        console.log("status ====>", paymentIntent.status);
        switch (paymentIntent.status) {
          case "succeeded":
            navigate(
              `${
                process.env.REACT_APP_FRONT_END_DOMAIN
              }/payment/payment-result-ach?SN=${
                subscriptionData.subscriptionNumber || ""
              }&total=${totalPayAmount}`
            );
            break;
          case "processing":
            navigate(
              `payment/payment-result-ach?SN=${
                subscriptionData.subscriptionNumber || ""
              }&total=${totalPayAmount}`
            );
            break;
          case "requires_payment_method":
            
            break;
          default:
            setAlert({
              isAlert: true,
              error: false,
              message: "Something went wrong.",
            });
            break;
        }
      })
      .catch((err) => {
        console.log("error --->", err);
      });
  }, [clientSecret, props.clientSecret, stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    const response = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.REACT_APP_FRONT_END_DOMAIN}/payment/payment-result-ach?SN=${subscriptionData.subscriptionNumber}&total=${totalPayAmount}`,
        receipt_email: customerEmail,
      },
    });
    console.log("rs =====>: ", response);
    if (
      response.error.type === "card_error" ||
      response.error.type === "validation_error"
    ) {
      setAlert({
        isAlert: true,
        error: true,
        message: response.error.message,
      });
    } else {
      setAlert({
        isAlert: true,
        error: true,
        message: "An unexpected error occurred.",
      });
    }

    if (response.error) {
      setAlert({
        isAlert: true,
        error: true,
        message: response.error.message,
      });
    } else {
      setAlert({
        isAlert: true,
        error: false,
        message: "Payment succeeded!",
      });
      // setMessage("Payment succeeded!");
    }
    setIsLoading(false);
  };

  return (
    <>
      {alert.isAlert && (
        <Alert
          severity={alert.error ? "error" : "success"}
          className="mb-2"
          onClose={() => {
            setAlert({ isAlert: false });
          }}
        >
          {alert.message}
        </Alert>
      )}
      <Paper variant="outlined" className="p-2" sx={{ py: 1.3, width: "100%" }}>
        <PaymentElement id="payment-element" />
      </Paper>

      <Box mt={2} className="text-center">
        <MDButton
          variant="contained"
          color={sidenavColor}
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{ width: { xs: "150px", sm: "250px" } }}
        >
          {`Pay $${amountToShow(totalPayAmount)}`}
        </MDButton>
      </Box>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <Stack direction="column" spacing={1} alignItems="center">
          <CircularProgress color="inherit" />
          <Typography
            variant="h5"
            sx={{ color: "primary.contrastText" }}
            className="mt-4"
          >
            Please wait.....
          </Typography>
        </Stack>
      </Backdrop>
    </>
  );
};

export default ACHPaymentForm;
