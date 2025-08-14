const Stripe = require("stripe");
const { ceil, get, isEmpty } = require("lodash");
const { generateDemoEmail } = require("../global/functions");
const Customer = require("../models/customers");
const { calculateProcessingFee } = require("./revenue");
const { sendSlackNotification } = require("./slack");
const axios = require("axios");

const getStripeInstance = (params) => {
  if (!params?.place || isEmpty(params?.place) || params?.place === undefined) {
    console.log()
    console.log()
    console.log()
    console.log("Place not found redirecting to default stripe account");
    var stack = new Error().stack
    console.log( stack )
    console.log()
    console.log()
    console.log()
    sendSlackNotification({
      slackChannel: "https://hooks.slack.com/triggers/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",
      message: "Place not found redirecting to default stripe account",
    });
  }

  switch (get(params, "place.stripeConfiguration.name", "")) {
    case "umair-test":
      return Stripe(process.env.STRIPE_SECRET_KEY_UMAIR_TEST);
    case "pmc":
      return Stripe(process.env.STRIPE_SECRET_KEY_PMC);
    default:
      return Stripe(process.env.STRIPE_SECRET_KEY);
  }
}

const createStripeCustomer = async (params) => {
  try {
    const stripe = getStripeInstance(params);
    const { place, ...customerParams } = params;
    const res = await stripe.customers.create(customerParams);
    return res;
  } catch (error) {
    return error;
  }
};

const attachPaymentMethodToCustomer = async (
  masterMerchantCustomerId,
  paymentMethodId,
  place = null,
  directChargePayment = false,
  customer = null
) => {
  try {
    const stripe = getStripeInstance({ place: place });

    if (directChargePayment && place && place.connectAccountId) {
      const connectAccountId = place.connectAccountId;
      console.log("creating and attaching directChargePayment ===>");
      console.log("connectAccountId ===>", connectAccountId);

      // If the customer doesn't have a stripe customer id for connectAccount create one
      if (
        !customer.connectAccountCustomerIds ||
        !customer.connectAccountCustomerIds[connectAccountId] ||
        !customer.connectAccountCustomerIds[connectAccountId].customerId
      ) {
        const customerData = getOrCreateDCCustomer(
          customer,
          connectAccountId,
          paymentMethodId,
          place
        )

        return {
          success: true,
          paymentMethodId: customerData.paymentMethodId,
        };
      }

      // If the customer already has a stripe customer id for connectAccount attach the payment method
      const paymentMethodRes = await stripe.paymentMethods.create(
        {
          customer: masterMerchantCustomerId,
          payment_method: paymentMethodId,
        },
        {
          stripeAccount: connectAccountId,
        }
      );

      const connectAccountCustomerId = customer.connectAccountCustomerIds[connectAccountId].customerId;

      const res = await stripe.paymentMethods.attach(
        paymentMethodRes.id,
        {
          customer: connectAccountCustomerId,
        },
        {
          stripeAccount: connectAccountId,
        }
      );

      let connectAccountCustomerIds = customer.connectAccountCustomerIds || {};
      connectAccountCustomerIds[connectAccountId] = {
        customerId: connectAccountCustomerId,
        paymentMethodId: res.id,
      };

      const update = { $set: {} };
      update.connectAccountCustomerIds = connectAccountCustomerIds;
      await Customer.findOneAndUpdateCustomer({ _id: customer._id }, update, {
        new: true,
        upsert: true,
      });
  
      return {
        success: true,
        paymentMethodId: res.id,
      };
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: masterMerchantCustomerId,
    });
    return true;
  } catch (error) {
    console.error("Error attaching payment method:", error.message);
    return false;
  }
};

