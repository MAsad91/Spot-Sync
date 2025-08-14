const { http200, http400, http401 } = require("../../../global/errors/httpCodes");
const moment = require("moment");
const {
  Types: { ObjectId },
} = require("mongoose");
const Reservation = require("../../../models/reservations");

PLACE_ID = '66f41ecb86435e2b57b77957';
BRAND_ID = '666348bd0091a103649ea52b';

module.exports = async (req, res) => {
  try {
    const { body, headers } = req;

    if (headers.authorization !== process.env.SPOTSYNC_TOKEN) {
      console.log("UnAuthorized!");
      return res.status(http401).json({
        success: false,
        message: "UnAuthorized!",
      });
    }

    const { reservation } = body;

    if (!reservation) {
      console.log("Reservation data is required!");
      return res.status(http400).json({
        success: false,
        message: "Reservation data is required!",
      });
    }

    if (reservation.placeId !== '65a024373e8846beef8082e9') {
      console.log("PlaceId is not valid");
      return res.status(http400).json({
        success: false,
        message: "PlaceId is not valid"
      });
    }

    // Create Reservation object and save it to the database
    let reservationObject = {
      purpose: "PARKING",
      licensePlate: [reservation.licensePlate],
      placeId: ObjectId(PLACE_ID),
      brandId: ObjectId(BRAND_ID),
      startDate: reservation.availability?.startDate,
      endDate: reservation.availability?.endDate,
    };

    await Reservation.create(reservationObject);

    return res.status(http200).json({
      success: true,
      message: "successfully!",
    });
  } catch (error) {
    console.log("Error:", error.message);
    console.log("Error.stack:", error.stack);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
