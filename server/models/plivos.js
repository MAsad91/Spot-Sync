const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlivoSchema = new Schema({
  number: { type: String },
  status: { type: Number, default: 10 },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = Plivo = mongoose.model("plivos", PlivoSchema);