const deletePaymentMethods = async (paymentMethod, place = null) => {
  try {
    const stripe = getStripeInstance({ place: place });
    const res = await stripe.paymentMethods.detach(paymentMethod);
    return {
      success: true,
      message: "Customer payment-method detach Successfully",
      data: { paymentMethodId: res.id },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

const getPaymentMethods = async (customerId, place = null) => {
  try {
    const stripe = getStripeInstance({ place: place });
    const res = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });
    const paymentMethods = [];
    if (res.data) {
      res.data.map((card) => {
        paymentMethods.push({
          id: card.id,
          last4: card.card.last4,
          brand: card.card.brand,
          exp_month: card.card.exp_month,
          exp_year: card.card.exp_year,
        });
      });
    }
    return {
      status: true,
      message: "Payment-methods get Successful",
      data: paymentMethods,
    };
  } catch (error) {
    return error;
  }
};

const getPaymentMethodById = async (params) => {
  try {
    const stripe = getStripeInstance(params);

    if ( params.isDirectChargePayment && params.place?.connectAccountId ) {
      let customerId = params.customerId;
      if (params.customer && params.customer.connectAccountCustomerIds &&
        params.customer.connectAccountCustomerIds[params.place.connectAccountId])
      {
        const customerData = params.customer.connectAccountCustomerIds[params.place.connectAccountId];
        customerId = customerData.customerId;
      }

      const paymentMethod = await stripe.customers.retrievePaymentMethod(
        customerId,
        params.paymentMethodId,
        {
          stripeAccount: params.place.connectAccountId,
        }
      );

      return {
        status: true,
        message: "Payment-method get Successful",
        data: paymentMethod,
      };
    }

    const paymentMethod = await stripe.customers.retrievePaymentMethod(
      params.customerId,
      params.paymentMethodId
    );
    return {
      status: true,
      message: "Payment-method get Successful",
      data: paymentMethod,
    };
  } catch (error) {
    console.log("error.message", error.message)
    return error;
  }
};

const getOrCreateDCCustomer = async (
  customer,
  connectAccountId,
  paymentMethodId,
  place
) => {
  if (
    customer.connectAccountCustomerIds &&
    customer.connectAccountCustomerIds[connectAccountId]
  ) {
    return customer.connectAccountCustomerIds[connectAccountId];
  }

  const stripe = getStripeInstance({ place: place });
  const stripeCustomerId = await getStripeCustomerId(customer, place);

  const paymentMethodRes = await stripe.paymentMethods.create(
    {
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
    },
    {
      stripeAccount: connectAccountId,
    }
  );

  const customerDC = await stripe.customers.create(
    {
      payment_method: paymentMethodRes.id,
      email: customer.email,
      phone: customer.mobile,
      name: `${customer.firstName} ${customer.lastName}`,
      metadata: {
        email: get(customer, "email", ""),
        phone: get(customer, "mobile", ""),
      },
    },
    {
      stripeAccount: connectAccountId,
    }
  );

  const customerData = {
    customerId: customerDC.id,
    paymentMethodId: paymentMethodRes.id,
  };

  let connectAccountCustomerIds = customer.connectAccountCustomerIds || {};
  connectAccountCustomerIds[connectAccountId] = customerData;

  const update = { $set: {} };
  update.connectAccountCustomerIds = connectAccountCustomerIds;
  await Customer.findOneAndUpdateCustomer({ _id: customer._id }, update, {
    new: true,
    upsert: true,
  });

  return customerData;
};

const createDirectChargePaymentIntent = async (params) => {
  try {
    const customerData = await getOrCreateDCCustomer(
      params.customer,
      params.connectedAccountId,
      params.paymentMethodId,
      params.place
    );
    const amount = Math.ceil(params.total);
    const applicationFeeAmount = Math.ceil(params.applicationFeeAmount);
    const connectedAccountId = params.connectedAccountId;
    const customerId = customerData.customerId;
    const currency = params.currency;
    let metadata = get(params, "metadata", {});
    metadata.isDirectCharge = true;
    const paymentMethod = customerData.paymentMethodId;
    const paymentIntentObject = {
      amount,
      metadata,
      payment_method: paymentMethod,
      application_fee_amount: applicationFeeAmount,
      currency,
      payment_method_types: ["card"],
      confirm: true,
      customer: customerId,
    };

    if (get(params, "metadata.statement_descriptor", false)) {
      paymentIntentObject.statement_descriptor = get(
        params,
        "metadata.statement_descriptor",
        false
      );
    }

    const stripe = getStripeInstance(params);
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentObject,
      {
        stripeAccount: connectedAccountId,
      }
    );

    return { success: true, data: paymentIntent };
  } catch (error) {
    // console.log("stripe error ===>", error);
    return {
      success: false,
      message: error.message,
      type: error.type,
      data: error,
    };
  }
};

