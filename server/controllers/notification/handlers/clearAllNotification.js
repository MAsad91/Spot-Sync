const UserNotification = require("../../../models/userNotifications");
const {
  http200,
  http400,
  http403,
} = require("../../../global/errors/httpCodes");
const { NOTIFICATION_READSTATUS } = require('../../../constants')

const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

const event = require("../../../services/emitter");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    const updateNotificationStatus = await UserNotification.updateMany(
      { userId: ObjectId(userId) },
      { $set: { status: NOTIFICATION_READSTATUS.DELETED } }
    );

    if (updateNotificationStatus.nModified > 0) {
      event.emit("get_notification");
      return res.status(http200).json({
        success: true,
        message: "Notifications cleared successfully.",
      });
    } else {
      console.log("No notifications found to update.");
      return res.status(http200).json({
        success: true,
        message: "No notifications needed for read .",
      });
    }
  } catch (error) {
    console.error("Error updating notifications:", error);
    return res.status(http400).json({
      success: false,
      message: "Error updating notifications.",
    });
  }
};
