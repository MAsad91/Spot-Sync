const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ValidationSchema = new Schema(
  {
    placeId: { type: Schema.Types.ObjectId, ref: "places" },
    rateId: { type: Schema.Types.ObjectId, ref: "rates" },
    validationCode: { type: String },
    validFrom: { type: Date, default: new Date() },
    validUntil: { type: Date, default: new Date() },
    actualQuantity: { type: Number, default: 1000 },
    quantity: { type: Number, default: 1000 },
    discount: { type: Number, default: 0 },
    status: { type: Number, default: 10 },
  },
  { timestamps: true }
);

ValidationSchema.pre("save", function (next) {
  if (this.isModified("quantity") || this.isNew) {
    this.actualQuantity = this.quantity;
  }
  next();
});

module.exports = Validation = mongoose.model("validations", ValidationSchema);
