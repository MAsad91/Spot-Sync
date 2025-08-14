const { http200, http400 } = require("../../../../global/errors/httpCodes");
const { uploadFile } = require("../../../../services/fileUpload");
const {
  isValidObjectId,
  Types: { ObjectId },
} = require("mongoose");
const { get } = require("lodash");
const path = require("path");
const Brand = require("../../../../models/brands");
module.exports = async (req, res) => {
  try {
    const success = false;
    const {
      body: { file, brandId },
    } = req;

    console.log("body ---->", req.body);
    if (!brandId || !isValidObjectId(brandId))
      return res.status(http400).json({
        success,
        message: "Invalid brandId",
      });
    if (!file) {
      return res.status(http400).json({
        success,
        message: "Brand Image required!",
      });
    }
    const fileData = await uploadFile(file, path?.extname(file?.path), true);
    const imageURL = get(fileData, "url", false);
    if (!imageURL) {
      return res.status(http400).json({
        success,
        message: "Something went wrong!",
      });
    }

    const updateBrand = await Brand.findOneAndUpdate(
      {
        _id: ObjectId(brandId),
      },
      { $set: { brandLogo: imageURL } },
      { new: true }
    );
    return res.status(http200).json({
      success: true,
      message: "Success!",
      brandLogo: updateBrand.brandLogo,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
