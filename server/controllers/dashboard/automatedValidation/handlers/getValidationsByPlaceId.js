const AutomatedValidations = require("../../../../models/automatedValidations");
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
    const validations = await AutomatedValidations.find({
      // userId: ObjectId(userId),
      placeId: ObjectId(placeId),
      status: { $ne: DOC_STATUS.DELETE },
    }).lean();
    return res.status(http200).json({
      success: true,
      message: "Success",
      validations,
      total: validations?.length || 0,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
