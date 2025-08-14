const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserNotificationSchema = new Schema({
  placeId: { type: Schema.Types.ObjectId, ref: "places" },
  userId: { type: Schema.Types.ObjectId, ref: "users" },
  notificationId: { type: Schema.Types.ObjectId, ref: "notifications" },
  status: { type: String, default: "unseen" }, // unseen, seen, read, deleted
}, { timestamps: true });

module.exports = UserNotification = mongoose.model(
  "userNotifications",
  UserNotificationSchema
);
