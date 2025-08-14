const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ValidationSessionSchema = new Schema({
  place: {},
  customer: {},
  rate: {},
  brand: {},
  shortlyId: { type: String },
  triggerDate: { type: Date, default: new Date() },
  validationLink: { type: String },
  toNumber: { type: String },
  fromNumber: { type: String },
  licensePlate: { type: String },
  shortlyData: {},
  withoutDiscountedRevenue: {},
  status: { type: Number, default: 10 },
  reminderSend: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = Validation = mongoose.model(
  "validationSessions",
  ValidationSessionSchema
);
