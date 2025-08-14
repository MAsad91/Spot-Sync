const Brand = require("../../../../models/brands");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

module.exports = async (req, res) => {
  try {
    const {
      userId,
      params: { brandId },
      body: { receiptColor },
    } = req;
    console.log("receiptColor ===>",receiptColor)
    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(http403)
        .json({ success: false, message: "Invalid Token" });
    }
    if (!brandId || !isValidObjectId(brandId)) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid Request" });
    }
    const brandData = await Brand.findOne({
      _id: ObjectId(brandId),
    });
    if (!brandData) {
      return res.status(http400).json({
        success: false,
        message: "Brand not found",
      });
    }
    await Brand.updateOne(
      { _id: ObjectId(brandId) },
      {
        receiptColor,
      }
    );

    return res.status(http200).json({
      success: true,
      message: "Receipt color updated successfully.",
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
