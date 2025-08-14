const { Schema, model } = require("mongoose");

const RawSubscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users" },
  placeId: { type: Schema.Types.ObjectId, ref: "places" },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, default: null },
  startDate: { type: Date },
  endDate: { type: Date },
  licensePlate: [
    {
      licensePlateNumber: { type: String },
      status: { type: Number, default: 10 },
    },
  ],
  isAutoRenew: { type: Boolean, default: false },
  isApplyTax: { type: Boolean, default: false },
  isApplyServiceFee: { type: Boolean, default: false },
  amount: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, default: 0 },
  status: { type: Number, default: 10 },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = RawSubscription = model(
  "RawSubscription",
  RawSubscriptionSchema
);
