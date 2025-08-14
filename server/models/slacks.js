const { Schema, model } = require("mongoose");

const SlackSchema = new Schema({
  placeId: { type: Schema.Types.ObjectId, ref: "places" },
  purpose: { type: String, required: true },
  workSpace: { type: String, required: true },
  channelName: { type: String, required: true },
  webhookURL: { type: String, required: true },
  status: { type: Number, default: 10 },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = Slack = model("slacks", SlackSchema);
