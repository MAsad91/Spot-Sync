const UserNotification = require("../../../models/userNotifications");
const {
  http200,
  http400,
  http403,
} = require("../../../global/errors/httpCodes");
const { NOTIFICATION_READSTATUS } = require("../../../constants");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

const event = require("../../../services/emitter");

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      userId,
      body: { notificationId }
    } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });

    let update = {};
    const filter = { _id: ObjectId(notificationId) };
    update["$set"] = { status: NOTIFICATION_READSTATUS.READ };
    const updateNotificationRead = await UserNotification.updateOne(filter, update);

    if (updateNotificationRead) {
      // event.emit("get_notification");
      return res.status(http200).json({
        success: true,
        message: "Notifications marked as read successfully.",
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
