const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

const TransactionCollection = require("../../../../models/payments");
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

    const { placeId, purpose, startDate, endDate, status, tz } = body;

    let findQuery = {};

    if (!isEmpty(placeId) && !placeId.includes("all")) {
      findQuery.placeId = { $in: placeId };
    }
    if (startDate && endDate) {
      let start = moment.tz(startDate, tz).startOf("day");
      let end = moment.tz(endDate, tz).endOf("day");
      if (tz === "UTC") {
        start = moment(startDate).startOf("day").utc();
        end = moment(endDate).endOf("day").utc();
      }

      findQuery.transactionDate = {
        $gte: start,
        $lte: end,
      };
    }
    if (status && status !== "all") {
      findQuery.paymentStatus = status === "pending" ? "initialize" : status;
    }
    if (purpose && purpose !== "ALL") {
      findQuery.purpose = purpose === "TRANSIENT" ? "PARKING" : purpose;
    }
    console.log("findQuery ====>", findQuery);
    const transactions = await TransactionCollection.find(findQuery, {
      customerId: 1,
      placeId: 1,
      transactionId: 1,
      transactionDate: 1,
      licensePlate: 1,
      spaceNumber: 1,
      totalAmount: 1,
      baseRate: 1,
      tax: 1,
      cityTax: 1,
      countyTax: 1,
      serviceFee: 1,
      paymentGatewayFee: 1,
      ownerPayout: 1,
      isbpRevenue: 1,
      paymentGatewayFeePayBy: 1,
      paymentMethodType: 1,
      stripeCustomerId: 1,
      paymentMethodId: 1,
      paymentStatus: 1,
      purpose: 1,
      paymentInfo: 1,
      subscriptionNumber: 1,
      transientNumber: 1,
    }).populate("customerId placeId");

    let statistics = {};
    if (!isEmpty(transactions) && transactions.length > 0) {
      let totalRevenue = 0;
      let totalTax = 0;
      let totalCityTax = 0;
      let totalCountyTax = 0;
      let totalServiceFee = 0;
      let totalPaymentGatewayFee = 0;
      let totalOwnerPayout = 0;
      let totalIsbpRevenue = 0;
      let totalRefunds = 0;
      let totalPendingPayments = 0;
      let totalFailedPayments = 0;

      transactions.forEach((transaction) => {
        const {
          totalAmount,
          isbpRevenue,
          serviceFee,
          tax,
          cityTax,
          countyTax,
          ownerPayout,
          paymentGatewayFee,
          paymentStatus,
        } = transaction;

        if (paymentStatus !== "failed" && paymentStatus !== "refunded") {
          totalRevenue += totalAmount;
          totalIsbpRevenue += isbpRevenue;
          totalServiceFee += serviceFee;
          totalOwnerPayout += ownerPayout;
          totalPaymentGatewayFee += paymentGatewayFee;
          totalTax += tax;
          totalCityTax += cityTax;
          totalCountyTax += countyTax;
        }

        if (paymentStatus === "refunded") {
          totalRefunds += totalAmount;
        }
        if (paymentStatus === "initialize") {
          totalPendingPayments += totalAmount;
        }
        if (paymentStatus === "failed") {
          totalFailedPayments += totalAmount;
        }
      });

      statistics = {
        totalTax,
        totalCityTax,
        totalCountyTax,
        totalServiceFee,
        totalRevenue,
        totalOwnerPayout,
        totalIsbpRevenue,
        totalPaymentGatewayFee,
        totalRefunds,
        totalPendingPayments,
        totalFailedPayments,
      };
    }

    return res.status(http200).json({
      success: true,
      message: "Success",
      transactions,
      totalTransactions: transactions.length,
      transactionStatistics: statistics,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
