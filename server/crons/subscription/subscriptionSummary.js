const moment = require("moment");
const Subscription = require("../../models/subscriptions");
const SubscriptionSummaries = require("../../models/subscriptionSummaries");
const {
  Types: { ObjectId },
} = require("mongoose");

const SubscriptionSummary = async (placeId) => {
  try {
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();
    const subscriptions = await Subscription.aggregate([
      {
        $match: {
          placeId: ObjectId(placeId),
          timestamp: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $lookup: {
          from: "payments",
          let: { subscriptionId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$subscriptionId", "$$subscriptionId"] },
                placeId: ObjectId(placeId),
              },
            },
            {
              $project: {
                _id: 1, // Include paymentId in the projection
                paymentStatus: 1,
                totalAmount: 1,
                paymentMethodType: 1,
              },
            },
          ],
          as: "payments",
        },
      },
      {
        $unwind: {
          path: "$payments",
        },
      },
      {
        $group: {
          _id: "$brandId",
          totalAttempts: { $sum: 1 },
          totalAmount: { $sum: "$payments.totalAmount" },
          totalSuccess: {
            $sum: {
              $cond: [{ $eq: ["$payments.paymentStatus", "success"] }, 1, 0],
            },
          },
          totalFailed: {
            $sum: {
              $cond: [{ $eq: ["$payments.paymentStatus", "failed"] }, 1, 0],
            },
          },
          totalRefunded: {
            $sum: {
              $cond: [{ $eq: ["$payments.paymentStatus", "refunded"] }, 1, 0],
            },
          },
          cardSuccessPayments: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$payments.paymentStatus", "success"] },
                    { $eq: ["$payments.paymentMethodType", "card"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          ACHSuccessPayments: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$payments.paymentStatus", "success"] },
                    { $eq: ["$payments.paymentMethodType", "ACH"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          cardFailedPayments: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$payments.paymentStatus", "failed"] },
                    { $eq: ["$payments.paymentMethodType", "card"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          ACHFailedPayments: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$payments.paymentStatus", "failed"] },
                    { $eq: ["$payments.paymentMethodType", "ACH"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          // totalPendingPayments: {
          //   $sum: {
          //     $cond: [{ $eq: ['$payments.paymentStatus', 'pending'] }, 1, 0],
          //   },
          // },
          // totalPendingPaymentAmount: {
          //   $sum: {
          //     $cond: [{ $eq: ['$payments.paymentStatus', 'pending'] }, '$payments.totalAmount', 0],
          //   },
          // },
          totalSuccessAmount: {
            $sum: {
              $cond: [
                { $eq: ["$payments.paymentStatus", "success"] },
                "$payments.totalAmount",
                0,
              ],
            },
          },
          totalFailedAmount: {
            $sum: {
              $cond: [
                { $eq: ["$payments.paymentStatus", "failed"] },
                "$payments.totalAmount",
                0,
              ],
            },
          },
          totalRefundedAmount: {
            $sum: {
              $cond: [
                { $eq: ["$payments.paymentStatus", "refunded"] },
                "$payments.totalAmount",
                0,
              ],
            },
          },
          totalcardPayments: {
            $sum: {
              $cond: [{ $eq: ["$payments.paymentMethodType", "card"] }, 1, 0],
            },
          },
          totalACHPayments: {
            $sum: {
              $cond: [{ $eq: ["$payments.paymentMethodType", "ACH"] }, 1, 0],
            },
          },
          paymentIds: { $push: "$payments._id" },
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "_id",
          foreignField: "_id",
          as: "brandDetails",
        },
      },
      {
        $unwind: {
          path: "$brandDetails",
        },
      },
      {
        $project: {
          _id: 0,
          brandId: "$_id",
          totalAttempts: 1,
          totalAmount: 1,
          totalSuccess: 1,
          totalFailed: 1,
          totalRefunded: 1,
          cardSuccessPayments: 1,
          ACHSuccessPayments: 1,
          cardFailedPayments: 1,
          ACHFailedPayments: 1,
          // totalPendingPayments: 1,
          // totalPendingPaymentAmount: 1,
          totalSuccessAmount: 1,
          totalFailedAmount: 1,
          totalRefundedAmount: 1,
          totalcardPayments: 1,
          totalACHPayments: 1,
          paymentIds: 1,
          placeId,
        },
      },
    ]);

    console.log("subscriptions", subscriptions);
    if (subscriptions.length === 0) {
      return { success: true, message: "No subscriptions summary to show." };
    } else {
      for (const item of subscriptions) {
        try {
          await SubscriptionSummaries.create(item);
        } catch (error) {
          console.error("Error creating subscription summary:", error);
        }
      }
      // console.log('subscriptionSummary', subscriptionSummary)
      return { success: true, message: "Summary created." };
    }
  } catch (error) {
    console.error("Error aggregating subscription summary:", error);
    throw error;
  }
};

module.exports = SubscriptionSummary;
