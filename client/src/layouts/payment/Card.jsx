import React, { useState } from "react";

import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import Alert from "@mui/material/Alert";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { get, isEmpty } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMaterialUIController } from "context";

import SavedCards from "./SavedCards";
import MDButton from "components/MDButton";
import { postCardPayment, updateSubscriptionAfter3dSecure } from "store/slice/payment/paymentSlice";
import { amountToShow } from "global/functions";

const Card = (props) => {
  const { subscriptionData, formikProps } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const stripe = useStripe();
  const elements = useElements();
  const cardDetails = useSelector((state) => state.payment.cardDetails);
  const [show, setShow] = useState(!isEmpty(cardDetails));
  const [errorAlert, setErrorAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const subscriptionId = get(subscriptionData, "_id", "");
  const customerId = get(subscriptionData, "customerId._id", "");
  const totalPayAmount = subscriptionData.isMonthly
    ? get(subscriptionData, "firstMonthTotalAmount", 0)
    : get(subscriptionData, "totalAmount", 0);

  const handlePayment = (stripe, elements) => async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    const cardElement = elements.getElement(CardElement);
    const isInvalid = get(cardElement, "_invalid", false);
    const isEmpty = get(cardElement, "_empty", false);
    const isValid = !(isEmpty || isInvalid);

    const postPayment = async (cardId, saveLater) => {
      const payload = {
        subscriptionId,
        customerId,
        paymentMethodId: cardId,
        saveCard: saveLater,
      };
      const res = await dispatch(postCardPayment(payload))
        .unwrap()
        .then(async (result) => {
          if (result.success) {
            if (result.requiresAction) {
              const { error, paymentIntent } = await stripe.confirmCardPayment(result.clientSecret);
              const payload = {
                securePaymentDataId: result.securePaymentDataId,
                paymentIntent,
                error: error?.message,
              }
              const res2 = await dispatch(updateSubscriptionAfter3dSecure(payload))
                .unwrap()
                .then(async (result) => {
                  if (result.success) {
                    setLoading(false);
                    navigate("payment-result", {
                      state: {
                        status: "paid",
                        data: result.data,
                      },
                    });
                  } else {
                    navigate("payment-result", {
                      state: { status: "failed", data: result },
                    });
                  }
                })
            } else {
              setLoading(false);
              navigate("payment-result", { state: { status: "paid", data: res.data } });
            }
          } else {
            navigate("payment-result", {
              state: { status: "failed", data: result },
            });
          }
        })
        .catch((error) => {
          console.log("post payment error========>", error);
        });
      return res;
    };

    if (!show) {
      if (isValid) {
        setErrorAlert(false);
        setLoading(true);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });
        if (error) {
          setErrorAlert(true);
          setLoading(false);
          console.log("error ===>", error);
        } else {
          postPayment(
            get(paymentMethod, "id", ""),
            get(formikProps, "values.saveLater", false)
          );
        }
      } else {
        setErrorAlert(true);
      }
    } else {
      setLoading(true);
      postPayment(
        get(formikProps, "values.selectedCard", ""),
        get(formikProps, "values.saveLater", false)
      );
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    iconStyle: "solid",
    hidePostalCode: true,
    style: {
      base: {
        iconColor: `${theme.palette.secondary.main}`,
        color: `${theme.palette.secondary.main}`,
        fontSize: "18px",
        fontWeight: 500,
        fontSmoothing: "antialiased",
        ":-webkit-autofill": {
          color: "#fce883",
        },
        "::placeholder": {
          color: `${theme.palette.grey[400]}`,
        },
      },
      invalid: {
        color: `${theme.palette.error.main}`,
        ":focus": {
          color: `${theme.palette.error.light}`,
        },
      },
    },
  };

  return (
    <>
      {show ? (
        <>
          <SavedCards
            customerId={customerId}
            formikProps={formikProps}
            setShow={setShow}
          />
          <Typography
            variant="subtitle1"
            color="secondary"
            className="my-3 text-center cursor-pointer"
            onClick={() => setShow(!show)}
            fontSize="16px"
          >
            + Add a new Card
          </Typography>
        </>
      ) : (
        <>
          {errorAlert && (
            <Alert
              severity="error"
              className="mb-2"
              onClose={() => {
                setErrorAlert(false);
              }}
            >
              Please First Fill Your Card Details
            </Alert>
          )}
          <Paper
            variant="outlined"
            className="px-2"
            sx={{ py: 1.3, width: "100%" }}
          >
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </Paper>
          <FormGroup
            className="my-1"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  name="saveLater"
                  checked={formikProps.values.saveLater}
                  onChange={formikProps.handleChange}
                  disabled={subscriptionData.isAutoRenew}
                />
              }
              label="Save Card"
            />
          </FormGroup>
          {!isEmpty(cardDetails) && (
            <Typography
              variant="subtitle1"
              component="p"
              color="secondary"
              className="mb-3 d-flex align-items-center justify-content-center gap-2 cursor-pointer"
              onClick={() => setShow(!show)}
            >
              <RemoveRedEyeIcon /> View All Cards
            </Typography>
          )}
        </>
      )}
      <Box className="text-center">
        <MDButton  
          variant="contained"
          color={sidenavColor}
          onClick={handlePayment(stripe, elements)}
          disabled={loading}
          sx={{ width: { xs: "150px", sm: "250px" } }}
        >
          {`Pay $${amountToShow(totalPayAmount)}`}
        </MDButton>
      </Box>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <Stack direction="column" spacing={1} alignItems="center">
          <CircularProgress color="inherit" />
          <Typography
            variant="h5"
            sx={{ color: "primary.contrastText" }}
            className="mt-4"
          >
            Please wait payment is processing.....
          </Typography>
        </Stack>
      </Backdrop>
    </>
  );
};

export default Card;
