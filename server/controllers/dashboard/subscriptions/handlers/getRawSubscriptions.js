const {
  isValidObjectId,
  Types: { ObjectId },
} = require("mongoose");
const {
  http200,
  http400,
  http401,
} = require("../../../../global/errors/httpCodes");
const RawSubscription = require("../../../../models/rawSubscriptions");

module.exports = async (req, res) => {
  try {
    const { userId, params: {placeId} } = req;

    if (!userId || !isValidObjectId(userId))
      return res
        .status(http401)
        .json({ success: false, message: "Invalid Token" });

    if (!placeId || !isValidObjectId(placeId))
      return res
        .status(http401)
        .json({ success: false, message: "Invalid request" });

    const subscriptions = await RawSubscription.find({
      userId: ObjectId(userId),
      placeId: ObjectId(placeId)
    }).lean()

    return res
      .status(http200)
      .json({ 
        success: true,
        message: "Fetched raw subscription data successfully",
        subscriptions
      });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message ?? "Something went wrong!",
    });
  }
};
