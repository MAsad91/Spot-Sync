const Rates = require("../../../../models/rates");
const Places = require("../../../../models/places");
const Brands = require("../../../../models/brands");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { API_TYPES_ENUM, API_TYPES } = require("../../../../global/types");
const event = require("../../../../services/emitter");

module.exports = async (req, res) => {
  let success = false;
  let update = {};
  try {
    const {
      userId,
      params: { rateId },
      body,
    } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });

    if (!rateId || !isValidObjectId(rateId))
      return res.status(http403).json({
        success,
        message: "Invalid rateId",
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

    const filter = { _id: ObjectId(rateId), userId: userId };
    update = API_TYPES[type](rest);

    const updatedRate = await Rates.updateOne(filter, update);
    const ratesData = await Rates.findOne(filter);
    const placeData = await Places.findOne({ _id: ratesData?.placeId });
    const brandData = await Brands.findOne({
      userId: ObjectId(placeData.userId),
    });

    event.emit("notification", {
      userId: userId,
      title: "Rates Updated!",
      message: `${
        brandData?.brandName ? brandData?.brandName : "Super Admin"
      } updated rate, rate name ${ratesData?.displayName} on place ${
        placeData?.google?.name
      }`,
      placeId: placeData?._id,
      brandName: brandData?.shortBrandName,
      brandLogo: brandData?.brandLogo,
    });

    if (updatedRate.nModified === 0)
      return res.status(http200).json({
        success,
        message: "Rates already updated!",
      });

    return res.status(http200).json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
