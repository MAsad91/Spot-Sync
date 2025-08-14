const moment = require("moment");
const Subscription = require("../../../models/subscriptions");
const ReceiptCollection = require("../../../models/receipts");
const Payment = require("../../../models/payments");
const { get } = require("lodash");
const {
  createPaymentIntent,
  getOrCreateDCCustomer,
  getStripeCustomerId,
} = require("../../../services/stripe");

const {
  Types: { ObjectId },
} = require("mongoose");
const { isDirectChargePayment } = require("../../../services/revenue");
const Authorizenet = require("../../../services/authorizenet");
const { getSubscriptionRevenueModel } = require("../../../services/revenue");
const { generateSerialNumber, amountToShow } = require("../../../global/functions");

const getNewDates = async ({ startDate, endDate, isMonthly }) => {
  const oldStartMoment = moment(startDate);
  const oldEndMoment = moment(endDate);
  const newStartDate = oldEndMoment.add(1, "days");
  let newEndDate;
  if (isMonthly) {
    const daysInMonth = newStartDate.daysInMonth();
    newEndDate = moment(newStartDate)
      .utc()
      .add(daysInMonth - 1, "days");
  } else {
    const duration = oldEndMoment.diff(oldStartMoment, "days");
    console.log("duration: " + duration);
    newEndDate = moment(newStartDate).utc().add(duration, "days");
  }
  const nextRenewalDate = newEndDate.clone().add(1, "days");

  return {
    startDate: newStartDate,
    endDate: newEndDate,
    nextRenewalDate: moment(nextRenewalDate).format("MM/DD/YYYY"),
  };
};

