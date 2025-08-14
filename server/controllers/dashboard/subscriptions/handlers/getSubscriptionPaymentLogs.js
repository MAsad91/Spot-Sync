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
    let success = false;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });

    const subscription = await Subscription.findOne(
      {
        _id: ObjectId(subscriptionId),
      },
      { customerId: 1 }
    ).lean();

    if (!subscription) {
      return res.status(http403).json({
        success,
        message: "Invalid Request",
      });
    }
    const customerId = get(subscription, "customerId", false);
    const payments = await Payment.find(
      {
        subscriptionId: ObjectId(subscriptionId),
        customerId: ObjectId(customerId),
      },
      {
        paymentMethodType: 1,
        paymentStatus: 1,
        createdAt: 1,
        "paymentInfo.amount": 1,
        "paymentInfo.message": 1,
        "paymentInfo.payment_intent.amount": 1,
      }
    ).lean();
    if (!payments) {
      return res.status(http403).json({
        success,
        message: "Something went wrong!",
      });
    }
    // console.log("payments ===>", payments);

    return res.status(http200).json({
      success: true,
      message: "success",
      payments,
    });
  } catch (error) {
    console.error("Error fetching subscription statistics:", error);
    return res.status(http500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
