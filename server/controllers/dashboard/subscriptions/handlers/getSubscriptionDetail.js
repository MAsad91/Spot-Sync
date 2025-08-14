const Subscription = require("../../../../models/subscriptions");
const Payment = require("../../../../models/payments");
const {
  http200,
  http400,
  http403,
  http500,
} = require("../../../../global/errors/httpCodes");
const { get } = require("lodash");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

module.exports = async (req, res) => {
  try {
    const { userId } = req;
    const { subscriptionId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(http403).json({
        success: false,
        message: "Invalid Token",
      });
    }

    const subscription = await Subscription.findById(subscriptionId).populate({
      path: "customerId placeId brandId",
    });

    if (!subscription) {
      return res.status(http400).json({
        success: false,
        message: "Subscription not found",
      });
    }

    const customerId = subscription.customerId
      ? subscription.customerId._id || subscription.customerId
      : false;
    if (!customerId) {
      return res.status(http400).json({
        success: false,
        message: "Customer not found in subscription",
      });
    }

    const payments = await Payment.find({
      subscriptionId: subscriptionId,
      customerId: customerId,
    })
      .populate("subscriptionId placeId")
      .lean();
    const subscriptionObj = subscription.toObject();
    subscriptionObj.payments = payments;
    return res.status(http200).json({
      success: true,
      message: "Success",
      data: subscriptionObj,
    });
  } catch (error) {
    console.error("Error fetching subscription statistics:", error);
    return res.status(http500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
