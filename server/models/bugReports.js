const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bugReportsSchema = new Schema(
  {
    name: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
    descriptionOfIssue: { type: String },
    inquirerType: { type: String },
  },
  { timestamps: true }
);

module.exports = BugReportsCollection = mongoose.model("bugReports", bugReportsSchema);
