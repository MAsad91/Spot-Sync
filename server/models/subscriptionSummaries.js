const { Schema, model } = require("mongoose");

const subscriptionSummariesSchema = new Schema({
  totalAttempts: { type: Number, default: 0 },
  totalSuccess: { type: Number, default: 0 },
  totalFailed: { type: Number, default: 0 },
  totalRefunded: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  totalSuccessAmount: { type: Number, default: 0 },
  totalFailedAmount: { type: Number, default: 0 },
  totalRefundedAmount: { type: Number, default: 0 },
  totalcardPayments: { type: Number, default: 0 },
  totalACHPayments: { type: Number, default: 0 },
  cardSuccessPayments: { type: Number, default: 0 },
  ACHSuccessPayments: { type: Number, default: 0 },
  cardFailedPayments: { type: Number, default: 0 },
  ACHFailedPayments: { type: Number, default: 0 },
  brandId: { type: Schema.Types.ObjectId, ref: "brands" },
  placeId: { type: Schema.Types.ObjectId, ref: "places" },
  paymentIds: {
    type: [{ type: Schema.Types.ObjectId, ref: "payments" }],
    default: [],
  },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = SubscriptionSummaries = model(
  "subscriptionSummaries",
  subscriptionSummariesSchema
);
