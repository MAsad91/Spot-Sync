const CustomerActivityLogs = require("../../../../models/customerActivityLogs");
const ActivityLogs = require("../../../../models/activityLogs");
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
      params: { customerActivityLogId },
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
    if (!customerActivityLogId || !isValidObjectId(customerActivityLogId))
      return res.status(http400).json({
        success,
        message: "Invalid Log Id",
      });

    const activityLogs = await CustomerActivityLogs.aggregate([
      {
        $match: {
          _id: ObjectId(customerActivityLogId)
        }
      },
      {
        $lookup: {
          from: "activitylogs", // The name of the ActivityLogs collection
          localField: "fingerprint", // Field in CustomerActivityLogs
          foreignField: "fingerprint", // Field in ActivityLogs
          as: "activityLogDetails"
        }
      },
      {
        $unwind: "$activityLogDetails"
      },
      {
        $match: {
          "activityLogDetails.placeId": ObjectId(placeId)
        }
      },
      {
        $replaceRoot: {
          newRoot: "$activityLogDetails"
        }
      }
    ])

    return res.status(http200).json({
      success: true,
      message: "Success",
      activityLogs,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
