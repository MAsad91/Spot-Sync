const { Schema, model } = require("mongoose");

const schema = new Schema({
  placeId: { type: Schema.Types.ObjectId, ref: "places", index: true },
  rateId: { type: Schema.Types.ObjectId, ref: "rates", index: true },
  extendedFor: { type: Schema.Types.ObjectId, ref: "rates", index: true },
  startTime: { type: String, default: null },
  endTime: { type: String, default: null },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  message: { type: String, default: null },
  day: { type: String, default: null },
  status: { type: Number, default: 10, index: true },
  isExtensionRate: { type: Boolean, default: false },
  isExtensionBasedRate: { type: Boolean, default: false },
  isHideFromSuggestions: { type: Boolean, default: false },
  isSpecialEvent: { type: Boolean, default: false },
  isBlackout: { type: Boolean, default: false },
  occupancy: { type: Number, default: 0 },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = AssignRates = model("assignRates", schema);
