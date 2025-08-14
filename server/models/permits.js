const { Schema, model } = require("mongoose");

const PermitSchema = new Schema({
  placeId: { type: Schema.Types.ObjectId, ref: "places" },
  permitNumber: { type: String },
  internalId: { type: String },
  assignedName: { type: String },
  phoneNo: { type: String },
  email: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  licensePlate: [],
  vehicleState: { type: String },
  vehicleMake: { type: String },
  vehicleModel: { type: String },
  status: { type: String, default: "requested" },
  rateId: { type: Schema.Types.ObjectId, ref: "rates" },
  permitType: { type: String },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = Permits = model("permits", PermitSchema);
