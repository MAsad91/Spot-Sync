const { Schema, model } = require("mongoose");

const ReceiptDesignSchema = new Schema({
  brandId: { type: Schema.Types.ObjectId, ref: "brands" },
  placeId: { type: Schema.Types.ObjectId, ref: "places" },
  content: { type: String, default: "" },
  isEmailTemplate: { type: Boolean, default: true },
  status: { type: Number, default: 10 },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = ReceiptDesigns = model("receiptDesigns", ReceiptDesignSchema);
