const Plivos = require("../../../../../models/plivos");

const {
  http200,
  http400,
  http403,
} = require("../../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { DOC_STATUS } = require("../../../../../constants");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    const plivos = await Plivos.find({ status: DOC_STATUS.ACTIVE }).lean();
    return res.status(http200).json({
      success: true,
      message: "Success",
      plivos,
      total: plivos?.length || 0,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