const createPaymentIntentForSplits = async (params) => {
  try {
    const amount = Math.ceil(params.total);
    const applicationFeeAmount = Math.ceil(
      calculateProcessingFee({
        amount,
        paymentGatewayFeePayBy: "spotsync",
        placeData: params.place,
      })
    );
    const connectedAccountId = params.connectedAccountId;
    const customerId = params.customerId;
    const currency = params.currency;
    let metadata = get(params, "metadata", {});
    metadata["splitServiceFeeEnabled"] = true;
    const paymentMethod = get(params, "paymentMethodId", null);

    // Generate a random group id
    let groupId = "group_";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 20) {
      groupId += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
      counter += 1;
    }

    // Create payment intent without transfer data
    const paymentIntentObject = {
      amount,
      metadata,
      payment_method: paymentMethod,
      currency,
      payment_method_types: ["card"],
      confirm: true,
      customer: customerId,
      transfer_group: groupId,
    };

    if (get(params, "metadata.statement_descriptor", false)) {
      paymentIntentObject.statement_descriptor = get(
        params,
        "metadata.statement_descriptor",
        false
      );
    }

    const stripe = getStripeInstance(params);
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentObject
    );
    if (paymentIntent.amount_received !== amount) {
      return {
        data: {
          payment_intent: paymentIntent,
          payment_method: paymentMethod,
        },
        success: false,
        message: "Reservation failed due to incomplete payment!",
      };
    }

    // Create transfer data
    const remaingAmount = amount - applicationFeeAmount;
    const splitRevenue = get(params, "place.splitRevenue", false);
    console.log("splitRevenue ===>", splitRevenue);
    let primaryConnectAccountPayout = 0;
    let secondaryConnectAccountPayout = 0;

    if (splitRevenue.isFixedSplit) {
      // For fixed split
      primaryConnectAccountPayout = Math.floor(
        remaingAmount - (splitRevenue.secondaryAccountFixedAmount * 100)
      );
      if (primaryConnectAccountPayout < 0) {
        primaryConnectAccountPayout = 0
      }

      secondaryConnectAccountPayout = Math.floor(
        remaingAmount - primaryConnectAccountPayout
      );
    } else {
      const primaryAccountPer = splitRevenue.primaryAccountPer / 100;
      const secondaryAccountPer = splitRevenue.secondaryAccountPer / 100;

      primaryConnectAccountPayout = Math.floor(
      remaingAmount * primaryAccountPer
    );
      secondaryConnectAccountPayout = Math.floor(
      remaingAmount * secondaryAccountPer
    );
    }

    const transferMetadata = {
      primaryConnectAccountPayout: primaryConnectAccountPayout / 100,
      secondaryConnectAccountPayout: secondaryConnectAccountPayout / 100,
      paymentId: paymentIntent.id,
      processingFee: applicationFeeAmount / 100,
      totalCharge: params.total / 100,
    };

    console.log("transferMetadata ===>", transferMetadata);

    const transferObject = {
      currency: "usd",
      transfer_group: groupId,
      metadata: transferMetadata,
    };

    if (
      paymentIntent.latest_charge
    ) {
      transferObject.source_transaction = paymentIntent.latest_charge;
    }

    if (primaryConnectAccountPayout > 0) {
      // Transfer to primary account
      const transfer1 = await stripe.transfers.create({
        ...transferObject,
        amount: primaryConnectAccountPayout,
        destination: connectedAccountId,
      });

      const destinationPaymentId1 = transfer1.destination_payment;
      await stripe.charges.update(
        destinationPaymentId1,
        {
          metadata: transferMetadata,
        },
        {
          stripeAccount: connectedAccountId,
        }
      );
    }

    if (secondaryConnectAccountPayout) {
      const transfer2 = await stripe.transfers.create({
        ...transferObject,
        amount: secondaryConnectAccountPayout,
        destination: splitRevenue.secondaryConnectAccountId,
      });

      const destinationPaymentId2 = transfer2.destination_payment;
      await stripe.charges.update(
        destinationPaymentId2,
        {
          metadata: transferMetadata,
        },
        {
          stripeAccount: splitRevenue.secondaryConnectAccountId,
        }
      );
    }

    return { success: true, data: paymentIntent };
  } catch (error) {
    // console.log("stripe error ===>", error);
    return {
      success: false,
      message: error.message,
      type: error.type,
      data: error,
    };
  }
};

