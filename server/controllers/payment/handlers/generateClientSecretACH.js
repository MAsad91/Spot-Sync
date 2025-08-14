const Subscription = require("../../../models/subscriptions");
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

module.exports = async (req, res) => {
  let success = false;
  try {
    const { body } = req;
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

    const { isMonthly } = subscriptionData;

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
        isACHRenewal: false,
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
    if (!paymentIntent.success) {
      return res.status(http400).json({
        success: paymentIntent.success,
        message: paymentIntent.message,
      });
    } else {
      await Shortly.findOneAndUpdate(
        { shortlyId: subscriptionData.shortlyId },
        {
          paymentStatus: "pending",
          clientSecretACH: paymentIntent.data.client_secret,
          $inc: { clientSecretGenerateCount: 1 },
        }
      );

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
