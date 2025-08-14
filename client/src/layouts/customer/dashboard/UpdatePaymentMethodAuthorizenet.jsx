import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import CreditCardInput from 'react-credit-card-input';
import { useAcceptJs } from 'react-acceptjs';
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

const authData = {
	apiLoginID: process.env.REACT_APP_AUTHORIZENET_API_LOGIN_ID,
	clientKey: process.env.REACT_APP_AUTHORIZENET_PUBLIC_CLIENT_KEY
};

const environment = process.env.REACT_APP_AUTHORIZENET_ENVIRONMENT;

const UpdatePaymentMethod = ({
  setUpdateCard,
  setPaymentMethodEdit,
  subscriptionId,
  setSuccessMessage,
}) => {
	const theme = useTheme();
	const dispatch = useDispatch();
	const [errorAlert, setErrorAlert] = useState(false);
	const [errorMessages, setErrorMessages] = useState("");
	const [cardNumber, setCardNumber] = useState('');
	const [expiry, setExpiry] = useState('');
	const [cvc, setCvc] = useState('');
	const [isCardNumberValid, setIsCardNumberValid] = useState(false);
	const [isExpiryValid, setIsExpiryValid] = useState(false);
	const [isCvcValid, setIsCvcValid] = useState(false);
	const [disableSubmit, setDisableSubmit] = useState(false);
	
	const { dispatchData, loading } = useAcceptJs({ environment, authData });

  // Basic validation functions
	const validateCardNumber = (number) => {
		const regex = /^[0-9]{15,16}$/;
		return regex.test(number);
	};

	const validateExpiry = (expiry) => {
		const [month, year] = expiry.split('/').map((val) => parseInt(val, 10));
		if (!month || !year) return false;
		if (month < 1 || month > 12) return false;

		const now = new Date();
		const expiryDate = new Date(`20${year}`, month - 1); // Create a date object
		return expiryDate >= now;
	};

	const validateCvc = (cvc) => {
		const regex = /^[0-9]{3}$/;
		return regex.test(cvc);
	};

	const handleCardNumberChange = (event) => {
		const value = event.target.value.replace(/\s/g, ''); // Remove spaces
		setCardNumber(value);
		setIsCardNumberValid(validateCardNumber(value));
	};

	const handleExpiryChange = (event) => {
		const value = event.target.value;
		setExpiry(value);
		setIsExpiryValid(validateExpiry(value));
	};

	const handleCvcChange = (event) => {
		const value = event.target.value;
		setCvc(value);
		setIsCvcValid(validateCvc(value));
	};

	const handleUpdatePaymentMethod = async (e) => {
		setDisableSubmit(true);
		e.preventDefault();
		// Dispatch CC data to Authorize.net and receive payment token for use on your server
		try {
			const response = await dispatchData({
				cardData: {
					cardNumber,
					month: (expiry.split('/')[0]).trim(),
					year: (expiry.split('/')[1]).trim(),
					cardCode: cvc,
				}
			});

			if (response.messages.resultCode === 'Ok') {
				const params = {
					subscriptionId: subscriptionId,
					paymentToken: response.opaqueData.dataValue,
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
							setErrorMessages(result.message || "Failed to update payment method");
							setErrorAlert(true);
							setDisableSubmit(false);
						}
					})
					.catch((err) => {
						setDisableSubmit(false);
						throw err;
					});
      }
    }
		catch (error) {
			setErrorMessages(error.messages?.message && error.messages?.message[0].text || "An error occurred while processing your payment. Please try again.");
			setErrorAlert(true);
			setDisableSubmit(false);
		}
  };

  const isPaymentFormValid = isCardNumberValid && isExpiryValid && isCvcValid;

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
          {errorMessages || "Please First Fill Your Card Details"}
        </Alert>
      )}
      <Paper
        variant="outlined"
        className="px-2"
        sx={{ py: 1.3, width: "100%" }}
      >
        <CreditCardInput
          cardNumberInputProps={{ value: cardNumber, onChange: handleCardNumberChange}}
          cardExpiryInputProps={{ value: expiry, onChange: handleExpiryChange}}
          cardCVCInputProps={{ value: cvc, onChange: handleCvcChange}}
          fieldClassName="input"
        />
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
          onClick={handleUpdatePaymentMethod}
          disabled={loading || !isPaymentFormValid || disableSubmit}
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
