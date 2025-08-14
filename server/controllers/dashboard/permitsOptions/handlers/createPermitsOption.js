const {
  Types: { ObjectId },
} = require("mongoose");
const { http200, http400 } = require("../../../../global/errors/httpCodes");
const PermitsOptions = require("../../../../models/permitsOptions");

module.exports = async (req, res) => {
  try {
    const { userId, body } = req;
    const {
      placeId,
      type,
      customRateNames,
      customConfirmationMessage,
      displayUnitNumber,
    } = body;

    if (!userId || !ObjectId.isValid(userId)) throw new Error("Invalid Token");
    if (!placeId || !ObjectId.isValid(placeId))
      throw new Error("Invalid place Id");

    const existingPermitsOption = await PermitsOptions.findOne({
      placeId: ObjectId(placeId),
      type,
    });

    if (existingPermitsOption) {
      return res.status(http400).json({
        success: false,
        message: "Permits Option already exists",
      });
    }

    const permitsOption = await PermitsOptions.create({
      placeId: ObjectId(placeId),
      type,
      customRateNames,
      customConfirmationMessage,
      displayUnitNumber,
    });

    return res
      .status(http200)
      .json({
        success: true,
        message: "Permits Option created successfully",
        permitsOption: permitsOption,
      });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message ?? "Something went wrong!",
    });
  }
};
