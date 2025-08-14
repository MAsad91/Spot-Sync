const { Schema, model } = require("mongoose");

const activityLogSchema = new Schema({
    fingerprint: { type: String, index: true  },
    placeId: { type: Schema.Types.ObjectId, ref: "places" },
    intentName: { type: String },
    inputContext: { type: String },
    outputContext: { type: Object },
    requestBody: { type: Object },
    createdAt: { type: Date, default: new Date() }
});

module.exports = ActivityLog = model("activityLogs", activityLogSchema);
