const { Schema, model } = require("mongoose");
const { rupeesToPKR } = require("../global/functions");

const RateSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users" },
  placeId: { type: Schema.Types.ObjectId, ref: "places" },
  rateType: { type: String, required: true },
  displayName: { type: String },
  timeType: { type: String },
  title: { type: String },
  triggerName: { type: String },
  amount: { type: Number, default: 0 },
  minimumAmount: { type: Number, default: 0 },
  endDay: { type: String, default: null },
  endTime: { type: String, default: null },
  startDay: { type: String, default: null },
  startTime: { type: String, default: null },
  hours: { type: Number, default: null },
  gracePeriod: { type: Number, default: null },
  status: { type: Number, default: 10 },
  hourUnit: { type: String, default: "HOURS" },
  isValidationCodeRequired: { type: Boolean, default: false },
  secondStepValidation: { type: Boolean, default: false },
  payNowValidationLaterFlow: { type: Boolean, default: false },
  isRateOption: { type: Boolean, default: false },
  isFreeRate: { type: Boolean, default: false },
  isPermit: { type: Boolean, default: false },
  isPass: { type: Boolean, default: false },
  isCustomSubscription: { type: Boolean, default: false },
  rates: [
    {
      _id: { type: Schema.Types.ObjectId, ref: "rates" },
      displayName: { type: String },
      rateType: { type: String },
      amount: { type: Number },
    },
  ],
  customStartDate: { type: Date, default: null },
  customEndDate: { type: Date, default: null },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

RateSchema.pre("save", function (next) {
  if (this.isModified("amount") || this.isNew) {
    this.amount = rupeesToPKR(this.amount);
  }
  if (this.isModified("minimumAmount") || this.isNew) {
    this.minimumAmount = rupeesToPKR(this.minimumAmount);
  }

  next();
});

module.exports = Rates = model("rates", RateSchema);
