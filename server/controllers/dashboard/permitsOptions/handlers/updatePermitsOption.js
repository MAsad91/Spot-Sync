const {
  Types: { ObjectId },
} = require("mongoose");
const { http200, http400 } = require("../../../../global/errors/httpCodes");
const PermitsOptions = require("../../../../models/permitsOptions");

module.exports = async (req, res) => {
  try {
    const { userId, body } = req;
    const {
      id,
      customRates,
      customConfirmationMessage,
      displayUnitNumber,
    } = body;

    if (!userId || !ObjectId.isValid(userId)) throw new Error("Invalid Token");
    if (!id || !ObjectId.isValid(id))
      throw new Error("Invalid object Id");

    const permitsOption = await PermitsOptions.findByIdAndUpdate(id, {
      $set: {
        customRates,
        customConfirmationMessage,
        displayUnitNumber,
      }},
      { new: true } // to return the updated document
    ).populate("customRates");

    console.log("permitsOption ====>", permitsOption);

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
