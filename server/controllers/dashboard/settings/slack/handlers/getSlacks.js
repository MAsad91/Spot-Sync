const Slacks = require("../../../../../models/slacks");

const {
  http200,
  http400,
  http403,
} = require("../../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

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

    const slacks = await Slacks.find({
      placeId: ObjectId(placeId),
      status: {$ne:0},
    }).lean();
    return res.status(http200).json({
      success: true,
      message: "Success",
      slacks,
      total: slacks?.length || 0,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
