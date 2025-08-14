const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PricingTierSchema = new Schema({
  subscriptionServiceFee: { type: Number, default: 0 },
  serviceFee: { type: Number, default: 0 },
  condition_on: { type: String },
  condition_operator: { type: String },
  condition_value: { type: Number },
  placeId: { type: Schema.Types.ObjectId, ref: "places" },
  creatorId: { type: Schema.Types.ObjectId, ref: "users" },
  status: { type: Number, default: 10 },
  default: { type: Boolean, default: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = PricingTier = mongoose.model(
  "pricingTiers",
  PricingTierSchema
);