const createPaymentIntentForSplitsWithDestinationCharge = async (params) => {
  try {
    const amount = Math.ceil(params.total);
    const processingFee = Math.ceil(
      calculateProcessingFee({
        amount,
        paymentGatewayFeePayBy: "spotsync",
        placeData: params.place,
      })
    );
    const connectedAccountId = params.connectedAccountId;
    const customerId = params.customerId;
    const currency = params.currency;
    let metadata = get(params, "metadata", {});
    metadata["splitServiceFeeEnabled"] = true;
    const paymentMethod = get(params, "paymentMethodId", null);

    // Generate a random group id
    let groupId = "group_";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 20) {
      groupId += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
      counter += 1;
    }

    // Create transfer data
    const remaingAmount = amount - processingFee;
    const splitRevenue = get(params, "place.splitRevenue", false);
    console.log("splitRevenue ===>", splitRevenue);
    let primaryConnectAccountPayout = 0;
    let secondaryConnectAccountPayout = 0;

    if (splitRevenue.isFixedSplit) {
      // For fixed split
      primaryConnectAccountPayout = Math.floor(
        remaingAmount - (splitRevenue.secondaryAccountFixedAmount * 100)
      );
      if (primaryConnectAccountPayout < 0) {
        primaryConnectAccountPayout = 0
      }

      secondaryConnectAccountPayout = Math.floor(
        remaingAmount - primaryConnectAccountPayout
      );
    } else {
      const primaryAccountPer = splitRevenue.primaryAccountPer / 100;
      const secondaryAccountPer = splitRevenue.secondaryAccountPer / 100;

      primaryConnectAccountPayout = Math.floor(
        remaingAmount * primaryAccountPer
      );
      secondaryConnectAccountPayout = Math.floor(
        remaingAmount * secondaryAccountPer
      );
    }

    // Create payment intent without transfer data
    const paymentIntentObject = {
      amount,
      metadata,
      payment_method: paymentMethod,
      application_fee_amount: amount - primaryConnectAccountPayout, // It will include processing fee, spotsync revenue and secondary account revenue
      currency,
      payment_method_types: ["card"],
      confirm: true,
      transfer_data: {
        destination: connectedAccountId,
      },
      customer: customerId,
      transfer_group: groupId,
    };

    console.log("paymentIntentObject ===>", paymentIntentObject);

    if (get(params, "metadata.statement_descriptor", false)) {
      paymentIntentObject.statement_descriptor = get(
        params,
        "metadata.statement_descriptor",
        false
      );
    }

    const stripe = getStripeInstance(params);
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentObject
    );

    const transferMetadata = {
      primaryConnectAccountPayout: primaryConnectAccountPayout / 100,
      secondaryConnectAccountPayout: secondaryConnectAccountPayout / 100,
      paymentId: paymentIntent.id,
      processingFee: processingFee / 100,
      totalCharge: params.total / 100,
      chargeId: paymentIntent.latest_charge,
      paymentIntentId: paymentIntent.id,
    };

    console.log("transferMetadata ===>", transferMetadata);

    const transferObject = {
      currency: "usd",
      transfer_group: groupId,
      metadata: transferMetadata,
    };

    // if (paymentIntent.latest_charge) {
    //   transferObject.source_transaction = paymentIntent.latest_charge;
    // }

    let extraParams = {
      isChargeAndTransferPayment: true,
      transferMetadata,
      splitRevenueStats: splitRevenue
    }

    if (params.is3DsecureHandled && 
      (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action')) {
      
      
      return { success: true, data: paymentIntent, transferData: {
        transferObject,
        amount: secondaryConnectAccountPayout,
        destination: splitRevenue.secondaryConnectAccountId,
        splitRevenue
      }};
    }

    if (paymentIntent.amount_received !== amount) {
      return {
        data: {
          payment_intent: paymentIntent,
          payment_method: paymentMethod,
        },
        success: false,
        message: "Reservation failed due to incomplete payment!",
      };
    }

    // Skipping primary account payout as we are doing destination charge to primary account and transfer to secondary account
    // if (primaryConnectAccountPayout > 0) {
    //   // Transfer to primary account
    //   const transfer1 = await stripe.transfers.create({
    //     ...transferObject,
    //     amount: primaryConnectAccountPayout,
    //     destination: connectedAccountId,
    //   });

    //   extraParams.primaryTransfer = transfer1;

    //   const destinationPaymentId1 = transfer1.destination_payment;
    //   await stripe.charges.update(
    //     destinationPaymentId1,
    //     {
    //       metadata: transferMetadata,
    //     },
    //     {
    //       stripeAccount: connectedAccountId,
    //     }
    //   );
    // }

    if (secondaryConnectAccountPayout) {
      const transfer2 = await stripe.transfers.create({
        ...transferObject,
        amount: secondaryConnectAccountPayout,
        destination: splitRevenue.secondaryConnectAccountId,
      });

      extraParams.secondaryTransfer = transfer2;

      const destinationPaymentId2 = transfer2.destination_payment;
      await stripe.charges.update(
        destinationPaymentId2,
        {
          metadata: transferMetadata,
        },
        {
          stripeAccount: splitRevenue.secondaryConnectAccountId,
        }
      );
    }

    paymentIntent["extraParams"] = extraParams;
    return { success: true, data: paymentIntent };
  } catch (error) {
    // console.log("stripe error ===>", error);
    return {
      success: false,
      message: error.message,
      type: error.type,
      data: error,
    };
  }
};

