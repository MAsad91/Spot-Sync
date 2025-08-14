const moment = require("moment");
const Subscription = require("../../models/subscriptions");

const ExpireSubscription = async () => {
  try {
    const subscriptions = await Subscription.find({
      isSubscriptionActive: true,
      endDate: { $lte: moment().endOf("day").toDate() }, // Find subscriptions with endDate less than or equal to today
    }).lean();

    let expireSubscriptionCount = 0;
    // Iterate through subscriptions
    for (const subscription of subscriptions) {
      const updateObject = {
        $set: {
          isSubscriptionActive: false,
          subscriptionStatus: "expired",
        },
      };
      // Update subscription with the new status
      const expire = await Subscription.updateOne(
        { _id: subscription._id },
        updateObject
      );
      if (expire.nModified > 0) {
        expireSubscriptionCount += 1; // Corrected increment operator
      }
    }

    return {
      success: true,
      message: `${expireSubscriptionCount} subscriptions expired!`,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Something went wrong!",
    };
  }
};

module.exports = ExpireSubscription;
