const { Schema, model } = require("mongoose");

const customerActivityLogSchema = new Schema({
    fingerprint: { type: String, index: true  },
    placeId: { type: Schema.Types.ObjectId, ref: "places" },
    customerId: { type: Schema.Types.ObjectId, ref: "customers" },
    createdAt: { type: Date, default: new Date() }
});

module.exports = CustomerActivityLog = model("customerActivityLogs", customerActivityLogSchema);