const transferSplitRevenuePaymentAfter3dSecure = async (params) => {
  if (get(params, "amount", 0) > 0) {
    const stripe = getStripeInstance(params);
    const {
      transferObject,
      amount,
      destination,
      splitRevenue,
    } = params;

    const transfer = await stripe.transfers.create({
      ...transferObject,
      amount,
      destination,
    });

    let extraParams = {
      isChargeAndTransferPayment: true,
      transferMetadata: transferObject.metadata,
      splitRevenueStats: splitRevenue,
      secondaryTransfer: transfer,
    }

    const destinationPaymentId = transfer.destination_payment;
    await stripe.charges.update(
      destinationPaymentId,
      {
        metadata: transferObject.metadata,
      },
      {
        stripeAccount: splitRevenue.secondaryConnectAccountId,
      }
    );

    return { success: true, data: extraParams };
  }

  return { success: true };
}

const createValidationFlowPaymentIntent = async (params) => {
  try {
    const amount = Math.ceil(params.total);

    const stripe = getStripeInstance(params);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
      capture_method: "manual",
    });
    return { success: true, data: paymentIntent };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      type: error.type,
      data: error,
    };
  }
};

const createPaymentIntent = async (params) => {
  const isPayNowValidationLaterFlow = get(
    params,
    "isPayNowValidationLaterFlow",
    false
  );

  // For direct charge payment
  if (
    get(params, "directChargePayment", false) &&
    !isPayNowValidationLaterFlow
  ) {
    return createDirectChargePaymentIntent(params);
  }

  // For revenue split logic
  if (
    get(params, "place.splitRevenue.enabled", false) &&
    !isPayNowValidationLaterFlow
  ) {
    // return createPaymentIntentForSplits(params);
    return createPaymentIntentForSplitsWithDestinationCharge(params);
  }

  try {
    const amount = Math.ceil(params.total);
    const applicationFeeAmount = Math.ceil(params.applicationFeeAmount);
    const connectedAccountId = params.connectedAccountId;
    const customerId = params.customerId;
    const currency = params.currency;
    const metadata = get(params, "metadata", {});
    const paymentMethod = get(params, "paymentMethodId", null);
    const paymentIntentObject = {
      amount,
      metadata,
      payment_method: paymentMethod,
      currency,
      payment_method_types: ["card"],
      customer: customerId,
    };

    // Including application fee and transfer data for destination transfers only
    const hasConnectedAccount = !isEmpty(connectedAccountId) && connectedAccountId !== "none";
    if (hasConnectedAccount) {
      paymentIntentObject.transfer_data = {
        destination: connectedAccountId
      }
      paymentIntentObject.application_fee_amount = applicationFeeAmount;
    }

    if (hasConnectedAccount && get(params, "metadata.statement_descriptor", false)) {
      paymentIntentObject.statement_descriptor = get(
        params,
        "metadata.statement_descriptor",
        false
      );
    }

    if (isPayNowValidationLaterFlow) {
      paymentIntentObject.capture_method = "manual";
      paymentIntentObject.confirm = true;
    } else {
      paymentIntentObject.confirm = true;
    }

    const stripe = getStripeInstance(params);
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentObject
    );
    return { success: true, data: paymentIntent };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      type: error.type,
      data: error,
    };
  }
};

