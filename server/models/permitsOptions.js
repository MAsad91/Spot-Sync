const { Schema, model } = require("mongoose");

const permitsOptionsSchema = new Schema({
  placeId: { type: Schema.Types.ObjectId, ref: "places" },
  type: { type: String, default: "" },
  customRates: {
    type: [{ type: Schema.Types.ObjectId, ref: "rates" }],
    default: []
  },
  customConfirmationMessage: { type: String, default: "Default permit confirmation message" },
  displayUnitNumber: { type: Boolean, default: false },
});

module.exports = PermitsOptions = model("permitsOptions", permitsOptionsSchema);
