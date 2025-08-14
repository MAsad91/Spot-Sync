const moment = require("moment-timezone");
const Reservations = require("../../models/reservations");
const Places = require("../../models/places");
const {
  Types: { ObjectId },
} = require("mongoose");
const { get } = require("lodash");

const ReservationReportNew = async ({ placeIds, type }) => {
  try {
    // const date = moment();
    // let startDate = date.clone();
    // let endDate = date.clone();

    // switch (type) {
    //   case "daily":
    //     startDate = startDate.subtract(1, "day").startOf("day");
    //     endDate = endDate.subtract(1, "day").endOf("day");
    //     break;
    //   case "weekly":
    //     startDate = startDate.subtract(7, "day").startOf("day");
    //     endDate = endDate.endOf("day");
    //     break;
    //   case "monthly":
    //     startDate = startDate.subtract(1, "month").startOf("month");
    //     endDate = endDate.subtract(1, "month").endOf("month");
    //     break;
    // }
    const reservations = [];

    const data = await Promise.all(
      placeIds.map(async (id) => {
        const placeData = await Places.findOne(
          { _id: ObjectId(id), status: 10 },
          { timeZoneId: 1, lotName: 1, google: 1, parkingCode: 1, isPass: 1 }
        );
        if (!placeData) {
          return null;
        }
        const tz = placeData?.timeZoneId || "UTC";
        const isPass = placeData?.isPass || false;

        const today = moment.tz(tz);
        const startDate = today.clone().subtract(1, "day").startOf("day");
        const endDate = today.clone().subtract(1, "day").endOf("day");

        let findQuery = {
          placeId: ObjectId(id),
          status: "success",
        };

        if (isPass) {
          findQuery.transactionDate = { $gte: startDate, $lte: endDate };
        } else {
          findQuery.startDate = { $gte: startDate, $lte: endDate };
        }

        const reservationData = await Reservations.find(findQuery)
          .populate({
            path: "placeId",
            select:
              "_id parkingCode google.formatted_address lotName timeZoneId",
          })
          .populate("rateId");
        reservations.push(...reservationData);

        let processedResults = {
          placeData,
          startDate: startDate.format("MM/DD/YYYY"),
          endDate: endDate.format("MM/DD/YYYY"),
          total: 0,
          serviceFee: 0,
          totals: {},
          sums: {},
          totalReservation: 0,
          data: [],
        };

        let hourlyData = {};
        for (let i = 0; i < 24; i++) {
          const hour = moment().startOf("day").add(i, "hours").format("HH:00");
          hourlyData[hour] = {
            time: hour,
            totalCount: 0,
            totalRevenue: 0,
            totalServiceFee: 0,
            percentage: 0,
            rates: {},
            revenuePercent: 0,
          };
        }

        reservationData.map((reservation) => {
          const {
            rateId,
            baseRate,
            totalAmount,
            serviceFee,
            startDate,
            transactionDate,
          } = reservation;
          const noOfPasses = get(reservation, "noOfPasses", 1);
          const rateDisplayName = rateId.displayName;
          const amount = baseRate;
          const totalSum = amount;

          if (!processedResults.totals[rateDisplayName]) {
            processedResults.totals[rateDisplayName] = {
              count: 0,
              amount,
              totalSum: 0,
            };
            processedResults.sums[rateDisplayName] = 0;
          }
          processedResults.totalReservation += noOfPasses;
          processedResults.totals[rateDisplayName].count += isPass
            ? noOfPasses
            : 1;
          processedResults.totals[rateDisplayName].totalSum += totalSum;
          processedResults.sums[rateDisplayName] += totalSum;

          processedResults.total += totalAmount;
          processedResults.serviceFee += serviceFee;
          const date = isPass ? transactionDate : startDate;
          const reservationHour = moment.tz(date, tz).format("HH:00");

          if (!hourlyData[reservationHour].rates[rateDisplayName]) {
            hourlyData[reservationHour].rates[rateDisplayName] = {
              count: 0,
              amount,
            };
          }

          hourlyData[reservationHour].totalCount += isPass ? noOfPasses : 1;
          hourlyData[reservationHour].totalRevenue += totalAmount;
          hourlyData[reservationHour].totalServiceFee += serviceFee;
          hourlyData[reservationHour].rates[rateDisplayName].count += isPass
            ? noOfPasses
            : 1;

          hourlyData[reservationHour].revenuePercent = (
            (hourlyData[reservationHour].totalRevenue /
              processedResults.total) *
            100
          ).toFixed(2);
        });

        Object.keys(hourlyData).forEach((hour) => {
          const hourlyRevenue = hourlyData[hour].totalRevenue;
          hourlyData[hour].percentage = (
            (hourlyRevenue / processedResults.total) *
            100
          ).toFixed(2);

          processedResults.data.push(hourlyData[hour]);
        });

        return processedResults;
      })
    );

    return {
      success: true,
      result: data,
    };
  } catch (error) {
    console.log("error ===>", error);
    return {
      success: false,
      message: error?.message || "Something went wrong!",
    };
  }
};

module.exports = ReservationReportNew;
