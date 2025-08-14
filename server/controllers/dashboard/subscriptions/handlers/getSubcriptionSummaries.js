const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const SubscriptionSummaries = require("../../../../models/subscriptionSummaries");

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      userId,
      params: { placeId },
    } = req;
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
    const [summaryStatistics] = await SubscriptionSummaries.aggregate([
      { $match: { placeId: ObjectId(placeId) } },
      {
        $group: {
          _id: "$placeId",
          totalAttempts: { $sum: "$totalAttempts" },
          totalSuccess: { $sum: "$totalSuccess" },
          totalFailed: { $sum: "$totalFailed" },
          totalRefunded: { $sum: "$totalRefunded" },
          totalAmount: { $sum: "$totalAmount" },
          totalSuccessAmount: { $sum: "$totalSuccessAmount" },
          totalFailedAmount: { $sum: "$totalFailedAmount" },
          totalRefundedAmount: { $sum: "$totalRefundedAmount" },
          totalcardPayments: { $sum: "$totalcardPayments" },
          totalACHPayments: { $sum: "$totalACHPayments" },
          ACHSuccessPayments: { $sum: "$ACHSuccessPayments" },
          cardFailedPayments: { $sum: "$cardFailedPayments" },
          ACHFailedPayments: { $sum: "$ACHFailedPayments" },
        },
      },
    ]);

    const subscriptionsSummaries = await SubscriptionSummaries.find({
      placeId: ObjectId(placeId),
    })
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "paymentIds",
          model: "payments",
          populate: [
            { path: "customerId", model: "customers" },
            { path: "subscriptionId", model: "subscriptions" },
          ],
        },
      ])
      .lean();

    return res.status(http200).json({
      success: true,
      message: "Success",
      data: {
        summaryStatistics,
        subscriptionsSummaries,
      },
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
