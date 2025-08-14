const moment = require("moment-timezone");
const Reservations = require("../../models/reservations");
const Places = require("../../models/places");
const {
  Types: { ObjectId },
} = require("mongoose");

const ReservationRefundReport = async ({ placeIds, type }) => {
  try {
    const data = await Promise.all(
      placeIds.map(async (id) => {
        const placeData = await Places.findOne(
          { _id: ObjectId(id) },
          { timeZoneId: 1, lotName: 1, google: 1, parkingCode: 1, isPass: 1 }
        );
        const tz = placeData?.timeZoneId || "UTC";
        const isPass = placeData?.isPass || false;

        const today = moment.tz(tz);
        const startDate = today.clone().subtract(1, "day").startOf("day");
        const endDate = today.clone().subtract(1, "day").endOf("day");

        let findQuery = {
          placeId: ObjectId(id),
          status: "refunded",
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
          .populate({
            path: "paymentId",
            select: "transactionId transactionDate totalAmount",
          })
          .populate({
            path: "refundPayments",
            select: "transactionId transactionDate totalAmount",
          })
          .populate({
            path: "customerId",
            select: "lastName isEmailPrimary email mobile",
          });

        let processedResults = {
          placeData,
          startDate: startDate.format("MM/DD/YYYY"),
          endDate: endDate.format("MM/DD/YYYY"),
          totalRefund: reservationData.length,
          data: reservationData,
        };

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

module.exports = ReservationRefundReport;
