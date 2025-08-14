const moment = require("moment");
const Subscription = require("../../../models/subscriptions");
const Payment = require("../../../models/payments");
const { get } = require("lodash");
const { generateExternalKey } = require("../../../global/functions");

const { sendSlack } = require("../../../services/slack");

const CustomSubscriptionSlackUpdate = async () => {
  try {
    const query = {
      isMonthly: false,
      isCustomSubscription: true,
      isAutoRenew: true,
      isSlackUpdate: false,
      subscriptionStatus: "active",
    };
    const records = await Subscription.find(query)
      .populate({
        path: "customerId paymentId placeId brandId",
      })
      .limit(20)
      .exec();

    if (records.length === 0) {
      return { success: true, message: "No subscriptions" };
    }

    let count = 0;
    const promises = records.map(async (subscription) => {
      const { paymentId, placeId, customerId } = subscription;

      const payment = await Payment.findOne({ _id: paymentId });

      const slackMessage = `Payment received -
      Place: ${get(subscription, "placeId.google.formatted_address", "")}
      License plate: ${subscription?.licensePlate
        .map((lp) => lp.licensePlateNumber)
        .join(",")}
      Mobile: ${customerId.mobile || ""}
      Total: $${subscription.totalAmount}
      Start time: ${moment(subscription.startDate)
        .tz(placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A")}
      End time: ${moment(subscription.endDate)
        .tz(placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A")}
      
      Receipt - ${subscription.receiptURL}`;

      await sendSlack({
        purpose: "Payment Confirmation",
        placeId: placeId?._id,
        message: slackMessage,
      });
      subscription.isSlackUpdate = true;
      await subscription.save();
      count++;
    });

    await Promise.all(promises);

    return {
      success: true,
      message: `Updated ${count} subscriptions out of ${records.length}`,
    };
  } catch (error) {
    console.error("update slack error:", error);
    return {
      success: false,
      message: error.message || "Something went wrong!",
    };
  }
};

module.exports = CustomSubscriptionSlackUpdate;
