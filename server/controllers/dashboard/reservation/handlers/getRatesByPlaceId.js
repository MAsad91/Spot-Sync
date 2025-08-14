const { http200, http400, http403 } = require("../../../../global/errors/httpCodes");
const { Types: { ObjectId }, isValidObjectId } = require("mongoose");

// Models
const Places = require("../../../../models/places");
const Rates = require("../../../../models/rates");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId, params } = req;
    const { placeId } = params;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(http403).json({ success, message: "Invalid Token" });
    }

    if (!placeId || !isValidObjectId(placeId)) {
      return res.status(http400).json({
        success,
        message: "Invalid placeId"
      });
    }

    // Verify user has access to this place
    const place = await Places.findOne({
      _id: new ObjectId(placeId),
      userId: new ObjectId(userId)
    });

    if (!place) {
      return res.status(http400).json({
        success,
        message: "Place not found or you don't have permission to access it"
      });
    }

    // Get all active rates for this place
    const rates = await Rates.find({
      placeId: new ObjectId(placeId),
      status: 10
    }).select({
      _id: 1,
      rateType: 1,
      displayName: 1,
      title: 1,
      amount: 1,
      hours: 1,
      timeType: 1,
      isFreeRate: 1,
      isPass: 1,
      isPermit: 1,
      gracePeriod: 1,
      startDay: 1,
      endDay: 1,
      startTime: 1,
      endTime: 1
    }).sort({ createdAt: -1 });

    return res.status(http200).json({
      success: true,
      message: "Rates retrieved successfully",
      data: rates
    });

  } catch (error) {
    console.error("Error getting rates:", error);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
}; 