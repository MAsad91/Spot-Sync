const Permit = require("../../../../models/permits");
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
      params: { permitId },
    } = req;

    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });

    const permitData = await Permit.findOne({ _id: ObjectId(permitId) });
    if (!permitData) {
      return res.status(http400).json({
        success,
        message: "Invalid Permit",
      });
    }
    
    await Permit.updateOne({ _id: ObjectId(permitId) }, { $set: { status: "deleted" } });

    return res.status(http200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
