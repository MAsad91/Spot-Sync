const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const counterSchema = new Schema({
  totalCounter: { type: Number },
  invoiceCounter: { type: Number },
  receiptCounter: { type: Number },
  subscriptionCounter: { type: Number },
  transientCounter: { type: Number },
  permitCounter: { type: Number },
  status: { type: Boolean },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = Counter = mongoose.model("counters", counterSchema);
