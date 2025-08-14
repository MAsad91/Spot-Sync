const Places = require("../../../../models/places");
const {
  http200,
  http400,
  http401,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { API_TYPES, API_TYPES_ENUM } = require("../placeConstants");

module.exports = async (req, res) => {
  let success = false;
  let update = {};
  try {
    const {
      userId,
      params: { placeId },
      body,
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

    if (!body?.type)
      return res.status(http400).json({
        success,
        message: "type required!",
      });

    let { type, ...rest } = body;
    type = String(type).toUpperCase();

    if (!API_TYPES_ENUM.includes(type))
      return res.status(http400).json({
        success,
        message: "Invalid request type!",
      });

    if (rest?.parkingCode) {
      const isParkingCodeExists = await Places.findOne({
        parkingCode: rest?.parkingCode,
        _id: { $ne: ObjectId(placeId) },
      }).lean();
      if (isParkingCodeExists)
        return res.status(http400).json({
          success,
          message: "Parking code must be unique.",
        });
    }

    let filter = { _id: ObjectId(placeId) };
    update = API_TYPES[type](rest);

    const updatedPlace = await Places.updateOne(filter, update);

    if (updatedPlace.nModified === 0)
      return res.status(http200).json({
        success,
        message: "Place already updated!",
      });

    const updatedPlaceData = await Places.findOne({ _id: ObjectId(placeId) });
    return res.status(http200).json({
      success: true,
      message: "Updated successfully",
      updatedPlaceData: updatedPlaceData,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
