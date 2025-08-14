const PricingTier = require("../../../../models/pricingTiers");
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
const { get } = require("lodash");
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
        message: "Invalid request",
      });
    const subscriptionFee = await PricingTier.findOne(
      {
        placeId: ObjectId(placeId),
        default: true,
        status: { $ne: DOC_STATUS.DELETE },
      },
      { subscriptionServiceFee: 1 }
    );

    return res.status(http200).json({
      success: true,
      message: "Success",
      subscriptionFee: get(subscriptionFee, "subscriptionServiceFee", 0),
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
