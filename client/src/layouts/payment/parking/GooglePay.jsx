import React, { useEffect, useState } from "react";
import {
  PaymentRequestButtonElement,
  useStripe,
} from "@stripe/react-stripe-js";
import { Typography } from "@mui/material";
import PaymentSkeleton from "../PaymentSkelton";
import { floor, get } from "lodash";
import MDBox from "components/MDBox";
import { postParkingCardPayment } from "store/slice/payment/paymentSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const GooglePay = ({ shortlyData }) => {
  const { sessionId, totalAmount, _id, customerId } = shortlyData;
  const stripe = useStripe();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stripe) {
      setLoading(true);
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Total Amount",
          amount: floor(totalAmount),
        },
        requestPayerName: true,
        requestPayerEmail: false,
        requestShipping: false,
      });

      // Check the availability of the Payment Request API.
      pr.canMakePayment().then((result) => {
        console.log("result gpay--->", result);
        if (result) {
          pr.on("paymentmethod", handlePaymentMethodReceived);
          pr.sessionId = sessionId;
          setPaymentRequest(pr);
          setLoading(false);
        }
        setLoading(false);
      });
    }
  }, [stripe]);
  const handlePaymentMethodReceived = async (event) => {
    const payload = {
      shortlyId: _id,
      customerId,
      paymentMethodId: get(event, "paymentMethod.id", ""),
      paymentMethodType: event.walletName,
    };
    const res = await dispatch(postParkingCardPayment(payload))
      .unwrap()
      .then(async (result) => {
        if (result.success) {
          setLoading(false);
          navigate("/parking/payment/result", {
            state: {
              status: "paid",
              data: result.data,
            },
          });
        } else {
          navigate("/parking/payment/result", {
            state: { status: "failed", data: result },
          });
        }
      })
      .catch((error) => {
        console.log("post payment error========>", error);
      });
    return res;
  };

  const options = {
    paymentRequest,
    style: {
      paymentRequestButton: {
        type: "default",
        theme: "dark",
        height: "53px",
        width: "100%",
        boxShadow: "none",
      },
    },
  };

  return (
    <>
      {loading ? (
        <PaymentSkeleton />
      ) : (
        <>
          <MDBox my={2}>
            {paymentRequest ? (
              <PaymentRequestButtonElement options={options} />
            ) : (
              <Typography variant="body1">
                Sorry, your browser is not added to the google payment method
              </Typography>
            )}
          </MDBox>
        </>
      )}
    </>
  );
};

export default GooglePay;