const createPaymentIntentForACH = async (params) => {
  console.log("stripe props ====>", params);
  try {
    let amount = ceil(params.total);
    let applicationFeeAmount = ceil(params.applicationFeeAmount);
    const connectedAccountId = params.connectedAccountId;
    const customerId = params.customerId;
    const metadata = get(params, "metadata", {});
    const paymentMethod = get(params, "paymentMethodId", null);

    const paymentIntentObject = {
      amount,
      metadata,
      application_fee_amount: applicationFeeAmount,
      currency: "usd",
      payment_method_types: ["us_bank_account"],
      transfer_data: {
        destination: connectedAccountId,
      },
      customer: customerId,
    };
    if (get(params, "metadata.statement_descriptor", false)) {
      paymentIntentObject.statement_descriptor = get(
        params,
        "metadata.statement_descriptor",
        false
      );
    }
    if (paymentMethod !== null) {
      paymentIntentObject.payment_method = paymentMethod;
      paymentIntentObject.confirm = true;
    } else {
      paymentIntentObject.setup_future_usage = "off_session";
    }

    const stripe = getStripeInstance(params);
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentObject
    );

    return { success: true, data: paymentIntent };
  } catch (error) {
    console.log("stripe error ===>", error);
    return {
      success: false,
      paymentIntent: {
        errorMessage: error.message,
        errorCode: error.code,
        payment_intent: error.payment_intent,
        payment_method: error.payment_method,
      },
    };
  }
};

const capturePaymentForValidationFlow = async (params) => {
  try {
    console.log("params ===>", params);
    const transactionId = params.transactionId || "";
    let amount = ceil(params.total);

    const stripe = getStripeInstance(params);
    const paymentIntent = await stripe.paymentIntents.capture(transactionId, {
      amount_to_capture: amount,
    });
    return { success: true, data: paymentIntent };
  } catch (error) {
    console.log("stripe error ===>", error);
    return {
      success: false,
      paymentIntent: {
        errorMessage: error.message,
        errorCode: error.code,
        payment_intent: error.payment_intent,
        payment_method: error.payment_method,
      },
    };
  }
};

const cancelPaymentForValidationFlow = async (params) => {
  try {
    const transactionId = params.transactionId || "";

    const stripe = getStripeInstance(params);
    const paymentIntent = await stripe.paymentIntents.cancel(transactionId);
    return { success: true, data: paymentIntent };
  } catch (error) {
    console.log("stripe error ===>", error);
    return {
      success: false,
      paymentIntent: {
        errorMessage: error.message,
        errorCode: error.code,
        payment_intent: error.payment_intent,
        payment_method: error.payment_method,
      },
    };
  }
};

const refund = async (params) => {
  try {
    const paymentIntent = params.paymentIntent;
    const amount = ceil(params.amount);
    const metadata = params.metadata;
    const isChargeAndTransferPayment = params.isChargeAndTransferPayment;
    const fullRefund = params.fullRefund;

    const stripe = getStripeInstance(params);
    const response = await stripe.refunds.create({
      amount,
      metadata,
      payment_intent: paymentIntent,
      reason: `requested_by_customer`,
      refund_application_fee: (!isChargeAndTransferPayment || fullRefund),
      reverse_transfer: true,
    });

    // Refund seconday account transfer
    if (isChargeAndTransferPayment && fullRefund && get(params, "paymentData.paymentInfo.extraParams.secondaryTransfer", false)) {
      const secondaryTransfer = get(params, "paymentData.paymentInfo.extraParams.secondaryTransfer", false);

      const transferReversal = await stripe.transfers.createReversal(
        secondaryTransfer.id,
        {
          amount: secondaryTransfer.amount,
        }
      );

      console.log("transferReversal ===>", transferReversal);
    }

    return { success: true, response };
  } catch (error) {
    return {
      response: {
        message: error.message,
      },
      success: false,
    };
  }
};

