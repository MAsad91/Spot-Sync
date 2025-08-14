const moment = require("moment");
const Reservations = require("../../models/reservations");
const { amountToShow } = require("../../global/functions");
const {
  Types: { ObjectId },
} = require("mongoose");
const { isEmpty } = require("lodash");

const ReservationWeeklyReport = async ({ placeId, tz }) => {
  try {
    const date = moment();
    let startDate = moment.tz(date, tz);
    let endDate = moment.tz(date, tz);

    startDate = moment(startDate).subtract(7, "day").startOf("day");
    endDate = moment(endDate).endOf("day");

    const start = moment(startDate).utc().toDate();
    const end = moment(endDate).utc().toDate();

    const result = await Reservations.aggregate([
      {
        $match: {
          placeId: ObjectId(placeId),
          startDate: { $gte: start, $lt: end },
        },
      },
      {
        $project: {
          rateId: 1,
          dayOfWeek: { $dayOfWeek: "$startDate" },
          totalAmount: "$totalAmount",
        },
      },
      {
        $lookup: {
          from: "rates",
          localField: "rateId",
          foreignField: "_id",
          as: "rateData",
        },
      },
      {
        $unwind: "$rateData",
      },
      {
        $group: {
          _id: {
            rateId: "$rateId",
            dayOfWeek: "$dayOfWeek",
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          rateData: { $first: "$rateData" },
        },
      },
      {
        $sort: { "_id.rateId": 1, "_id.dayOfWeek": 1 },
      },
    ]);

    const dayMap = {
      1: "Sunday",
      2: "Monday",
      3: "Tuesday",
      4: "Wednesday",
      5: "Thursday",
      6: "Friday",
      7: "Saturday",
    };

    const processedResults = result.reduce((acc, doc) => {
      const dayOfWeek = doc._id.dayOfWeek;
      const rateId = doc._id.rateId;
      const count = doc.count;
      const rateData = doc.rateData;
      const totalAmount = doc.totalAmount;
      const formattedDay = dayMap[dayOfWeek];

      let dayEntry = acc.find((entry) => entry.day === formattedDay);

      if (dayEntry) {
        dayEntry.data.push({
          rateId,
          count,
          displayName: rateData.displayName,
          totalAmount: `$${(totalAmount / 100).toFixed(2)}`,
        });
      } else {
        acc.push({
          day: formattedDay,
          data: [
            {
              rateId,
              count,
              displayName: rateData.displayName,
              totalAmount: `$${(totalAmount / 100).toFixed(2)}`,
            },
          ],
        });
      }

      return acc;
    }, []);

    const reservations = await Reservations.find({
      placeId: ObjectId(placeId),
      startDate: { $gte: start, $lt: end },
    });

    let statistics = {};
    if (!isEmpty(reservations) && reservations.length > 0) {
      let totalBaseRate = 0;
      let totalRevenue = 0;
      let totalTax = 0;
      let totalServiceFee = 0;
      let totalPaymentGatewayFee = 0;
      let totalOwnerPayout = 0;
      let totalIsbpRevenue = 0;
      let totalRefunds = 0;
      let totalPendingPayments = 0;
      let totalFailedPayments = 0;

      reservations.forEach((reservation) => {
        const {
          totalAmount,
          isbpRevenue,
          serviceFee,
          tax,
          ownerPayout,
          paymentGatewayFee,
          baseRate,
        } = reservation;
        totalTax += tax;
        totalServiceFee += serviceFee;
        totalOwnerPayout += ownerPayout;
        totalIsbpRevenue += isbpRevenue;
        totalPaymentGatewayFee += paymentGatewayFee;
        if (reservation.status === "success") {
          totalRevenue += totalAmount;
          totalBaseRate += baseRate;
        }
        if (reservation.status === "refunded") {
          totalRefunds += totalAmount;
        }
        if (reservation.status === "initialize") {
          totalPendingPayments += totalAmount;
        }
        if (reservation.status === "failed") {
          totalFailedPayments += totalAmount;
        }
      });
      statistics = {
        totalBaseRate: amountToShow(totalBaseRate),
        totalTax: amountToShow(totalTax),
        totalServiceFee: amountToShow(totalServiceFee),
        totalRevenue: amountToShow(totalRevenue),
        totalOwnerPayout: amountToShow(totalOwnerPayout),
        totalIsbpRevenue: amountToShow(totalIsbpRevenue),
        totalPaymentGatewayFee: amountToShow(totalPaymentGatewayFee),
        totalRefunds: amountToShow(totalRefunds),
        totalPendingPayments: amountToShow(totalPendingPayments),
        totalFailedPayments: amountToShow(totalFailedPayments),
      };
    }

    console.log("statistics ===>", statistics);
    return {
      success: true,
      result: processedResults,
      statistics,
    };
  } catch (error) {
    console.log("error ===>", error);
    return {
      success: false,
      message: error?.message || "Something went wrong!",
    };
  }
};

module.exports = ReservationWeeklyReport;
