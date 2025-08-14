const { default: axios } = require("axios");
const Customer = require("../models/customers");
const {
	generateSerialNumber
} = require("../global/functions");
const { get } = require("lodash");

const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const SDKConstants = require('authorizenet').Constants;

class Authorizenet {
	transactionKey = process.env.AUTHORIZENET_TRANSACTION_KEY;
	apiLoginKey = process.env.AUTHORIZENET_API_LOGIN_ID;

	constructor(place) {
		if (place && place.authorizenetSettings &&
			place.authorizenetSettings.apiLoginKey &&
			place.authorizenetSettings.transactionKey) {
			this.apiLoginKey = place.authorizenetSettings.apiLoginKey;
			this.transactionKey = place.authorizenetSettings.transactionKey;
		}
	}

	getApiUrl = () => {
		return process.env.AUTHORIZENET_API_URL;
	}

	isStagingEnv = () => {
		return process.env.AUTHORIZENET_ENVIRONMENT === 'SANDBOX';
	}

	setPaymentProfile = async (customer, paymentProfileId) => {
		let currentProfile = customer.authorizenetCustomerIds[this.apiLoginKey];
		currentProfile["customerPaymentProfileId"] = paymentProfileId;

		customer.authorizenetCustomerIds = {
			...customer.authorizenetCustomerIds,
			[this.apiLoginKey]: currentProfile
		};

		const findQuery = { _id: customer._id };
		const insertObj = {
			authorizenetCustomerIds: customer.authorizenetCustomerIds
		};
		await Customer.findOneAndUpdateCustomer(findQuery, insertObj, {
			upsert: true
		});
	}

	getAuthorizeNetProfile = (customer) => {
		return {
			profileId: customer.authorizenetCustomerIds[this.apiLoginKey]["customerProfileId"],
			paymentProfileId: customer.authorizenetCustomerIds[this.apiLoginKey]["customerPaymentProfileId"]
		}
	}

	customerProfileExists = (customer) => {
		return customer.authorizenetCustomerIds
			&& customer.authorizenetCustomerIds[this.apiLoginKey]
			&& customer.authorizenetCustomerIds[this.apiLoginKey].customerProfileId;
	}

	getMerchantAuthentication = () => {
		const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
		merchantAuthenticationType.setName(this.apiLoginKey);
		merchantAuthenticationType.setTransactionKey(this.transactionKey);

		return merchantAuthenticationType;
	};

	createCustomerProfile = async (customer) => {
		if (this.customerProfileExists(customer)) {
			console.log('Customer profile already exists');
			return;
		}
		const merchantAuthenticationType = this.getMerchantAuthentication();

		const customerProfileType = new ApiContracts.CustomerProfileType();
		customerProfileType.setMerchantCustomerId('M_' + new Date().getTime());
		if (customer.email) {
			customerProfileType.setEmail(customer.email);
		} else {
			customerProfileType.setEmail(customer.mobile);
		}

		const createRequest = new ApiContracts.CreateCustomerProfileRequest();
		createRequest.setProfile(customerProfileType);
		createRequest.setMerchantAuthentication(merchantAuthenticationType);

		const ctrl = new ApiControllers.CreateCustomerProfileController(createRequest.getJSON());
		if (!this.isStagingEnv()) {
			ctrl.setEnvironment(SDKConstants.endpoint.production);
		}

		ctrl.execute(() => {
			const apiResponse = ctrl.getResponse();
			const response = new ApiContracts.CreateCustomerProfileResponse(apiResponse);

			if (response != null && response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
				console.log('Successfully created a customer profile with id: ' + response.getCustomerProfileId());

				// update customer with authorizenetCustomerIds
				customer.authorizenetCustomerIds = {
					...customer.authorizenetCustomerIds,
					[this.apiLoginKey]: {
						customerProfileId: response.getCustomerProfileId(),
						customerPaymentProfileId: response.getCustomerPaymentProfileIdList().getNumericString()[0],
					}
				};
				customer.save();
			} else {
				console.log('Failed to create customer profile', response);
				console.log('Result Code: ' + response.getMessages().getResultCode());
				console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
				console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
			}
		});
	};