const ChargeCustomer = async () => {
  try {
    const query = {
      _id: ObjectId("66312be08c29aa9ae4a19c10"),
    };
    const subscription = await Subscription.findOne(query).populate(
      "customerId paymentId placeId brandId"
    );
    const {
      customerId,
      defaultPaymentMethodId,
      paymentId,
      paymentMethodType,
      placeId,
      isApplyTax,
      isApplyServiceFee,
      isApplyTaxOnServiceFee,
    } = subscription;

    const newDates = await getNewDates({
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      isMonthly: subscription.isMonthly,
    });

    const revenueModal = await getSubscriptionRevenueModel(
      {
        baseRate: 10000,
        placeId: placeId._id,
        isApplyTax: isApplyTax,
        isApplyServiceFee: isApplyServiceFee,
        isApplyTaxOnServiceFee: isApplyTaxOnServiceFee,
      },
      subscription.isDirectChargeSubscription
    );
    console.log("revenueModal ===>", revenueModal);
    const { totalAmount, applicationFee } = revenueModal;
    const paymentMethod = defaultPaymentMethodId
      ? defaultPaymentMethodId
      : paymentId.paymentMethodId;

    let paymentObject = {
      customerId: customerId._id,
      purpose: "SUBSCRIPTION",
      subscriptionId: subscription._id,
      stripeCustomerId: await getStripeCustomerId(customerId.stripeCustomerId, placeId),
      paymentMethodId: paymentMethod,
      paymentMethodType,
      subscriptionNumber: get(subscription, "subscriptionNumber", ""),
      placeId: placeId._id,
      licensePlate: [
        {
          licensePlateNumber: "CC9417",
          price: 10000,
          assignName: "Jennifer Hallgarth",
        },
      ],
      isApplyTax: get(subscription, "isApplyTax", false),
      isApplyServiceFee: get(subscription, "isApplyServiceFee", false),
      isApplyTaxOnServiceFee: get(
        subscription,
        "isApplyTaxOnServiceFee",
        false
      ),
      paymentGatewayFeePayBy: subscription.paymentGatewayFeePayBy,
      baseRate: get(revenueModal, "baseRate", 0),
      tax: get(revenueModal, "tax", 0),
      taxPercentage: get(subscription, "taxPercentage", 0),
      cityTax: get(revenueModal, "cityTax", 0),
      cityTaxPercentage: get(subscription, "cityTaxPercentage", 0),
      countyTax: get(revenueModal, "countyTax", 0),
      countyTaxPercentage: get(subscription, "countyTaxPercentage", 0),
      serviceFee: get(revenueModal, "serviceFee", 0),
      ownerPayout: get(revenueModal, "ownerPayout", 0),
      isbpRevenue: get(revenueModal, "isbpRevenue", 0),
      applicationFee: get(revenueModal, "applicationFee", 0),
      paymentGatewayFee: get(revenueModal, "paymentGatewayFee", 0),
      totalAmount: get(revenueModal, "totalAmount", 0),
    };

    console.log("paymentObject ===>", paymentObject);

    let receiptData = {
      subscriptionType: subscription.isMonthly ? "Monthly" : "Custom",
      subscriptionNumber: subscription.subscriptionNumber,
      toEmail: get(customerId, "email", ""),
      parkerName: `${get(customerId, "firstName", "")} ${get(
        customerId,
        "lastName",
        ""
      )}`,
      brandLogo: get(subscription, "brandLogo", ""),
      startDate: moment(newDates.startDate).format("MM/DD/YYYY"),
      endDate: moment(newDates.endDate).format("MM/DD/YYYY"),
      tax: `${amountToShow(revenueModal.tax)}`,
      cityTax: `${amountToShow(revenueModal.cityTax)}`,
      countyTax: `${amountToShow(revenueModal.countyTax)}`,
      serviceFee: `${revenueModal.serviceFee / 100}`,
      paymentGatewayFee: `${amountToShow(revenueModal.paymentGatewayFee)}`,
      total: `${amountToShow(revenueModal.totalAmount)}`,
      baseRate: `${amountToShow(revenueModal?.baseRate)}`,
      brandName: `${get(subscription, "brandId.brandName", "")}`,
      brandAddress: `${get(subscription, "brandId.brandAddress", "")}`,
      brandMobile: `${get(subscription, "brandId.ownerMobileNumber", "")}`,
      companyName: `${get(customerId, "companyName", "")}`,
      parkerEmail: `${get(customerId, "email", "")}`,
      autoRenew: get(subscription, "isAutoRenew", false),
      nextRenewalDate: newDates.nextRenewalDate,
      placeAddress: get(subscription, "placeId.google.formatted_address", ""),
      discount: 0,
      licensePlates: [
        {
          licensePlateNumber: "CC9417",
          price: 10000,
          assignName: "Jennifer Hallgarth",
        },
      ],
      updatedServiceFee:
        get(subscription, "paymentGatewayFeePayBy", "isbp") === "customer"
          ? `${amountToShow(
              get(revenueModal, "paymentGatewayFee", 0) +
                revenueModal.serviceFee
            )}`
          : `${amountToShow(revenueModal.serviceFee)}`,
    };

    const directChargePayment = isDirectChargePayment(placeId, subscription);
    const stripeProps = {
      total: totalAmount,
      applicationFeeAmount: applicationFee,
      connectedAccountId: get(
        subscription,
        "placeId.connectAccountId",
        "acct_1OmGEqH75gj1EHDr"
      ),
      customerId: await getStripeCustomerId(customerId, placeId),
      customer: customerId,
      place: placeId,
      directChargePayment,
      currency: "usd",
      metadata: {
        mobile: get(customerId, "mobile", ""),
        email: get(customerId, "email", ""),
        subscriptionId: subscription._id.toString(),
        shortlyId: subscription.shortlyId ? subscription.shortlyId : "",
        Purpose: "SUBSCRIPTION",
        parkingCode: get(subscription, "placeId.parkingCode", ""),
        paymentMethodType: "card",
        statement_descriptor: get(
          subscription,
          "placeId.statementDescriptor",
          false
        ),
      },
      paymentMethodId: paymentMethod,
    };

    console.log("stripeProps ====>", stripeProps);

    // return {
    //   success: true,
    // };

    let paymentIntent;
    if (subscription.placeId.paymentGateway === "AUTHORIZENET") {
      const authorizenet = new Authorizenet(subscription.placeId);
      paymentIntent = await authorizenet.chargeCustomerProfile(
        subscription.customerId,
        totalAmount / 100
      );
    } else {
      if (directChargePayment) {
        const connectAccountId = get(
          subscription,
          "placeId.connectAccountId",
          "acct_1OmGEqH75gj1EHDr"
        );
        const customerDCProfile = await getOrCreateDCCustomer(
          customerId,
          connectAccountId,
          paymentMethod,
          subscription.placeId
        );

        paymentObject.stripeCustomerId = customerDCProfile.customerId;
        paymentObject.paymentMethodId = customerDCProfile.paymentMethodId;
        paymentObject.isDirectCharge = true;
        paymentObject.connectAccountId = connectAccountId;
      }

      paymentIntent = await createPaymentIntent(stripeProps);
      console.log("paymentIntent ====>", paymentIntent);
    }

    if (!paymentIntent.success) {
      const transactionDate = moment
        .unix(paymentIntent.data?.payment_intent?.created || moment().unix())
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      paymentObject.paymentStatus = "failed";
      paymentObject.paymentInfo = paymentIntent.data;
      paymentObject.transactionId = paymentIntent.data?.payment_intent?.id;
      paymentObject.transactionDate = transactionDate;

      await Payment.create(paymentObject);
      return { success: false, message: "Payment Failed" };
    } else {
      const transactionDate = moment
        .unix(paymentIntent.data?.payment_intent?.created || moment().unix())
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      const receiptNumber = await generateSerialNumber({ type: "receipt" });
      receiptData.serialNumber = receiptNumber;
      receiptData.type = "receipt";
      paymentObject.paymentStatus = "success";
      paymentObject.paymentInfo = paymentIntent.data;
      paymentObject.transactionId = paymentIntent.data?.id;
      paymentObject.transactionDate = transactionDate;
      receiptData.paymentData = moment
        .tz(transactionDate, placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A");
      receiptData.paymentDate = moment
        .tz(transactionDate, placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A");
      receiptData.transactionId = paymentIntent.data?.id;
      const receiptURL = `${process.env.FRONT_DOMAIN}sub-receipt?id=${receiptData.serialNumber}`;
      await ReceiptCollection.create(receiptData),
        console.log("receiptURL ---->", receiptURL);

      paymentObject.receiptURL = receiptURL;
      await Payment.create(paymentObject);
    }
    return {
      success: true,
    };
  } catch (error) {
    console.log("Error ===>", error);
    return {
      success: false,
      message: error.message || "Something went wrong!",
    };
  }
};

module.exports = ChargeCustomer;
