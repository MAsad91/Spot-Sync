const PricingTiers = require("../../../../models/pricingTiers");
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
const { some } = require("lodash");
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
    const pricingTiers = await PricingTiers.find({
      placeId: ObjectId(placeId),
      status: { $ne: DOC_STATUS.DELETE },
    }).lean();
    let defaultAvailable = false;
    if (pricingTiers.length > 0) {
      defaultAvailable = some(pricingTiers, { default: true });
    }
    return res.status(http200).json({
      success: true,
      message: "Success",
      pricingTiers,
      total: pricingTiers?.length || 0,
      defaultAvailable,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
