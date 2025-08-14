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
const { DOC_STATUS } = require("../../../../constants");
const { getPaymentMethodById } = require("../../../../services/stripe");
const Authorizenet = require("../../../../services/authorizenet");
const { isEmpty } = require("lodash");
const { type } = require("os");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId, body } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    
    let subscription = null;
    if (body.subscriptionId && isValidObjectId(body.subscriptionId)) {
      subscription = await Subscription.findOne({ _id: ObjectId(body.subscriptionId) }).populate(
        "customerId paymentId"
      );
    }

    let params = {
      customerId: body.customerId,
      paymentMethodId: body.paymentMethodId,
      place: body.placeId
    };

    if (subscription?.isDirectChargeSubscription || body.isDirectCharge) {
      params["isDirectChargePayment"] = true;
      if (subscription && subscription.paymentId) {
        params["customerId"] = subscription.paymentId.stripeCustomerId;
        params["paymentMethodId"] = subscription.paymentId.paymentMethodId;
      }
    }

    let paymentMethod;

    if (body.authorizenetCustomerId && body.placeId) {
      const authorizenet = new Authorizenet(body.placeId);
      paymentMethod = await authorizenet.getPaymentProfileDetails(body.authorizenetCustomerId, body.paymentMethodId);

      if (paymentMethod?.success) {
        return res.status(http200).json({
          success: true,
          message: "Success",
          data: {
            id: body.paymentMethodId,
            card: {
              brand: paymentMethod.creditCart?.cardType?.toLowerCase(),
              display_brand: paymentMethod.creditCart?.cardType?.toLowerCase(),
              exp_month: "XX",
              exp_year: "XX",
              last4: paymentMethod.creditCart?.cardNumber?.slice(-4),
            },
            customer: body.authorizenetCustomerId,
            type: "card"
          },
        });
      }

      return res.status(http200).json({
        success: true,
        message: "Success",
        data: {},
      });
    }

    paymentMethod = await getPaymentMethodById(params);

    if (isEmpty(paymentMethod.data)) {
      return res.status(http200).json({
        success: true,
        message: "Success",
        data: {},
      });
    }
    return res.status(http200).json({
      success: true,
      message: "Success",
      data: paymentMethod.data,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
