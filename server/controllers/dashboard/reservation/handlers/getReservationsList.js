const Reservations = require("../../../../models/reservations");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const moment = require("moment");

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      userId,
      body: {
        placeId,
        search,
        startDate,
        endDate,
        status,
        pageNo,
        limit = 25,
        tz,
      },
    } = req;

    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({ success, message: "Invalid Token" });

    if (!placeId || !isValidObjectId(placeId))
      return res.status(http403).json({ success, message: "Invalid request" });

    let matchQuery = {
      status: { $ne: "delete" },
      purpose: "PARKING",
      placeId: ObjectId(placeId),
    };

    if (status !== "all") {
      matchQuery.status = status;
    }

    let pipeline
    if (search && search !== "") {
      const upperSearch = search.toUpperCase();
      pipeline = [
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customerId",
          },
        },
        {
          $unwind: "$customerId",
        },
        {
          $lookup: {
            from: "payments",
            localField: "paymentId",
            foreignField: "_id",
            as: "paymentId",
          },
        },
        {
          $unwind: "$paymentId",
        },
        {
          $lookup: {
            from: "places",
            localField: "placeId",
            foreignField: "_id",
            as: "placeId",
          },
        },
        {
          $unwind: "$placeId",
        },
        {
          $lookup: {
            from: "rates",
            localField: "rateId",
            foreignField: "_id",
            as: "rateId",
          },
        },
        {
          $unwind: "$rateId",
        },
        {
          $match: {
            $or: [
              { transientNumber: { $regex: upperSearch, $options: "i" } },
              {
                licensePlate: {
                  $elemMatch: { $regex: upperSearch, $options: "i" },
                },
              },
              { "paymentId.paymentInfo.id": { $regex: search, $options: "i" } },
              {
                "customerId.mobile": { $regex: search, $options: "i" },
              },
              {
                "customerId.secondaryMobile": { $regex: search, $options: "i" },
              },
              {
                "rateId.displayName": { $regex: search.replace(/\$/g, '\\$'), $options: "i" },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "reservations",
            localField: "parentReservationId",
            foreignField: "_id",
            as: "parentReservationId",
          },
        },
        {
          $unwind: {
            path: "$parentReservationId",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $sort: { _id: -1 },
        },
        {
          $skip: (pageNo * limit),
        },
        {
          $limit: limit,
        },
      ];
    }

    if (startDate && endDate) {
      const start = moment.tz(startDate, tz).startOf("day").utc();
      const end = moment.tz(endDate, tz).endOf("day").utc();
      matchQuery.$and = [
        { startDate: { $gte: start } },
        { startDate: { $lte: end } },
      ];
    }
    let totalReservations
    let reservations
    if (search && search !== "") {
      reservations = await Reservations.aggregate(pipeline);
      totalReservations = reservations.length
    } else {
      [totalReservations, reservations] = await Promise.all([
        Reservations.countDocuments(matchQuery),
        Reservations.find(matchQuery)
          .populate("customerId paymentId placeId rateId parentReservationId")
          .sort({ _id: -1 })
          .skip((pageNo) * limit)
          .limit(limit),
      ]);
    }
    return res.status(http200).json({
      success: true,
      message: "Success",
      reservations,
      total: totalReservations,
      currentPage: pageNo,
      totalPages: Math.ceil(totalReservations / limit),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(http400)
      .json({ success, message: error?.message || "Something went wrong!" });
  }
};
