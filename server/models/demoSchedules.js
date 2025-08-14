const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const demoSchedulesSchema = new Schema(
  {
    fullName: { type: String },
    companyName: { type: String },
    phoneNumber: { type: String },
    email: { type: String },
  },
  { timestamps: true }
);

module.exports = DemoScheduleCollection = mongoose.model("demoSchedules", demoSchedulesSchema);
