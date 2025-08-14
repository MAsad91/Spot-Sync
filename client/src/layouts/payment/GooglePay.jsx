import React, { useEffect, useState } from "react";

import {
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Typography } from "@mui/material";

const GooglePay = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);

  console.log("paymentRequest ====>", paymentRequest);
  const options = {
    paymentRequest,
    style: {
      paymentRequestButton: {
        type: "default",
        theme: "dark",
        height: "64px",
      },
    },
  };

  useEffect(() => {
    if (!stripe || !elements) {
      console.log("Stripe ===>", stripe);
      console.log("elements ===>", elements);
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Demo total",
          amount: 1350,
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestShipping: true,
        shippingOptions: [
          {
            id: "standard-global",
            label: "Global shipping",
            detail: "Arrives in 5 to 7 days",
            amount: 350,
          },
        ],
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
  return (
    <>
      {paymentRequest ? (
        <PaymentRequestButtonElement options={options} />
      ) : (
        <Typography variant="body1">
          Sorry, your browser is not added to the google payment method
        </Typography>
      )}
    </>
  );
};

export default GooglePay;
