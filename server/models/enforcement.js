const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const enforcementSchema = new Schema({
  date_created: { type: Date, default: Date.now() },
  plate: { type: String, index: true },
  make_model: { type: String },
  color: { type: String },
  dwell_time: { type: Number },
  amountDue: { type: Number, default: 60 },
  type: { type: String },
  state: { type: String },
  first_seen: { type: Date },
  entry: {
    image: { type: String },
    event_time: { type: String },
    plate_image: { type: String }
  },
  exit: {
    image: { type: String },
    event_time: { type: Date },
    plate_image: { type: String }
  },
  status: { type: String },
  statusUpdatedBy: { type: String },
  grouping_id: { type: String, index: true },
  site: { type: String },
  reservationId: { type: Schema.Types.ObjectId, ref: "Reservations" },
  placeId: { type: Schema.Types.ObjectId, ref: "places", index: true },
  referenceId: { type: String },
  referenceNum: { type: String },
  lotCode: { type: String },
  parkerType: { type: String },
  void: { type: Boolean, index: true, default: false },
  sendToenforcement: { type: Boolean, index: true, default: false },
  paymentReceivedDate: { type: String },
  receivedAmount: { type: Number },
  paidVia: { type: String },
  correctedLicense: { type: String },
  updatedBy: { type: String },
  noticeType: { type: String },
  noticeDate: { type: String },
  contentUrl: { type: String }
});

module.exports = Enforcement = mongoose.model("enforcements", enforcementSchema);