const { Schema, model } = require("mongoose");

const automatedReportsSchema = new Schema({
  toEmail: {
    type: String,
    required: true,
  },
  ccEmails: {
    type: Array,
    default: [],
  },
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
  isTransaction: {
    type: Boolean,
    default: false,
  },
  isRefund: {
    type: Boolean,
    default: false,
  },
  isPermit: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Number,
    default: 10,
  },
  placeIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "places",
    },
  ],
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});
module.exports = AutomatedReports = model(
  "AutomatedReports",
  automatedReportsSchema
);
