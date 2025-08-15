const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  transactionId: { type: String, require: true, index: true },
  locationId: { type: Schema.Types.ObjectId, ref: "locations", index: true },
  status: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: "users", index: true }, // Vendor id
  // locationIdMongo: {type: Schema.Types.ObjectId, ref: "locations", index: true,}, // Vendor id
  paymentGateway: { type: String },
  lotCode: { type: String },
  transactionDate: { type: Date },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = Transaction = mongoose.model("transaction", TransactionSchema);
