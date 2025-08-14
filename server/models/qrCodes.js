const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QRCodeSchema = new Schema(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: "users" },
    placeId: { type: Schema.Types.ObjectId, ref: "places" },
    qrCodeImage: { type: String, require: true },
    title: { type: String, require: true },
    type: { type: String, default: "web" },
    url: { type: String },
    shortUrl: {type: String},
    mobile: { type: String },
    message: { type: String },
    status: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = QRCode = mongoose.model("qrCodes", QRCodeSchema);
