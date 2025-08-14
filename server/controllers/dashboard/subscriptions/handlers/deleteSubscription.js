const Subscription = require("../../../../models/subscriptions");
const Shortly = require("../../../../models/shortly");
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

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      userId,
      params: { subscriptionId },
    } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    let update = {};
    const filter = { _id: ObjectId(subscriptionId) };
    update["$set"] = {
      status: DOC_STATUS.DELETE,
      subscriptionStatus: "deleted",
    };
    const subscriptionData = await Subscription.findOne(filter);
    if (!subscriptionData) {
      return res.status(http400).json({
        success,
        message: "Invalid Subscription",
      });
    }
    if (subscriptionData.isSubscriptionActive) {
      return res.status(http400).json({
        success,
        message:
          "This Subscription is Currently Active, You can't delete this subscription",
      });
    }
    const updateSub = await Subscription.updateOne(filter, update);
    if (updateSub.nModified > 0) {
      const shortlyUpdate = await Shortly.updateOne(
        { subscriptionId: ObjectId(subscriptionId) },
        {
          $set: { status: DOC_STATUS.DELETE },
        }
      );
      // console.log("shortlyUpdate ===>", shortlyUpdate);
    }
    return res.status(http200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
