const Places = require("../../../../models/places");
const ReservationCollection = require("../../../../models/reservations");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  isValidObjectId,
  Types: { ObjectId },
} = require("mongoose");
const moment = require("moment-timezone");

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
        message: "Invalid place Id",
      });

    const place = await Places.findById(placeId).populate("plivoId brandId");
    if (!place)
      return res.status(http400).json({
        success,
        message: "Place doesn't exist!",
      });
    const numberOfSpaces = place?.spaces;
    const currentUtcTime = moment().utc().toDate();
    const findQuery = {
      placeId: ObjectId(placeId),
      status: "success",
      startDate: { $lte: currentUtcTime },
      endDate: { $gte: currentUtcTime },
    };

    const activeReservations = await ReservationCollection.find(findQuery);

    // Calculate the total number of active license plates
    let activeLicensePlateCount = 0;
    activeReservations.forEach((reservation) => {
      if (Array.isArray(reservation.licensePlate)) {
        activeLicensePlateCount += reservation.licensePlate.length;
      }
    });

    let occupiedPercentage = 0;

    if (numberOfSpaces > 0) {
      occupiedPercentage = (activeLicensePlateCount / numberOfSpaces) * 100;
    }

    return res.status(http200).json({
      success: true,
      message: "Success",
      place: {
        ...place._doc,
        occupiedPercentage: occupiedPercentage.toFixed(2),
        activeLicensePlateCount,
      },
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
