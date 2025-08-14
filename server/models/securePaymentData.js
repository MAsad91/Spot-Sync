const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SecurePaymentDataSchema = new Schema({
  placeId: { type: Schema.Types.ObjectId, ref: "places" },
  paymentId: { type: Schema.Types.ObjectId, ref: "payments" },
  customerId: { type: Schema.Types.ObjectId, ref: "customers" },
  subscriptionId: { type: Schema.Types.ObjectId, ref: "subscriptions" },
  reservationObject: { type: Object },
  receiptData: { type: Object },
  stripeProps: { type: Object },
  transferData: { type: Object },
}, { timestamps: true });

module.exports = SecurePaymentData = mongoose.model(
  "securePaymentDatas",
  SecurePaymentDataSchema
);
