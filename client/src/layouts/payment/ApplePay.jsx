import React, { useEffect, useState } from "react";

import {
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Typography } from "@mui/material";

const ApplePay = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);

  const options = {
    paymentRequest,
    style: {
      paymentRequestButton: {
        type: "default",
        // One of 'default', 'book', 'buy', or 'donate'
        // Defaults to 'default'

        theme: "dark",
        // One of 'dark', 'light', or 'light-outline'
        // Defaults to 'dark'

        height: "64px",
        // Defaults to '40px'. The width is always '100%'.
      },
    },
  };

  useEffect(() => {
    if (!stripe || !elements) {
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Total Amount",
          amount: 1000, //floor(amount * 100)
        },
        requestPayerName: true,
        requestPayerEmail: false,
        requestShipping: false,
        /* shippingOptions: [
          {
            id: 'standard-global',
            label: 'Global shipping',
            detail: 'Arrives in 5 to 7 days',
            amount: amount * 100
          }
        ] */
      });

      // Check the availability of the Payment Request API.
      pr.canMakePayment().then((result) => {
        console.log("result", result);
        if (result) {
          // pr.on('paymentmethod', handlePaymentMethodReceived);
          setPaymentRequest(pr);
        }
      });
    }
  }, [elements, stripe]);
  console.log("paymentRequest ---->", paymentRequest);
  return (
    <>
      {paymentRequest !== null ? (
        <PaymentRequestButtonElement options={options} />
      ) : (
        <Typography variant="body1">
          Sorry, your browser is not added to the google payment method
        </Typography>
      )}
    </>
  );
};

export default ApplePay;
