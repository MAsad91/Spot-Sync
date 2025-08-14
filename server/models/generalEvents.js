const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const generalEventsSchema = new Schema(
  {
    APIEndPoint: { type: String, required: true },
    executionDate: { type: Date, required: true, index: true },
    requestPayload: { type: Object, default: {} },
    data: { type: Object, default: {} },
    status: {
      type: String,
      enum: ["pending", "executed"],
      default: "pending",
      index: true,
    },
    executeCount: { type: Number, default: 0 },
    response: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = GeneralEventsCollection = mongoose.model(
  "generalEvents",
  generalEventsSchema
);
