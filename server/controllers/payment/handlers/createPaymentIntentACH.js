const Subscription = require("../../../models/subscriptions");
const Payment = require("../../../models/payments");
const Reservation = require("../../../models/reservations");
const Shortly = require("../../../models/shortly");
const { http200, http400 } = require("../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
} = require("mongoose");
const {
  createPaymentIntentForACH,
  getStripeCustomerId
} = require("../../../services/stripe");
const { get } = require("lodash");
const { generateSerialNumber } = require("../../../global/functions");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { body } = req;
    console.log("body ====>", body);
    const { shortlyId, subscriptionId } = body;
    if (!shortlyId || !subscriptionId) {
      return res.status(http400).json({
        success,
        message: "Invalid Payment",
      });
    }
    const subscriptionData = await Subscription.findOne({
      _id: ObjectId(subscriptionId),
    }).populate({
      path: "customerId placeId brandId",
    });
    if (!subscriptionData) {
      return res.status(http400).json({
        success,
        message: "Invalid Payment",
      });
    }

    const isMonthly = get(subscriptionData, "isMonthly", false);
    let paymentObject = {
      paymentStatus: "initialize",
      customerId: get(subscriptionData, "customerId._id", ""),
      purpose: "SUBSCRIPTION",
      subscriptionId,
      shortlyId: get(subscriptionData, "shortlyId", ""),
      stripeCustomerId: await getStripeCustomerId(subscriptionData.customerId, subscriptionData.placeId),
      paymentMethodId: "",
      paymentMethodType: "ACH",
    };
    let reservationObject = {
      purpose: "SUBSCRIPTION",
      status: "initialize",
      licensePlate: subscriptionData?.licensePlate.map(
        (obj) => obj.licensePlateNumber
      ),
      subscriptionId,
      customerId: get(subscriptionData, "customerId._id", ""),
      placeId: subscriptionData?.placeId,
      startDate: subscriptionData?.startDate,
      endDate: subscriptionData?.endDate,
      baseRate: isMonthly
        ? subscriptionData?.firstMonthBaseRate
        : subscriptionData?.baseRate,
      totalAmount: isMonthly
        ? subscriptionData?.firstMonthTotalAmount
        : subscriptionData?.totalAmount,
      isbpRevenue: isMonthly
        ? subscriptionData?.firstMonthIsbpRevenue
        : subscriptionData?.isbpRevenue,
      tax: isMonthly ? subscriptionData.firstMonthTax : subscriptionData?.tax,
      cityTax: isMonthly ? subscriptionData.firstMonthCityTax : subscriptionData?.cityTax,
      countyTax: isMonthly ? subscriptionData.firstMonthCountyTax : subscriptionData?.countyTax,
      serviceFee: isMonthly
        ? subscriptionData?.firstMonthServiceFee
        : subscriptionData?.serviceFee,
      ownerPayout: isMonthly
        ? subscriptionData?.firstMonthOwnerPayout
        : subscriptionData?.ownerPayout,
      paymentGatewayFee: isMonthly
        ? subscriptionData?.firstMonthPaymentGatewayFee
        : subscriptionData?.paymentGatewayFee,
      applicationFee: isMonthly
        ? subscriptionData?.firstMonthApplicationFee
        : subscriptionData?.applicationFee,
      brandId: subscriptionData?.brandId,
    };
    const params = {
      applicationFeeAmount: isMonthly
        ? subscriptionData?.firstMonthApplicationFee
        : subscriptionData?.applicationFee,
      total: isMonthly
        ? subscriptionData?.firstMonthTotalAmount
        : subscriptionData?.totalAmount,
      currency: "usd",
      connectedAccountId: get(
        subscriptionData,
        "placeId.connectAccountId",
        "acct_1OL3ckGhlwN1mZBy"
      ),
      paymentMethodId: null,
      customerId: await getStripeCustomerId(subscriptionData.customerId, subscriptionData.placeId),
      place: get(subscriptionData, "placeId", ""),
      metadata: {
        mobile: get(subscriptionData, "customerId.mobile", ""),
        email: get(subscriptionData, "customerId.email", ""),
        subscriptionId,
        shortlyId,
        Purpose: "SUBSCRIPTION",
        parkingCode: get(subscriptionData, "placeId.parkingCode", ""),
        paymentMethodType: "ACH",
        statement_descriptor: get(
          subscriptionData,
          "placeId.statementDescriptor",
          false
        ),
        placeAddress: get(subscriptionData, "placeId.google.formatted_address", ""),
      },
    };

    const paymentIntent = await createPaymentIntentForACH(params);
    console.log("paymentIntent >>>>>", paymentIntent);

    let subscriptionNumber;
    if (!paymentIntent.success) {
      paymentObject.paymentInfo = paymentIntent.data;
      reservationObject.transactionId = paymentIntent.data?.id;
      const payment = await Payment.create(paymentObject);
      reservationObject.paymentId = payment._id;
      await Reservation.create(reservationObject);
      return res.status(http400).json({
        success: paymentIntent.success,
        message: paymentIntent.message,
      });
    } else {
      subscriptionNumber = await generateSerialNumber({ type: "subscription" });
      paymentObject.paymentInfo = paymentIntent.data;
      reservationObject.transactionId = paymentIntent.data?.id;
      const payment = await Payment.create(paymentObject);
      reservationObject.paymentId = payment._id;
      reservationObject.subscriptionNumber = subscriptionNumber;

      await Subscription.findOneAndUpdate(
        { _id: ObjectId(subscriptionId) },
        {
          isSubscriptionActive: false,
          paymentId: payment._id,
          subscriptionNumber: subscriptionNumber,
          subscriptionStatus: "initialize",
          paymentMethodType: "ACH",
        }
      );
      await Shortly.findOneAndUpdate(
        { shortlyId: subscriptionData.shortlyId },
        {
          paymentStatus: "pending",
          clientSecretACH: paymentIntent.data.client_secret,
          $inc: { clientSecretGenerateCount: 1 },
        }
      );
      await Reservation.create(reservationObject);

      return res.status(http200).json({
        success: true,
        clientSecret: paymentIntent.data.client_secret,
        email: get(subscriptionData, "customerId.email", ""),
      });
    }
  } catch (error) {
    console.log("error ====>", error);
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
