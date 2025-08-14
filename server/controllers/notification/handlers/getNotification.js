const UserNotification = require("../../../models/userNotifications");
const {
  http200,
  http400,
  http403,
} = require("../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { NOTIFICATION_READSTATUS } = require("../../../constants");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });

    const notifications = await UserNotification.aggregate([
      {
        $match: {
          userId: ObjectId(userId),
          status: { $ne: NOTIFICATION_READSTATUS.DELETED }
        }
      },
      {
        $lookup: {
          from: "notifications",
          localField: "notificationId",
          foreignField: "_id",
          as: "notification"
        }
      },
      {
        $unwind: "$notification"
      },
      {
        $lookup: {
          from: "places",
          localField: "notification.placeId",
          foreignField: "_id",
          as: "place"
        }
      },
      {
        $unwind: "$place"
      },
      {
        $lookup: {
          from: "brands",
          localField: "place.brandId",
          foreignField: "_id",
          as: "brand"
        }
      },
      {
        $unwind: "$brand"
      },
      {
        $addFields: {
          "notification.brandName": "$brand.brandName",
          "notification.brandLogo": "$brand.brandLogo",
        }
      },
      {
        $project: {
          "notification": 1,
          "status": 1,
        }
      },
      {
        $sort: { "notification.createdAt": -1 }
      }
    ]);

    return res.status(http200).json({
      success: true,
      message: "Success",
      notifications,
      total: notifications?.length || 0,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
