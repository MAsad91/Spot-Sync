const moment = require("moment");
const Reservations = require("../../models/reservations");
const Places = require("../../models/places"); // Import the Place model
const { amountToShow } = require("../../global/functions");
const {
  Types: { ObjectId },
} = require("mongoose");
const { isEmpty } = require("lodash");

const ReservationReport = async ({ placeId, type, tz }) => {
  try {
    const date = moment();
    let startDate = moment.tz(date, tz);
    let endDate = moment.tz(date, tz);
    switch (type) {
      case "daily":
        startDate = moment(startDate).subtract(1, "day").startOf("day");
        endDate = moment(endDate).subtract(1, "day").endOf("day");
        break;
      case "weekly":
        startDate = moment(startDate).subtract(7, "day").startOf("day");
        endDate = moment(endDate).endOf("day");
        break;
      case "monthly":
        startDate = moment(startDate).subtract(1, "month").startOf("month");
        endDate = moment(endDate).subtract(1, "month").endOf("month");
        break;
    }

    const start = moment(startDate).utc().toDate();
    const end = moment(endDate).utc().toDate();

    const formatHour = (dateStr) => {
      const date = new Date(dateStr);
      return moment(date).format("HH:00");
    };

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
          hour: {
            $dateToString: {
              format: "%Y-%m-%dT%H:00:00Z",
              date: "$startDate",
            },
          },
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
            hour: "$hour",
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          rateData: { $first: "$rateData" },
        },
      },
      {
        $sort: { "_id.hour": 1 }, 
      },
    ]);

    const processedResults = [];

    for (let i = 0; i < 24; i++) {
      const hourStr = moment({ hour: i }).format("HH:00");
      const hourData = result.filter(doc => formatHour(doc._id.hour) === hourStr);
      const data = hourData.map(doc => ({
        rateId: doc._id.rateId,
        count: doc.count,
        displayName: doc.rateData.displayName,
        totalAmount: `$${(doc.totalAmount / 100).toFixed(2)}`,
      }));

      processedResults.push({
        hour: hourStr,
        data,
      });
    }

    return {
      success: true,
      result: processedResults,
    };
  } catch (error) {
    console.log("error ===>", error);
    return {
      success: false,
      message: error?.message || "Something went wrong!",
    };
  }
};

module.exports = ReservationReport;
