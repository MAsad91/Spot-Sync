const pricingTiers = require("../../../../models/pricingTiers");
const Places = require("../../../../models/places");
const Brands = require("../../../../models/brands");
const event = require("../../../../services/emitter");
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
// const { API_TYPES, API_TYPES_ENUM } = require("../placeConstants");

module.exports = async (req, res) => {
  let success = false;
  let update = {};
  try {
    const {
      userId,
      params: { pricingId },
      body,
    } = req;
    // console.log("body ===>", body);
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    if (!pricingId || !isValidObjectId(pricingId))
      return res.status(http403).json({
        success,
        message: "Invalid pricing Id",
      });

    const filter = { _id: ObjectId(pricingId) };
    update = {
      $set: body,
    };

    const updatedPricing = await pricingTiers.updateOne(filter, update);

    if (updatedPricing.nModified === 0)
      return res.status(http200).json({
        success,
        message: "Pricing already updated!",
      });

    const pricingData = await pricingTiers.findOne(filter);
    const placeData = await Places.findOne({ _id: pricingData?.placeId });
    const brandData = await Brands.findOne({
      userId: userId,
    });

    event.emit("notification", {
      userId: userId,
      title: "Pricing Tier updated!",
      message: `${
        brandData?.brandName ? brandData?.brandName : "Super Admin"
      } update pricing tier on place ${placeData?.google?.name} `,
      placeId: placeData?._id,
      brandName: brandData?.shortBrandName,
      brandLogo: brandData?.brandLogo,
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
