import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { get } from "lodash";
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import MDBox from "components/MDBox";
import { updatePaymentMethod } from "store/slice/customer/customerSlice";
import { useDispatch } from "react-redux";
import { getSubscriptionsList } from "store/slice/customer/customerSlice";

const UpdatePaymentMethod = ({
  setUpdateCard,
  setPaymentMethodEdit,
  subscriptionId,
  setSuccessMessage,
}) => {
  const theme = useTheme();
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [errorAlert, setErrorAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdatePaymentMethod = (stripe, elements) => async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    const cardElement = elements.getElement(CardElement);
    const isInvalid = get(cardElement, "_invalid", false);
    const isEmpty = get(cardElement, "_empty", false);
    const isValid = !(isEmpty || isInvalid);

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
      } else {
        const params = {
          subscriptionId: subscriptionId,
          paymentMethodId: paymentMethod.id,
        };
        await dispatch(updatePaymentMethod(params))
          .unwrap()
          .then(async (result) => {
            if (result.success) {
              await dispatch(getSubscriptionsList());
              setUpdateCard(false);
              setPaymentMethodEdit(false);
              setSuccessMessage(true);
            } else {
              setLoading(false);
            }
          })
          .catch((err) => {
            setLoading(false);
            throw err;
          });
      }
    } else {
      setErrorAlert(true);
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

      <MDBox
        display="flex"
        justifyContent="end"
        gap={2}
        mt={2}
        className="text-center"
      >
        <Button
          color="white"
          variant="contained"
          size="small"
          onClick={handleUpdatePaymentMethod(stripe, elements)}
          disabled={loading}
        >
          Submit
        </Button>
        <Button
          color="white"
          variant="contained"
          size="small"
          onClick={() => {
            setUpdateCard(false);
            setPaymentMethodEdit(false);
          }}
        >
          Cancel
        </Button>
      </MDBox>
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
            Please wait .....
          </Typography>
        </Stack>
      </Backdrop>
    </>
  );
};

export default UpdatePaymentMethod;
