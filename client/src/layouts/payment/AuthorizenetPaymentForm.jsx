import React, { useState, useEffect } from 'react';
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { Link } from "@mui/material";
import { Paper } from "@mui/material";
import { Formik } from "formik";
import { get } from "lodash";
import { useAcceptJs } from 'react-acceptjs';
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMaterialUIController } from "context";
import {
	getShortlyData,
	getAuthorizenetPaymentMethods
} from "store/slice/payment/paymentSlice";
import { amountToShow } from "global/functions";
import axios from 'axios';
import CreditCardInput from 'react-credit-card-input';
import PaymentSkeleton from "./PaymentSkelton";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import AuthorizenetCard from "./components/AuthorizenetCard";

const authData = {
	apiLoginID: process.env.REACT_APP_AUTHORIZENET_API_LOGIN_ID,
	clientKey: process.env.REACT_APP_AUTHORIZENET_PUBLIC_CLIENT_KEY
};
const environment = process.env.REACT_APP_AUTHORIZENET_ENVIRONMENT;

const AuthorizenetPaymentForm = () => {
	const [controller] = useMaterialUIController();
	const { darkMode, sidenavColor } = controller;
	const { dispatchData, loading, error } = useAcceptJs({ environment, authData });

	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();

	const shortlyId = new URLSearchParams(location?.search).get("shortlyId");

	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [cardData, setCardData] = useState({});
	const [cardSelected, setCardSelected] = useState(false);
	const [subscriptionData, setSubscriptionData] = useState({});
	const [cardNumber, setCardNumber] = useState('');
	const [expiry, setExpiry] = useState('');
	const [cvc, setCvc] = useState('');
	const [isCardNumberValid, setIsCardNumberValid] = useState(false);
	const [isExpiryValid, setIsExpiryValid] = useState(false);
	const [isCvcValid, setIsCvcValid] = useState(false);
	const [shortlyData, setShortlyData] = useState({});
	const [processLoading, setProcessLoading] = useState(false);
	const [disableSubmit, setDisableSubmit] = useState(false);
	const [paymentProfiles, setPaymentProfiles] = useState({});

	const totalPayAmount = subscriptionData.isMonthly
		? get(subscriptionData, "firstMonthTotalAmount", 0)
		: get(subscriptionData, "totalAmount", 0);

	useEffect(() => {
		console.log("shortlyId ====>", shortlyId);
		if (!shortlyId) {
			navigate("/");
		} else {
			handleGetShortlyData();
		}
	}, [shortlyId]);

	async function getPaymentMethods(subscriptionData) {
		try {
			const paymentMethods = await dispatch(getAuthorizenetPaymentMethods({
				customerId: subscriptionData.customerId._id, 
				placeId: subscriptionData.placeId._id
			})).unwrap();
			setPaymentProfiles(paymentMethods.paymentProfiles);
		} catch (error) {
			console.error("Failed to get payment methods:", error);
		}
	}

	async function handleGetShortlyData() {
		try {
			setProcessLoading(true);
			const res = await dispatch(getShortlyData(shortlyId)).unwrap();
			if (!res?.success) {
				handleErrorResponse(res);
				return;
			}
			setShortlyData(res?.shortlyData);
			if (!res.shortlyData?.subscriptionId) {
				setProcessLoading(false);
				return;
			}
			const { subscriptionId, brandLogo } = res.shortlyData;
			setSubscriptionData(subscriptionId || {});

			getPaymentMethods(subscriptionId);
		} catch (error) {
			console.error("Failed to get shortly data:", error);
		} finally {
			setProcessLoading(false);
		}
  	}

	function handleErrorResponse(res) {
		const statusMap = {
			"Payment Link Expired": "expired",
			"Invalid Payment": "invalid",
			"Payment In Process": "inProcess",
			"Payment Already Paid": {
				status: "paid",
				data: res?.shortlyData?.subscriptionId,
			},
		};

		const status = statusMap[res?.message];
		if (!status) return;

		navigate("payment-result", {
			state: typeof status === "object" ? status : { status },
		});
  	}

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
		const regex = /^(?:[0-9]{3}|[0-9]{4})$/;
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

	const handleCardClick = (card) => {
		setCardSelected(true);
		setCardData(card);
	}

	const handleChooseOtherCard = () => {
		setCardSelected(false);
		setCardData({});
	}

	const handleCardSubmit = async (card) => {
		setDisableSubmit(true);
		try {
			const paymentData = {
				paymentProfileId: card.customerPaymentProfileId,
				subscriptionId: subscriptionData._id,
				totalAmount: totalPayAmount
			};

			const serverResponse = await axios.post(
				`${process.env.REACT_APP_API_END_POINT}/payment/authorizenet/makePayment`,
				paymentData
			);

			if (serverResponse?.data?.success) {
				setSuccessMessage('Payment Done successfully!');
				setErrorMessage('');
				navigate("payment-result", {
					state: {
						status: "paid",
						data: serverResponse.data.data,
					},
				});
			} else {
				setSuccessMessage('');
				setErrorMessage(`Server Error: ${serverResponse?.data?.message || 'Unknown Error'}`);
				navigate("payment-result", {
					state: { status: "failed", data: serverResponse.data },
				});
			}
		} catch (error) {
			setSuccessMessage('');
			setErrorMessage(error?.messages?.message[0] ? error.messages?.message[0].text : "Unknown Error Occurred");
		} finally {
			setDisableSubmit(false);
		}
	}

	const handleSubmit = async (event) => {
		setDisableSubmit(true);
		event.preventDefault();
		// Dispatch CC data to Authorize.net and receive payment nonce for use on your server
		try {
			const response = await dispatchData({
				cardData: {
					cardNumber,
					month: (expiry.split('/')[0]).trim(),
					year: (expiry.split('/')[1]).trim(),
					cardCode: cvc,
				}
			});
			console.log('Received response:', response);

			if (response.messages.resultCode === 'Ok') {
				const paymentData = {
					paymentToken: response.opaqueData.dataValue,
					subscriptionId: subscriptionData._id,
					totalAmount: totalPayAmount
				};

				const serverResponse = await axios.post(
					`${process.env.REACT_APP_API_END_POINT}/payment/authorizenet/makePayment`,
					paymentData
				);

				if (serverResponse?.data?.success) {
					setSuccessMessage('Payment Done successfully!');
					setErrorMessage('');
					navigate("payment-result", {
						state: {
							status: "paid",
							data: serverResponse.data.data,
						},
					});
				} else {
					setSuccessMessage('');
					setErrorMessage(`Server Error: ${serverResponse?.data?.message || 'Unknown Error'}`);
					navigate("payment-result", {
						state: { status: "failed", data: serverResponse.data },
					});
				}
			} else {
				setSuccessMessage('');
				setErrorMessage(response.messages.message[0].text);
			}
		} catch (error) {
			setSuccessMessage('');
			setErrorMessage(error?.messages?.message[0] ? error.messages?.message[0].text : "Unknown Error Occurred");
		} finally {
			setDisableSubmit(false);
		}
	};

	// return (
	// 	<div>
	// 		<form onSubmit={handleSubmit}>
	// 			<div>
	// 				<Typography variant="h6">Card Number</Typography>
	// 				<input
	// 					type="text"
	// 					name="cardNumber"
	// 					value={cardData.cardNumber}
	// 					onChange={(event) =>
	// 						setCardData({ ...cardData, cardNumber: event.target.value })
	// 					}
	// 				/>
	// 			</div>
	// 			<div>
	// 				<Typography variant="h6">Expiration Month</Typography>
	// 				<input
	// 					type="text"
	// 					name="month"
	// 					value={cardData.month}
	// 					onChange={(event) =>
	// 						setCardData({ ...cardData, month: event.target.value })
	// 					}
	// 				/>
	// 			</div>
	// 			<div>
	// 				<Typography variant="h6">Expiration Year</Typography>
	// 				<input
	// 					type="text"
	// 					name="year"
	// 					value={cardData.year}
	// 					onChange={(event) =>
	// 						setCardData({ ...cardData, year: event.target.value })
	// 					}
	// 				/>
	// 			</div>
	// 			<div>
	// 				<Typography variant="h6">Card Code</Typography>
	// 				<input
	// 					type="text"
	// 					name="cardCode"
	// 					value={cardData.cardCode}
	// 					onChange={(event) =>
	// 						setCardData({ ...cardData, cardCode: event.target.value })
	// 					}
	// 				/>
	// 			</div>
				
	// 			<button type="submit" disabled={processLoading || loading || error}>
	// 				{`Pay $${amountToShow(totalPayAmount)}`}
	// 			</button>
	// 		</form>

	// 		{ errorMessage &&
	// 			<p>Error: {errorMessage}</p>
	// 		}
	// 		{ successMessage &&
	// 			<p>{successMessage}</p>
	// 		}
	// 	</div>
	// );

	const isPaymentFormValid = isCardNumberValid && isExpiryValid && isCvcValid;
	return (
    	<>
			<MDBox component="section">
				<Container maxWidth={false}>
					<Grid container spacing={2} justifyContent="center">
						<Grid item xs={12} md={8} lg={6} xl={4}>
							<Paper variant="outlined" height="100vh">
								<>
									<MDBox
										style={{ overflowX: "hidden", height: "100vh" }}
										sx={{ background: darkMode ? "#1a2035" : "#FAF9F6" }}
									>
										<MDTypography
											variant="h5"
											className="px-3 py-2"
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: "14px",
												marginTop: "20px",
											}}
										>
											Payment Information
										</MDTypography>
										<Divider light />
										<CardContent sx={{ p: 2 }}>
											{processLoading ? (
												<PaymentSkeleton />
											) : (
												cardSelected ? (
													<>
														<AuthorizenetCard
															cardDetails={cardData}
															place={subscriptionData.placeId}
															customerId={subscriptionData.customerId._id}
															variant="main"
														/>

														<MDBox
															display="flex"
															flexDirection="column"
															justifyContent="center"
															alignItems="center"
															className="my-3"
														>
															<MDTypography
																variant="caption"
																color="text"
																className="cursor-pointer"
																onClick={handleChooseOtherCard}
															>
																Select another payment method
															</MDTypography>
														</MDBox>  

														<Box className="text-center">
															<MDButton
																variant="contained"
																color={sidenavColor}
																onClick={() => handleCardSubmit(cardData)}
																disabled={loading || disableSubmit}
																sx={{ width: { xs: "150px", sm: "250px" } }}
															>
																{`Pay $${amountToShow(totalPayAmount)}`}
															</MDButton>
														</Box>
													</>
												) : (
													<>
														<>
															{(paymentProfiles && paymentProfiles.length > 0) && (
																<MDBox>
																	<MDTypography
																		sx={{ textAlign: "left" }}
																		variant="h6"
																		fontSize="14px"
																	>
																		Please select a card
																	</MDTypography>

																	<MDBox>
																		{paymentProfiles.map((card) => (
																			<AuthorizenetCard
																				cardDetails={card}
																				place={subscriptionData.placeId}
																				customerId={subscriptionData.customerId._id}
																				variant="list"
																				onClick={() => handleCardClick(card)}
																				getPaymentMethods={() => getPaymentMethods(subscriptionData)}
																			/>
																		))}
																	</MDBox>

																	<MDBox
																		display="flex"
																		flexDirection="column"
																		justifyContent="center"
																		alignItems="center"
																		className="my-3"
																	>
																		<MDTypography variant="caption" color="text">
																			OR
																		</MDTypography>
																	</MDBox>
																</MDBox>
															)}
														</>
														<Formik>
															<>
																<MDBox>
																	<MDTypography
																		sx={{ textAlign: "left" }}
																		variant="h6"
																		fontSize="14px"
																	>
																		Please enter the card details below
																	</MDTypography>
																</MDBox>

																<Box className="my-3">
																	<CreditCardInput
																		cardNumberInputProps={{ value: cardNumber, onChange: handleCardNumberChange}}
																		cardExpiryInputProps={{ value: expiry, onChange: handleExpiryChange}}
																		cardCVCInputProps={{ value: cvc, onChange: handleCvcChange}}
																		fieldClassName="input"
																	/>
																</Box>

																<Box className="text-center">
																	<MDButton
																		variant="contained"
																		color={sidenavColor}
																		onClick={handleSubmit}
																		disabled={loading || !isPaymentFormValid || disableSubmit}
																		sx={{ width: { xs: "150px", sm: "250px" } }}
																	>
																		{`Pay ₨${amountToShow(totalPayAmount)}`}
																	</MDButton>
																</Box>
																<Divider light className="my-3" />
															</>
														</Formik>
													</>
												)
											)}

											{ errorMessage &&
												<p>Error: {errorMessage}</p>
											}
											{ successMessage &&
												<p>{successMessage}</p>
											}

											<Divider dark className="my-3" />

											<MDBox
												mt={3}
												display="flex"
												justifyContent="center"
												alignItems="center"
											>
												<MDBox
													display="flex"
													flexDirection="column"
													justifyContent="center"
													alignItems="center"
												>
													<MDTypography variant="caption" color="text">
														Payments Powered By
													</MDTypography>
													<MDBox>
														<img
															src={shortlyData.brandLogo}
															alt="card"
															style={{
																width: "80px",
																height: "40px",
																marginTop: "15px",
																objectFit: "contain",
																backgroundColor: "#FAF9F6",
															}}
														/>
													</MDBox>
												</MDBox>
											</MDBox>
											<MDBox>
												<MDTypography
													variant="caption"
													fontWeight="bold"
													fontSize="10px"
													display="flex"
													alignItems="center"
													justifyContent="center"
													marginTop="15px"
												>
													By tapping pay, you agree to the&nbsp;
													<Link
														                href="https://www.spotsync.com/terms-of-use/"
														color="primary"
														fontWeight="bold"
														fontSize="10px"
													>
														Terms of use
													</Link>
													&nbsp; and&nbsp;
													<Link
														                href="https://www.spotsync.com/privacy-policy/"
														color="primary"
														fontWeight="bold"
														fontSize="10px"
													>
														Privacy Policy
													</Link>
												</MDTypography>
											</MDBox>
										</CardContent>
									</MDBox>
								</>
							</Paper>
						</Grid>
					</Grid>
				</Container>
			</MDBox>
    	</>
  	)
};

export default AuthorizenetPaymentForm;
