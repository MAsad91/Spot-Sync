const { Schema, model } = require("mongoose");

const schema = new Schema({
  connectAccountId: { type: String, default: "" },
  title: { type: String, default: "" },
  status: { type: Number, default: 10, index: true },
  paymentGateway: { type: String, default: "" },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = ConnectAccounts = model("connectAccounts", schema);