const createLoginLink = async (id, place = null) => {
  try {
    const stripe = getStripeInstance({ place: place });
    const link = await stripe.accounts.createLoginLink(id);
    return link;
  } catch (error) {
    return false;
  }
};

const connectAccountsList = async (place = null) => {
  try {
    const stripe = getStripeInstance({ place: place });
    const accounts = await stripe.accounts.list();
    if (accounts.data.length === 0) {
      return { success: true, total: 0, accounts: [] };
    }
    const responseAccounts = accounts.data.map(
      ({ email, id, charges_enabled }) => ({
        email: email || generateDemoEmail(),
        connectAccountId: id,
        active: charges_enabled,
      })
    );
    return {
      success: true,
      total: responseAccounts.length,
      accounts: responseAccounts,
    };
  } catch (error) {
    console.error("Error in connectAccountsList:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    };
  }
};

const getStripeCustomerId = async (customer, place) => {
  const stripeConfiguration = get(place, "stripeConfiguration.name", "default")
  
  // For copying the current stripe customerId to common object of ids
  if (stripeConfiguration === "default" && !customer.stripeCustomerIds) {
    console.log("customer ===>", customer);
    customer.stripeCustomerIds = {}
    customer.stripeCustomerIds["default"] = {
      customerId: customer.stripeCustomerId,
      paymentMethodId: customer.stripePaymentMethodId
    };

    const update = { $set: {} };
    update.stripeCustomerIds = customer.stripeCustomerIds;
    Customer.findOneAndUpdateCustomer({ _id: customer._id }, update, {
      new: true,
      upsert: true,
    });
  }

  return get(customer, `stripeCustomerIds.${stripeConfiguration}.customerId`, null);
}

const generateDepositReport = async (startDate, endDate) => {
  const stripe = getStripeInstance({});
  // Step 1: Create Report Run
  const reportRun = await stripe.reporting.reportRuns.create({
    report_type: "connected_account_balance_change_from_activity.itemized.1",
    parameters: {
      interval_start: startDate, // UNIX timestamp
      interval_end: endDate,    // UNIX timestamp
    },
  }
  );

  // Step 2: Poll for Report Status
  let reportStatus = reportRun.status;
  let reportResult = null;

  console.log("first reportStatus =====>>", reportStatus)

  do {
    const report = await stripe.reporting.reportRuns.retrieve(reportRun.id);
    reportStatus = report.status;

    if (reportStatus === "succeeded") {
      reportResult = report.result;
      break;
    }

    // Wait 2 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } while (reportStatus === "pending")

  if (!reportResult) {
    return {
      success: false,
      message: "Report generation timed out."
    }
  }

  // Step 3: Download the Report Data
  const file = await stripe.files.retrieve(reportResult.id);
  const reportUrl = file.url;

  console.log("reportUrl =====>>", reportUrl)

  return await getDepositReport(reportUrl);

  // // Respond with the URL for frontend (you can also fetch and parse the data if needed)
  // return {
  //   success: true,
  //   url: reportUrl
  // };
}

const getDepositReport = async (reportUrl) => {
  const stripe = getStripeInstance({});
  const csvData = await axios.get(reportUrl, {
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    }
  });
  console.log("csvData =====>>", csvData)
  const data = await csvData.data;

  return {
    success: true,
    data
  };
}

const getPaymentIntentDetails = async ({transactionId, place = null}) => {
  try {
    const stripe = getStripeInstance({ place: place });
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
    return paymentIntent;
  } catch (error) {
    console.error('Error fetching PaymentIntent:', error.message);
    return false;
  }
};

module.exports = {
  getPaymentIntentDetails,
  createPaymentIntent,
  createStripeCustomer,
  attachPaymentMethodToCustomer,
  deletePaymentMethods,
  getPaymentMethods,
  refund,
  createLoginLink,
  connectAccountsList,
  getPaymentMethodById,
  createPaymentIntentForACH,
  getOrCreateDCCustomer,
  cancelPaymentForValidationFlow,
  capturePaymentForValidationFlow,
  getStripeCustomerId,
  generateDepositReport,
  getDepositReport,
  transferSplitRevenuePaymentAfter3dSecure,
  getPaymentIntentDetails
};

// const stripe = require("stripe")(process.env.STRIPE_SECRETE_KEY);
// const { get, last, isInteger, uniqBy } = require("lodash");

// module.exports = {
//   async getTransactions(startDate, endDate) {
//     try {
//       /**
//        * UPLOAD FILE ON S3 BUCKET || CONFIGURE S3 BUCKET
//        */

//       const paymentIntents = await stripe.paymentIntents.list({
//         limit: 1,
//         created: { gte: startDate, lte: endDate },
//         include: ["total_count"],
//       });

//       // const paymentIntents = await stripe.paymentIntents.list(params);
//       // const transactions = get(paymentIntents, "data", []);
//       const totalCount = get(paymentIntents, "total_count", []);

//       const limit = 100;
//       let loopTime = totalCount / limit;
//       //   loopTime =
//       //     isInteger(loopTime) === false ? parseInt(loopTime) + 1 : loopTime;

//       let next = -1;
//       // eslint-disable-next-line complexity
//       // const params = { limit, created: { gte: 1682924400, lte: 1685084399 } };
//       const params = { limit, created: { gte: startDate, lte: endDate } };

//       let starting_after = "";
//       const transactionsList = [];
//       const nextFun = async () => {
//         next++;
//         if (next < loopTime) {
//           if (starting_after !== "") {
//             params.starting_after = starting_after;
//           }
//           const paymentIntents = await stripe.paymentIntents.list(params);
//           const transactions = get(paymentIntents, "data", []);
//           const lastElement = last(transactions);
//           starting_after = get(lastElement, "id", "");
//           transactionsList.push(...transactions);
//           console.log("starting_after=================", starting_after);
//           console.log("transactions=================", transactions.length);

//           console.log("loop=================", next);

//           await nextFun();
//         }
//       };
//       await nextFun();
//       console.log("loop=================", transactionsList.length);
//       const data = uniqBy(transactionsList, "id");
//       console.log("loop=================", data.length);

//       return { success: true, transactionsList };
//     } catch (e) {
//       console.log("error=============", e);
//       return { success: false, error: e?.message };
//     }
//   },
//   async getChargesList(startDate, endDate) {
//     try {
//       /**
//        * UPLOAD FILE ON S3 BUCKET || CONFIGURE S3 BUCKET
//        */

//       const paymentIntents = await stripe.paymentIntents.list({
//         limit: 1,
//         created: { gte: startDate, lte: endDate },
//         include: ["total_count"],
//       });

//       // const paymentIntents = await stripe.paymentIntents.list(params);
//       // const transactions = get(paymentIntents, "data", []);
//       const totalCount = get(paymentIntents, "total_count", []);

//       const limit = 100;
//       let loopTime = totalCount / limit;
//       //   loopTime =
//       //     isInteger(loopTime) === false ? parseInt(loopTime) + 1 : loopTime;

//       let next = -1;
//       // eslint-disable-next-line complexity
//       // const params = { limit, created: { gte: 1682924400, lte: 1685084399 } };
//       const params = { limit, created: { gte: startDate, lte: endDate } };

//       let starting_after = "";
//       const transactionsList = [];
//       const nextFun = async () => {
//         next++;
//         if (next < loopTime) {
//           if (starting_after !== "") {
//             params.starting_after = starting_after;
//           }
//           const charges = await stripe.charges.list(params);
//           const transactions = get(charges, "data", []);
//           const lastElement = last(transactions);
//           starting_after = get(lastElement, "id", "");
//           transactionsList.push(...transactions);
//           console.log("starting_after=================", starting_after);
//           console.log("transactions=================", transactions.length);

//           console.log("loop=================", next);

//           await nextFun();
//         }
//       };
//       await nextFun();
//       console.log("loop=================", transactionsList.length);
//       const data = uniqBy(transactionsList, "id");
//       console.log("loop=================", data.length);

//       return { success: true, transactionsList };
//     } catch (e) {
//       console.log("error=============", e);
//       return { success: false, error: e?.message };
//     }
//   },
// };
