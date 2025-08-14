const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

const SubscriptionCollection = require("../../../../models/subscriptions");
const moment = require("moment");
const { isEmpty } = require("lodash");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId, body } = req;
    if (!userId || !isValidObjectId(userId)) {
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    }

    const { placeId, startDate, endDate, status, tz } = body;
    let findQuery = {
      placeId: ObjectId(placeId),
    };
    if (startDate && endDate) {
      const start = moment.tz(startDate, tz).startOf("day");
      const end = moment.tz(endDate, tz).endOf("day");
      // findQuery.$and = [
      //   { startDate: { $lte: end } },
      //   { endDate: { $gte: start } },
      // ];
      findQuery.startDate = { $lte: end };
      findQuery.endDate = { $gte: start };
    }
    if (status && status !== "all") {
      findQuery.subscriptionStatus =
        status === "payment pending" ? "initialize" : status;
    }

    console.log("findQuery ===>", findQuery);

    const subscriptions = await SubscriptionCollection.find(findQuery);
    let statistics = {
      totalAttempts: 0,
      totalSuccess: 0,
      totalFailed: 0,
      totalRefunded: 0,
      totalAmount: 0,
      totalSuccessAmount: 0,
      totalFailedAmount: 0,
      totalRefundedAmount: 0,
      totalCardPayments: 0,
      totalACHPayments: 0,
    };

    subscriptions.forEach((subscription) => {
      statistics.totalAttempts++;
      statistics.totalAmount += subscription.totalAmount;

      switch (subscription.subscriptionStatus) {
        case "active":
          statistics.totalSuccess++;
          statistics.totalSuccessAmount += subscription.totalAmount;
          break;
        case "failed":
          statistics.totalFailed++;
          statistics.totalFailedAmount += subscription.totalAmount;
          break;
        case "refunded":
          statistics.totalRefunded++;
          statistics.totalRefundedAmount += subscription.totalAmount;
          break;
        default:
          break;
      }

      if (subscription.paymentMethodType === "card") {  
        statistics.totalCardPayments++;
      } else if (subscription.paymentMethodType === "ACH") {
        statistics.totalACHPayments++;
      }
    });
    return res.status(http200).json({
      success: true,
      message: "Success",
      subscriptions,
      totalSubscriptions: subscriptions.length,
      subscriptionStatistics: statistics,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
