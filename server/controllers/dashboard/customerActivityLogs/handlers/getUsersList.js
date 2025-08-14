const CustomerActivityLogs = require("../../../../models/customerActivityLogs");
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
  let success = false;
  try {
    const {
      userId,
      query: { placeId },
    } = req;

    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    if (!placeId || !isValidObjectId(placeId))
      return res.status(http400).json({
        success,
        message: "Invalid place Id",
      });

    const customerActivityLogs = await CustomerActivityLogs.find({
      placeId: ObjectId(placeId),
    }).populate("customerId");

    return res.status(http200).json({
      success: true,
      message: "Success",
      customerActivityLogs,
      total: customerActivityLogs.length,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
