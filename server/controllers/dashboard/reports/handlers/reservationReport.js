const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

const ReservationCollection = require("../../../../models/reservations");
const moment = require("moment");
const { isEmpty } = require("lodash");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId, body } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });

    const {
      placeId,
      purpose,
      startDate,
      endDate,
      status,
      tz,
      rateIds,
      validationCodes,
    } = body;
    let findQuery = {
      purpose,
    };
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
    if (status !== "all") {
      findQuery.status = status === "payment pending" ? "initialize" : status;
    }

    if (!isEmpty(rateIds)) {
      findQuery.rateId = { $in: rateIds };
    }
    if (!isEmpty(validationCodes)) {
      findQuery.validationId = { $in: validationCodes };
    }

    const reservations = await ReservationCollection.find(findQuery, {
      transientNumber: 1,
      startDate: 1,
      endDate: 1,
      placeId: 1,
      rateId: 1,
      customerId: 1,
      isValidationApplied: 1,
      validationCode: 1,
      discountPercentage: 1,
      status: 1,
      paymentMethodType: 1,
      spaceNumber: 1,
      licensePlate: 1,
      receiptURL: 1,
      isExtendReminderSend: 1,
      isExtend: 1,
      transactionDate: 1,
      transactionId: 1,
      totalAmount: 1
    }).populate("placeId customerId rateId");
    let statistics = {};
    if (!isEmpty(reservations) && reservations.length > 0) {
      let totalReservations = 0;
      let totalPaid = 0;
      let totalFailed = 0;
      let totalRefunded = 0;
      totalReservations = reservations.length;
      reservations.forEach((reservation) => {
        const { status } = reservation;
        if (status === "success") {
          totalPaid += 1;
        } else if (status === "failed") {
          totalFailed += 1;
        } else if (status === "refunded") {
          totalRefunded += 1;
        }
      });
      statistics = {
        totalReservations,
        totalPaid,
        totalFailed,
        totalRefunded,
      };
    }

    return res.status(http200).json({
      success: true,
      message: "Success",
      reservations,
      totalReservations: reservations.length,
      reservationStatistics: statistics,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