	//Todo not using this function
	getCustomerProfile(customerProfileId, callback) {

		const merchantAuthenticationType = this.getMerchantAuthentication();

		const getRequest = new ApiContracts.GetCustomerProfileRequest();
		getRequest.setCustomerProfileId(customerProfileId);
		getRequest.setMerchantAuthentication(merchantAuthenticationType);
			
		const ctrl = new ApiControllers.GetCustomerProfileController(getRequest.getJSON());
		if (!this.isStagingEnv()) {
			ctrl.setEnvironment(SDKConstants.endpoint.production);
		}

		ctrl.execute(function() {
			const apiResponse = ctrl.getResponse();

			const response = new ApiContracts.GetCustomerProfileResponse(apiResponse);

			//pretty print response
			console.log("response:", JSON.stringify(response, null, 2));

			if(response != null) 
			{
				if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK)
				{
					console.log('Customer profile ID : ' + response.getProfile().getCustomerProfileId());
					console.log('Customer Email : ' + response.getProfile().getEmail());
					console.log('Description : ' + response.getProfile().getDescription());
				}
				else
				{
					//console.log('Result Code: ' + response.getMessages().getResultCode());
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
				}
			}
			else
			{
				console.log('Null response received');
			}

			callback(response);
		});
	}

	getCustomerPaymentProfiles = async (customer) => {
		const customerProfileId = customer.authorizenetCustomerIds[this.apiLoginKey]["customerProfileId"];
		const payload = {
				getCustomerProfileRequest: {
					merchantAuthentication: {
						name: this.apiLoginKey,
						transactionKey: this.transactionKey,
					},
					customerProfileId: customerProfileId
				}
		};

		try {
			const response = await axios.post(this.getApiUrl(), payload, {
				headers: {
						'Content-Type': 'application/json'
				}
			});

			console.log("response.data", response.data);
			return ({
				success: true,
				paymentProfiles: response.data["profile"]["paymentProfiles"]
			});
		} catch (error) {
			console.error('Error fetching payment profiles:', error);
			return ({
				success: false,
				message: error.message
			});
		}
	};

	// Todo we are not using it anymore
	createCustomerPaymentProfile = async (
		customer,
		cardNumber,
		expirationDate,
		callback
	) => {
		const customerProfileId = customer.authorizenetCustomerIds[this.apiLoginKey]["customerProfileId"];

		const existingProfiles = await this.getCustomerPaymentProfiles(customer);

		const cardLastFour = cardNumber.slice(-4);

		let paymentProfile = null;

		const isDuplicate = existingProfiles && existingProfiles.some(profile => {
			console.log('profile.payment.creditCard.cardNumber', profile.payment.creditCard);
			if (profile.payment.creditCard.cardNumber.slice(-4) === cardLastFour) {
				paymentProfile = profile.payment;
				return true;
			} else {
				return false;
			}
		});

		if (isDuplicate) {
			console.log('Duplicate payment profile already exists.');
			return {
				success: false,
				message: 'Duplicate payment profile already exists.'
			};
		}

		const payload = {
			"createCustomerPaymentProfileRequest": {
				"merchantAuthentication": {
					"name": this.apiLoginKey,
					"transactionKey": this.transactionKey
				},
				"customerProfileId": customerProfileId,
				"paymentProfile": {
					// "billTo": {
					// 	"firstName": "John",
					// 	"lastName": "Doe",
					// 	"address": "123 Main St.",
					// 	"city": "Bellevue",
					// 	"state": "WA",
					// 	"zip": "98004",
					// 	"country": "US",
					// 	"phoneNumber": "000-000-0000"
					// },
					"payment": {
						"creditCard": {
							"cardNumber": cardNumber,
							"expirationDate": expirationDate
						}
					},
					"defaultPaymentProfile": true
				},
				"validationMode": this.isStagingEnv ? "testMode" : "liveMode"
			}
		}

		console.log('apiUrl', this.getApiUrl());
		const response = await axios.post(this.getApiUrl(), payload, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		console.log("response.data", response.data["messages"]["resultCode"]);
		console.log("response.data", response.data["messages"]["message"]);
		console.log("response.data", response.data);

		if (response.data["messages"]["resultCode"] !== "Ok") {
			return {
				success: false,
				message: response.data["messages"]["message"][0]["text"]
			};
		}

		customer.authorizenetCustomerIds[this.apiLoginKey]["customerPaymentProfileId"] = response.data["customerPaymentProfileId"];

		const findQuery = { _id: customer._id };
		const insertObj = {
			authorizenetCustomerIds: customer.authorizenetCustomerIds
		};
		console.log('customer.authorizenetCustomerIds', customer.authorizenetCustomerIds);
		await Customer.findOneAndUpdateCustomer(findQuery, insertObj, {
			upsert: true
		});

		callback(response);
		return {
			success: true,
			message: "Request successful!"
		};
	}

	// Todo we are not using it anymore
	createTemporaryCustomerProfile = async (paymentToken) => {
		const merchantAuthenticationType = this.getMerchantAuthentication();

		const paymentType = new ApiContracts.PaymentType();
		const opaqueDataType = new ApiContracts.OpaqueDataType();
		opaqueDataType.setDataDescriptor('COMMON.ACCEPT.INAPP.PAYMENT');
		opaqueDataType.setDataValue(paymentToken);
		paymentType.setOpaqueData(opaqueDataType);

		const paymentProfile = new ApiContracts.CustomerPaymentProfileType();
		paymentProfile.setPayment(paymentType);

		const customerProfileType = new ApiContracts.CustomerProfileType();
		customerProfileType.setPaymentProfiles([paymentProfile]);
		customerProfileType.setMerchantCustomerId('M_' + new Date().getTime());
		customerProfileType.setEmail(`test${new Date().getTime()}@test.com`);

		const createRequest = new ApiContracts.CreateCustomerProfileRequest();
		createRequest.setProfile(customerProfileType);
		createRequest.setMerchantAuthentication(merchantAuthenticationType);

		const ctrl = new ApiControllers.CreateCustomerProfileController(createRequest.getJSON());
		if (!this.isStagingEnv()) {
			ctrl.setEnvironment(SDKConstants.endpoint.production);
		}

		try {
			const createCustomerPaymentProfile = () => {
				return new Promise((resolve, reject) => {
					ctrl.execute(function() {
						const apiResponse = ctrl.getResponse();
						const response = new ApiContracts.CreateCustomerProfileResponse(apiResponse);
				
						if (response != null) {
							if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
								console.log('Successfully created temporary customer profile');
								console.log('response: ', response.getCustomerPaymentProfileIdList().getNumericString());
								resolve({
									profileId: response.getCustomerProfileId(),
									paymentProfileId: response.getCustomerPaymentProfileIdList().getNumericString()[0]
								});
							} else {
								reject(new Error(response.getMessages().getMessage()[0].getText()));
							}
						} else {
							reject(new Error('Null response received when creating temporary profile'));
						}
					});
				});
			};

			const result = await createCustomerPaymentProfile();

			return {
				success: true,
				profileId: result.profileId,
				paymentProfileId: result.paymentProfileId
			};
		} catch (error) {
			console.log('error creating tempory profile', error.message)

			return {
				success: false,
				message: error.message
			};
		}
	}

	getPaymentProfileDetails = async (customerProfileId, paymentProfileId) => {
		const merchantAuthenticationType = this.getMerchantAuthentication();

		const getRequest = new ApiContracts.GetCustomerPaymentProfileRequest();
		getRequest.setCustomerProfileId(customerProfileId);
		getRequest.setCustomerPaymentProfileId(paymentProfileId);
		getRequest.setMerchantAuthentication(merchantAuthenticationType);

		const ctrl = new ApiControllers.GetCustomerPaymentProfileController(getRequest.getJSON());
		if (!this.isStagingEnv()) {
			ctrl.setEnvironment(SDKConstants.endpoint.production);
		}

		try {
			const fetchPaymentProfileDetails = () => {
				return new Promise((resolve, reject) => {
					ctrl.execute(function() {
						const apiResponse = ctrl.getResponse();
						const response = new ApiContracts.GetCustomerPaymentProfileResponse(apiResponse);

						if (response != null) {
							if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
								const creditCart = response.getPaymentProfile().getPayment().getCreditCard();

								resolve(creditCart);
							} else {
								reject(new Error(response.getMessages().getMessage()[0].getText()));
							}
						} else {
							reject(new Error('Null response received when fetching payment profile details'));
						}
					});
				});
			}

			const result = await fetchPaymentProfileDetails();

			return {
				success: true,
				creditCart: result
			};
		} catch (error) {
			console.log('error fetching payment profile details', error.message);

			return {
				success: false,
				message: error.message
			};
		}			
	}

	// Todo we are not using it anymore
	deleteCustomerProfile(customerProfileId) {
		const merchantAuthenticationType = this.getMerchantAuthentication();

		const deleteRequest = new ApiContracts.DeleteCustomerProfileRequest();
		deleteRequest.setCustomerProfileId(customerProfileId);
		deleteRequest.setMerchantAuthentication(merchantAuthenticationType);

		const ctrl = new ApiControllers.DeleteCustomerProfileController(deleteRequest.getJSON());
		if (!this.isStagingEnv()) {
			ctrl.setEnvironment(SDKConstants.endpoint.production);
		}

		ctrl.execute(function() {
			const apiResponse = ctrl.getResponse();
			const response = new ApiContracts.DeleteCustomerProfileResponse(apiResponse);

			if (response != null) {
				if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
					console.log('Temporary customer profile deleted successfully.');
				} else {
					console.error('Error deleting temporary customer profile:', response.getMessages().getMessage()[0].getText());
				}
			} else {
				console.error('Null response received while deleting temporary customer profile.');
			}
		});
	}

	// Todo we are not using it anymore
	checkForExistingPaymentProfile = async (customer, paymentToken) => {
		const customerProfileId = customer.authorizenetCustomerIds[this.apiLoginKey]["customerProfileId"];
		const customerPaymentProfileId = customer.authorizenetCustomerIds[this.apiLoginKey]["customerPaymentProfileId"];
		
		// creating a temporary customer profile for checking the exisiting payment profile 
		let res = await this.createTemporaryCustomerProfile(paymentToken);
		if (!res.success) {
			return res;
		}
		const tempProfileId = res.profileId;
		const tempPaymentProfileId = res.paymentProfileId;

		// fetching the payment profile details
		res = await this.getPaymentProfileDetails(tempProfileId, tempPaymentProfileId);
		if (!res.success) {
			return res;
		}
		const cardLastFour = res.cardNumber.slice(-4);	// new card number

		// deleting the temporary customer profile
		this.deleteCustomerProfile(tempProfileId);

		// checking if the payment profile already exists
		const existingProfiles = await getCustomerPaymentProfiles(customer);

		let paymentProfile = null;
		const isDuplicate = existingProfiles && existingProfiles.some(profile => {
			console.log('profile.payment.creditCard.cardNumber', profile.payment.creditCard);
			if (profile.payment.creditCard.cardNumber.slice(-4) === cardLastFour) {
				paymentProfile = profile;
				return true;
			} else {
				return false;
			}
		});

		if (isDuplicate) {
			console.log('Duplicate payment profile already exists.');
			console.log('paymentProfile', paymentProfile);

			if (customerPaymentProfileId !== paymentProfile.customerPaymentProfileId) {
				console.log("updating the customer with the existing payment profile id");
				// update customer with authorizenetCustomerIds
				customer.authorizenetCustomerIds = {
					...customer.authorizenetCustomerIds,
					[this.apiLoginKey]: {
						customerProfileId: customerProfileId,
						customerPaymentProfileId: paymentProfile.customerPaymentProfileId,
					}
				};
				customer.save();
			}
			
			return {
				profileExits: true,
				message: 'Duplicate payment profile already exists.'
			};
		}

		return {
			profileExits: false
		};
	}

	createPaymentProfileViaToken = async (customer, paymentToken) => {
		// check if the payment profile already exists
		// const res = await checkForExistingPaymentProfile(customer, paymentToken);
		// if (res.profileExits) {
		// 	return true;
		// }

		const customerProfileId = customer.authorizenetCustomerIds[this.apiLoginKey]["customerProfileId"];
		const merchantAuthenticationType = this.getMerchantAuthentication();

		// // Step 1: Retrieve existing payment profiles
		// const getPaymentProfiles = async () => {
		// 	const request = new ApiContracts.GetCustomerProfileRequest();
		// 	request.setMerchantAuthentication(merchantAuthenticationType);
		// 	request.setCustomerProfileId(customerProfileId);
	
		// 	return new Promise((resolve, reject) => {
		// 		const ctrl = new ApiControllers.GetCustomerProfileController(request.getJSON());
				// if (!this.isStagingEnv()) {
				// 	ctrl.setEnvironment(SDKConstants.endpoint.production);
				// }
	
		// 		ctrl.execute(() => {
		// 			const apiResponse = ctrl.getResponse();
		// 			const response = new ApiContracts.GetCustomerProfileResponse(apiResponse);
	
		// 			if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
		// 				resolve(response.getProfile().getPaymentProfiles());
		// 			} else {
		// 				reject(new Error("Failed to retrieve customer payment profiles."));
		// 			}
		// 		});
		// 	});
		// };

		// const paymentProfiles = await getPaymentProfiles();
		// // Step 2: Check if payment profile already exists
        // for (const profile of paymentProfiles) {
		// 	console.log("profile", profile);
		// 	console.log("profile.getPayment()", profile.getPayment());
        //     const profilePaymentData = profile.getPayment().getOpaqueData();
		// 	console.log('profilePaymentData', profilePaymentData.getDataValue());
        //     if (profilePaymentData && profilePaymentData.getDataValue() === paymentToken) {
        //         // If the token matches, use the existing payment profile ID
        //         const customerPaymentProfileId = profile.getCustomerPaymentProfileId();
        //         console.log('Existing customerPaymentProfileId', customerPaymentProfileId);

        //         return {
        //             success: true,
        //             message: customerPaymentProfileId
        //         };
        //     }
        // }

		const opaqueDataType = new ApiContracts.OpaqueDataType();
		opaqueDataType.setDataDescriptor('COMMON.ACCEPT.INAPP.PAYMENT');
		opaqueDataType.setDataValue(paymentToken);

		const paymentType = new ApiContracts.PaymentType();
		paymentType.setOpaqueData(opaqueDataType);

		const paymentProfileType = new ApiContracts.CustomerPaymentProfileType();
		paymentProfileType.setCustomerType(ApiContracts.CustomerTypeEnum.INDIVIDUAL);
		paymentProfileType.setPayment(paymentType);

		const createRequest = new ApiContracts.CreateCustomerPaymentProfileRequest();
		createRequest.setMerchantAuthentication(merchantAuthenticationType);
		createRequest.setCustomerProfileId(customerProfileId);
		createRequest.setPaymentProfile(paymentProfileType);
		if (this.isStagingEnv()) {
			createRequest.setValidationMode('testMode');
		}

		try {
			const createCustomerPaymentProfile = () => {
				return new Promise((resolve, reject) => {
					const ctrl = new ApiControllers.CreateCustomerPaymentProfileController(createRequest.getJSON());
					if (!this.isStagingEnv()) {
						ctrl.setEnvironment(SDKConstants.endpoint.production);
					}

					ctrl.execute(() => {
					const apiResponse = ctrl.getResponse();
					const response = new ApiContracts.CreateCustomerPaymentProfileResponse(apiResponse);

					if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
						resolve(response.getCustomerPaymentProfileId());
					} else {
						console.log('Failed to create customer payment profile');
						console.log('Result Code: ' + response.getMessages().getResultCode());
						console.log("response.getMessages()", response.getMessages());
						console.log("response ==>", response);
						const errorMessages = response.getMessages().getMessage();

						if (errorMessages[0].getText()=== "A duplicate customer payment profile already exists.") {
							console.log('Duplicate payment profile already exists. Returning existing payment profile id.');
							resolve(response.getCustomerPaymentProfileId());
						}

						reject(new Error(errorMessages[0].getText()));
					}
					});
				});
			};

			const customerPaymentProfileId = await createCustomerPaymentProfile();
			console.log('new customerPaymentProfileId', customerPaymentProfileId);

			customer.authorizenetCustomerIds = {
				...customer.authorizenetCustomerIds,
				[this.apiLoginKey]: {
					customerProfileId: customerProfileId,
					customerPaymentProfileId: customerPaymentProfileId,
				}
			};
			customer.save();

			return {
				success: true,
				message: customerPaymentProfileId
			};
		} catch (error) {
			console.log('error message here', error.message)

			return {
				success: false,
				message: error.message
			};
		}
	}

	chargeCustomerProfile = async (customer, amount, isPayNowValidationLaterFlow = false) => {
		if (isPayNowValidationLaterFlow) {
			return this.authorizePayment(customer, amount);
		}

		const customerProfileId = customer.authorizenetCustomerIds[this.apiLoginKey]["customerProfileId"];
		const customerPaymentProfileId = customer.authorizenetCustomerIds[this.apiLoginKey]["customerPaymentProfileId"];

		const refId = await generateSerialNumber({ type: "receipt" });
		const payload = {
			"createTransactionRequest": {
				"merchantAuthentication": {
					"name": this.apiLoginKey,
					"transactionKey": this.transactionKey
				},
				"refId": refId,
				"transactionRequest": {
					"transactionType": "authCaptureTransaction",
					"amount": amount.toFixed(2),
					"profile": {
						"customerProfileId": customerProfileId,
						"paymentProfile": { "paymentProfileId": customerPaymentProfileId }
					}
				}
			}
		}

		const response = await axios.post(this.getApiUrl(), payload, {
			headers: {
				'Content-Type': 'application/json'
			}
		});

		console.log("response.data", response.data["messages"]["resultCode"]);
		console.log("response.data", response.data["messages"]["message"]);
		console.log("response.data", response.data);

		console.log("response.data Error:", response.data["transactionResponse"]["errors"]);

		const data = response.data;
		if (get(data, "messages.resultCode", "Error") === "Ok") {
			const transactionId = get(data, "transactionResponse.transId");
			const responseCode = get(data, "transactionResponse.responseCode", 3);

			if (responseCode === "1" || responseCode === "4") {
				return {
					success: true,
					message: data["messages"] ? data["messages"]["message"] : "Unknown error processing payment",
					data: {
						...data,
						message: data["messages"] ? data["messages"]["message"] : "Unknown error processing payment",
						id: transactionId
					}
				};
			} else if (responseCode === "2") {
				return {
					success: false,
					message: "This transaction has been declined!",
					data: {
						...data,
						id: transactionId
					}
				};
			}
			return {
				success: false,
				message: get(data, "transactionResponse.errors[0].errorText", null) || get(data, "errors[0].errorText", "Something went wrong!!!"),
				data: {
					...data,
					id: transactionId
				}
			};
		}
		return {
			success: false,
			message: get(data, "transactionResponse.errors[0].errorText", null) || get(data, "messages.message[0].text", "Something went wrong!"),
			data: {
				...data
			}
		};
	}

	voidTransaction = async (transactionId) => {
		const merchantAuthenticationType = this.getMerchantAuthentication();

		const transactionRequestType = new ApiContracts.TransactionRequestType();
		transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.VOIDTRANSACTION);
		transactionRequestType.setRefTransId(transactionId);

		const createRequest = new ApiContracts.CreateTransactionRequest();
		createRequest.setMerchantAuthentication(merchantAuthenticationType);
		createRequest.setTransactionRequest(transactionRequestType);

		try {
			const processVoidPayment = () => {
				return new Promise((resolve, reject) => {
					const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
					if (!this.isStagingEnv()) {
						ctrl.setEnvironment(SDKConstants.endpoint.production);
					}

					ctrl.execute(() => {
						var apiResponse = ctrl.getResponse();
						var response = new ApiContracts.CreateTransactionResponse(apiResponse);

						if(response != null){
							if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
								if(response.getTransactionResponse().getMessages() != null){
									console.log('Successfully created void transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
									console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
									console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
									console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
									resolve({
										transactionId: response.getTransactionResponse().getTransId()
									});
								}
								else {
									console.log('Failed Transaction.');
									if(response.getTransactionResponse().getErrors() != null){
										console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
										console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
									}

									reject(new Error(
										`Payment void failed with Error Message: ${response.getTransactionResponse().getErrors() ? response.getTransactionResponse().getErrors().getError()[0].getErrorText() : 'Unknown error'}`
									));
								}
							}
							else {
								console.log('Failed Transaction. ');
								if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
									console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
									console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());

									reject(new Error(
										`Payment void failed with Error Message: ${response.getTransactionResponse().getErrors().getError()[0].getErrorText()}`
									));
								}
								else {
									console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
									console.log('Error message: ' + response.getMessages().getMessage()[0].getText());

									reject(new Error(
										`Payment void failed with Error Message: ${response.getMessages().getMessage()[0].getText()}`
									));
								}
							}
						}
						else {
							console.log('Null Response.');

							reject(new Error('Null response received when processing void payment'));
						}
					});
				});
			};

			const result = await processVoidPayment();

			return {
				success: true,
				data: {
					transactionId: result.transactionId
				}
			};
		} catch (error) {
			console.log('error processing void payment', error.message);

			return {
				success: false,
				message: error.message
			};
		}
	}

	refundTransaction = async (transactionId, cardLastFour, amount) => {
		console.log('transactionId', transactionId);
		console.log('amount', amount);
		const merchantAuthenticationType = this.getMerchantAuthentication();

		const creditCard = new ApiContracts.CreditCardType();
		creditCard.setCardNumber(cardLastFour);
		creditCard.setExpirationDate('XXXX');

		var paymentType = new ApiContracts.PaymentType();
		paymentType.setCreditCard(creditCard);

		var transactionRequestType = new ApiContracts.TransactionRequestType();
		transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.REFUNDTRANSACTION);
		transactionRequestType.setPayment(paymentType);
		transactionRequestType.setAmount(amount.toFixed(2));
		transactionRequestType.setRefTransId(transactionId);

		var createRequest = new ApiContracts.CreateTransactionRequest();
		createRequest.setMerchantAuthentication(merchantAuthenticationType);
		createRequest.setTransactionRequest(transactionRequestType);

		try {
			const processRefundPayment = () => {
				return new Promise((resolve, reject) => {
					const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
					if (!this.isStagingEnv()) {
						ctrl.setEnvironment(SDKConstants.endpoint.production);
					}

					ctrl.execute(() => {
						const apiResponse = ctrl.getResponse();
						const response = new ApiContracts.CreateTransactionResponse(apiResponse);

						if(response != null){
							if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
								if(response.getTransactionResponse().getMessages() != null){
									console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
									console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
									console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
									console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());

									resolve({
										transactionId: response.getTransactionResponse().getTransId()
									});
								}
								else {
									console.log('Failed Transaction.');
									if(response.getTransactionResponse().getErrors() != null){
										console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
										console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
									}

									reject(new Error(
										`Refund failed with Error Message: ${response.getTransactionResponse().getErrors() ? response.getTransactionResponse().getErrors().getError()[0].getErrorText() : 'Unknown error'}`
									));
								}
							}
							else {
								console.log('Failed Transaction. ');
								if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
									console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
									console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());

									reject(new Error(
										`Refund failed with Error Message: ${response.getTransactionResponse().getErrors().getError()[0].getErrorText()}`
									));
								}
								else {
									console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
									console.log('Error message: ' + response.getMessages().getMessage()[0].getText());

									reject(new Error(
										`Refund failed with Error Message: ${response.getMessages().getMessage()[0].getText()}`
									));
								}
							}
						}
						else {
							console.log('Null Response.');

							reject(new Error('Null response received when processing refund payment'));
						}
					});
				})
			}

			const result = await processRefundPayment();

			return {
				success: true,
				data: {
					transactionId: result.transactionId
				}
			};
		} catch (error) {
			console.log('error processing refund payment', error.message);

			return {
				success: false,
				message: error.message
			};
		}
	}

	authorizePayment = async (customer, amount) => {
		const customerProfileId = customer.authorizenetCustomerIds[this.apiLoginKey]["customerProfileId"];
		const customerPaymentProfileId = customer.authorizenetCustomerIds[this.apiLoginKey]["customerPaymentProfileId"];

		const refId = await generateSerialNumber({ type: "receipt" });
		const payload = {
			"createTransactionRequest": {
				"merchantAuthentication": {
					"name": this.apiLoginKey,
					"transactionKey": this.transactionKey
				},
				"refId": refId,
				"transactionRequest": {
					"transactionType": "authOnlyTransaction",
					"amount": amount.toFixed(2),
					"profile": {
						"customerProfileId": customerProfileId,
						"paymentProfile": { "paymentProfileId": customerPaymentProfileId }
					},
					// "customer": {
					// 	"id": customerProfileId
					// },
				}
			}
		}

		const response = await axios.post(this.getApiUrl(), payload, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		console.log("authorize payment response.data", response.data["messages"]["resultCode"]);
		console.log("authorize payment response.data", response.data["messages"]["message"]);
		console.log("authorize payment response.data", response.data);

		console.log("authorize payment response.data Error:", response.data["transactionResponse"]["errors"]);

		if (response.data["messages"]["resultCode"] !== "Ok") {
			return {
				success: false,
				data: {
					...response.data,
					message: response.data["messages"] ?
						response.data["messages"]["message"] : response.data["text"] ?
							response.data["text"] : "Unknown error processing payment"
				}
			};
		}

		return {
			success: true,
			data: {
				...response.data,
				message: response.data["messages"] ? response.data["messages"]["message"] : "Unknown error processing payment",
				id: response.data?.transactionResponse?.transId
			}
		};
	}

	captureAuthorizedPayment = async (amount, transactionId) => {
		const refId = await generateSerialNumber({ type: "receipt" });
		const payload = {
			"createTransactionRequest": {
				"merchantAuthentication": {
					"name": this.apiLoginKey,
					"transactionKey": this.transactionKey
				},
				"refId": refId,
				"transactionRequest": {
					"transactionType": "priorAuthCaptureTransaction",
					"amount": amount.toFixed(2),
					"refTransId": transactionId
				}
			}
		}

		const response = await axios.post(this.getApiUrl(), payload, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		console.log("capture authorized payment response.data", response.data["messages"]["resultCode"]);
		console.log("capture authorized payment response.data", response.data["messages"]["message"]);
		console.log("capture authorized payment response.data", response.data);

		console.log("capture authorized payment response.data Error:", response.data["transactionResponse"]["errors"]);

		const data = response.data
		if (get(data, "transactionResponse.responseCode", 0) === "1" || get(data, "transactionResponse.responseCode", 0) === "4") {
			return {
				success: true,
				data: {
					...data,
					message: data["messages"] ? data["messages"]["message"] : "Unknown error processing payment",
					id: data?.transactionResponse?.transId
				}
			};
		}

		return {
			success: false,
			data: {
				...data,
				message: data["messages"] ?
					data["messages"]["message"] : data["text"] ?
						data["text"] : "Unknown error processing payment"
			}
		};
	}

	deleteCustomerPaymentProfile = async (customer, customerPaymentProfileId) => {
		const customerProfileId = customer.authorizenetCustomerIds[this.apiLoginKey]["customerProfileId"];
		const payload = {
			"deleteCustomerPaymentProfileRequest": {
				"merchantAuthentication": {
					"name": this.apiLoginKey,
					"transactionKey": this.transactionKey
				},
				"customerProfileId": customerProfileId,
				"customerPaymentProfileId": customerPaymentProfileId
			}
		}

		const response = await axios.post(this.getApiUrl(), payload, {
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (response.data["messages"]["resultCode"] !== "Ok") {
			return {
				success: false,
				message: get(response.data, "messages.message[0].text", "Unknown error deleting payment profile")
			};
		}

		return {
			success: true,
			message: "Deleted"
		};
	}

	// Todo we are not using it anymore
	getPaymentUrl = async (customer, amount) => {
		const customerProfileId = customer.authorizenetCustomerIds[this.apiLoginKey]["customerProfileId"];

		const payload = {
			getHostedPaymentPageRequest: {
				merchantAuthentication: {
					name: this.apiLoginKey,
					transactionKey: this.transactionKey
				},
				transactionRequest: {
					transactionType: 'authCaptureTransaction',
					amount: amount,
					profile: {
						customerProfileId: customerProfileId
					}
				},
				hostedPaymentSettings: {
					setting: [
						{
							settingName: 'hostedPaymentButtonOptions',
							settingValue: '{"text": "Pay"}'
						},
						{
							settingName: 'hostedPaymentReturnOptions',
							settingValue: '{"showReceipt": true, "url": "https://your-return-url.com", "urlText": "Return to Merchant", "cancelUrl": "https://your-cancel-url.com", "cancelUrlText": "Cancel"}'
						}
					]
				}
			}
		}

		const response = await axios.post(this.getApiUrl(), payload, {
			headers: {
					'Content-Type': 'application/json'
			}
		});

		if (response.data["messages"]["resultCode"] !== "Ok") {
			return {
				success: false,
				message: response.data["messages"]["message"][0]["text"]
			};
		}

		console.log('response', response.data);
		console.log('response.data["messages"]["message"][0]', response.data["messages"]["message"][0])
		console.log('response.data["messages"]["message"][0]["text"]', response.data["messages"]["message"][0]["text"])

		const token = response.data["token"];

		console.log('token', token);

		return token;
	}
}

module.exports = Authorizenet;
