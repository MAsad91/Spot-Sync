const Brands = require("../../../../models/brands");
const Roles = require("../../../../models/roles");
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
      body: { brandId },
    } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    let update = {};
    const userRole = await Roles.findOne({ userId: ObjectId(userId) });
    const filter = { _id: ObjectId(brandId) };
    if (userRole?.level !== 100) {
      filter = {
        userId: ObjectId(userId),
      };
    }
    update["$set"] = { status:  DOC_STATUS.DELETE };
    const updateBrand = await Brands.updateOne(filter, update);
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
