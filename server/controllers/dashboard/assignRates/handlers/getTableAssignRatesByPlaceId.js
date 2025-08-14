const AssignRates = require("../../../../models/assignRates");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  isValidObjectId,
  Types: { ObjectId },
} = require("mongoose");
const { DOC_STATUS } = require("../../../../constants");

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      userId,
      params: { placeId },
    } = req;

    // Validate userId
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });

    // Validate placeId
    if (!placeId || !isValidObjectId(placeId))
      return res.status(http403).json({
        success,
        message: "Invalid place Id",
      });

    // Aggregation pipeline
    const assignRates = await AssignRates.aggregate([
      // Match active rates for the given placeId
      {
        $match: {
          placeId: ObjectId(placeId),
          status: DOC_STATUS.ACTIVE,
        },
      },
      // Lookup for the main rate
      {
        $lookup: {
          from: "rates",
          let: { rateId: "$rateId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$rateId"] },
              },
            },
          ],
          as: "rate",
        },
      },
      // Unwind main rate
      {
        $unwind: {
          path: "$rate",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup for the extended rate
      {
        $lookup: {
          from: "rates",
          let: { extendedFor: "$extendedFor" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$extendedFor"] },
              },
            },
          ],
          as: "extendedRate",
        },
      },
      // Unwind extended rate
      {
        $unwind: {
          path: "$extendedRate",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Project the required fields
      {
        $project: {
          _id: 1,
          startTime: 1,
          endTime: 1,
          startDate: 1,
          endDate: 1,
          message: 1,
          day: 1,
          placeId: 1,
          rateId: 1,
          extendedFor: 1, // Include the original field for debugging if needed
          "rate.rateType": 1,
          "rate.title": 1,
          "rate.displayName": 1,
          "rate.amount": 1,
          "rate.hours": 1,
          "extendedRate.rateType": 1,
          "extendedRate.title": 1,
          "extendedRate.displayName": 1,
          "extendedRate.amount": 1,
          "extendedRate.hours": 1,
          isBlackout: 1,
          isSpecialEvent: 1,
          isExtensionRate: 1,
          occupancy: 1,
          isExtensionBasedRate: 1,
        },
      },
    ]);

    // Return success response
    return res.status(http200).json({
      success: true,
      message: "Success",
      assignRates,
    });
  } catch (error) {
    // Return error response
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
