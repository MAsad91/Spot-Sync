const { Schema, model } = require("mongoose");

const automatedValidationsSchema = new Schema({
  placeId: {
    type: Schema.Types.ObjectId,
    ref: "places",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  presetCodes: {
    type: Boolean,
    default: false,
  },
  validationCodes: {
    type: Array,
    default: [],
  },
  rateId: [{ type: Schema.Types.ObjectId, ref: "rates", index: true }],
  isDaily: {
    type: Boolean,
    default: false,
  },
  isWeekly: {
    type: Boolean,
    default: false,
  },
  isMonthly: {
    type: Boolean,
    default: false,
  },
  isYearly: {
    type: Boolean,
    default: false,
  },
  validFrom: {
    type: Date,
    default: new Date(),
    required: true,
  },
  validUntil: {
    type: Date,
    default: new Date(),
    required: true,
  },

  status: {
    type: Number,
    default: 10,
  },

  quantity: {
    type: String,
  },
  discount: {
    type: String,
  },

  toEmail: {
    type: String,
    required: true,
  },

  ccEmails: {
    type: Array,
    default: [],
  },
  slackChannel: {
    type: String,
  },
});
module.exports = AutomatedValidations = model(
  "AutomatedValidations",
  automatedValidationsSchema
);
