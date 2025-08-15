const Subscription = require("../../../../models/subscriptions");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const {
  attachPaymentMethodToCustomer,
  getStripeCustomerId,
} = require("../../../../services/stripe");
const JazzCash = require("../../../../services/jazzCash");
const EasyPaisa = require("../../../../services/easyPaisa");
const { isEmpty, get } = require("lodash");
const {
  isDirectChargePayment,
} = require("../../../../services/revenue");

module.exports = async (req, res) => {
  try {
    const { userId } = req;
    const { subscriptionId, paymentMethodId, paymentToken } = req.body;

    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(http403)
        .json({ success: false, message: "Invalid Token" });
    }
    if (
      !subscriptionId ||
      !isValidObjectId(subscriptionId) ||
      (!paymentMethodId && !paymentToken)
    ) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid Request" });
    }

    const subscription = await Subscription.findById(
      subscriptionId,
      "customerId defaultPaymentMethodId placeId isDirectChargeSubscription"
    ).populate("customerId placeId");
    if (!subscription) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid Subscription" });
    }

    const { customerId, defaultPaymentMethodId } = subscription;

    if (!customerId || !defaultPaymentMethodId) {
      return res.status(http403).json({
        success: false,
        message: "Missing Customer or Payment Method information",
      });
    }

    if (paymentToken) {
      // Pakistan payment gateways don't support payment profiles like Authorize.net
      return res.status(http400).json({
        success: false,
        message: "Payment profiles not supported for Pakistan payment gateways",
      });
    }

    const directChargePayment = isDirectChargePayment(subscription.placeId, subscription);

    const stripeCustomerId = await getStripeCustomerId(customerId, subscription.placeId);

    const attachResult = await attachPaymentMethodToCustomer(
      stripeCustomerId,
      paymentMethodId,
      subscription.placeId,
      directChargePayment,
      customerId
    );
    if (!attachResult) {
      return res.status(http400).json({
        success: false,
        message: "Failed to attach new payment method",
      });
    }

    if (directChargePayment) {
      await Subscription.findByIdAndUpdate(subscriptionId, {
        $set: { defaultPaymentMethodId: attachResult.paymentMethodId },
      });
    } else {
      await Subscription.findByIdAndUpdate(subscriptionId, {
        $set: { defaultPaymentMethodId: paymentMethodId },
      });
    }

    return res
      .status(http200)
      .json({ success: true, message: "Payment Method has been updated" });
  } catch (error) {
    console.log("error.message ---->", error.message);
    console.log("error.stack ---->", error.stack);
    return res.status(http400).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
