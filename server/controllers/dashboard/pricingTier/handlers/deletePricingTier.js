const PricingTier = require("../../../../models/pricingTiers");
const Places = require("../../../../models/places");
const Brands = require("../../../../models/brands");
const event = require("../../../../services/emitter");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { DOC_STATUS } = require("../../../../constants");

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      userId,
      body: { pricingId },
    } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    let update = {};
    const filter = { _id: ObjectId(pricingId) };
    update["$set"] = { status: DOC_STATUS.DELETE };
    const updatePricing = await PricingTier.updateOne(filter, update);

    const pricingData = await PricingTier.findOne(filter);
    const placeData = await Places.findOne({ _id: pricingData?.placeId });
    const brandData = await Brands.findOne({
      userId: userId,
    });

    event.emit("notification", {
      userId: userId,
      title: "Pricing tier Deleted!",
      message: `${
        brandData?.brandName ? brandData?.brandName : "Super Admin"
      } delete pricing tier on place ${placeData?.google?.name} `,
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
