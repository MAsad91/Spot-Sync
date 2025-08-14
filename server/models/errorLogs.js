const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const errorLogsSchema = new Schema({
  from: { type: String },
  type: { type: String },
  subscriptionNumber: { type: String },
  subscriptionId: { type: Schema.Types.ObjectId, ref: "subscriptions" },
  reservationId: { type: Schema.Types.ObjectId, ref: "reservations" },
  validationId: { type: Schema.Types.ObjectId, ref: "validationSessions" },
  errorMessage: { type: String },
  error: { type: Object },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = Counter = mongoose.model("errorLogs", errorLogsSchema);
