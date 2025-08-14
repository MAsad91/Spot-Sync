const Subscription = require("../../../../models/subscriptions");
const {
  http200,
  http400,
  http403,
  http500,
} = require("../../../../global/errors/httpCodes");
const moment = require("moment");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

module.exports = async (req, res) => {
  try {
    const { userId } = req;
    const { placeId } = req.params;
    let success = false;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    if (!placeId || !isValidObjectId(placeId))
      return res.status(http403).json({
        success,
        message: "Invalid request",
      });

    const currentDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    const subscriptions = await Subscription.find({
      placeId: ObjectId(placeId),
    });
    let expiredSubscriptions = 0;
    let activeSubscriptions = 0;
    let activeLicensePlates = 0;
    let totalRenewalCount = 0;
    let totalRevenue = 0;

    subscriptions.forEach((subscription) => {
      const {
        startDate,
        endDate,
        isSubscriptionActive,
        isMonthly,
        licensePlate,
        renewalCount,
        subscriptionStatus,
        totalAmount,
        isSubscriptionPaused,
      } = subscription;

      if (subscriptionStatus === "active" && !isSubscriptionPaused) {
        if (isMonthly) {
          activeSubscriptions++;
        } else if (moment(currentDate).isBetween(startDate, endDate)) {
          activeSubscriptions++;
        }
        activeLicensePlates += licensePlate.length;
      } else if (moment(endDate).isBefore(currentDate)) {
        if (
          subscriptionStatus === "active" ||
          subscriptionStatus === "expired"
        ) {
          expiredSubscriptions++;
        }
      }

      if (subscriptionStatus === "active" && !isSubscriptionPaused) {
        totalRevenue += totalAmount;
      }

      totalRenewalCount += renewalCount;
    });

    const statistics = {
      expiredSubscriptions,
      activeSubscriptions,
      activeLicensePlates,
      totalRenewalCount,
      totalRevenue,
    };

    return res.status(http200).json({
      success: true,
      message: "success",
      statistics,
    });
  } catch (error) {
    console.error("Error fetching subscription statistics:", error);
    return res.status(http500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
