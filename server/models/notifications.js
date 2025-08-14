const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  title: { type: String },
  content: { type: String },
  linkOut: { type: String },
  type: { type: String, default: "info" }, // info, request, error
  placeId: { type: Schema.Types.ObjectId, ref: "places" },
  notificationScope: { type: String, default: "all" }, // all, admin, superAdmin
}, { timestamps: true });

module.exports = Notification = mongoose.model(
  "notifications",
  NotificationSchema
);
