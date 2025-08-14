const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, require: true, index: true, unique: true },
  mobile: { type: String, },
  password: { type: String, require: true },
  roleId: { type: Schema.Types.ObjectId, ref: "roles" },
  status: { type: Number, default: 10 },

  firstName: { type: String, default: "" }, // First Name
  lastName: { type: String, default: "" }, // Last Name
  name: { type: String, require: true }, // Owner Name
  locations: [{ type: Schema.Types.ObjectId, ref: "places", index: true }],
  creatorId: { type: Schema.Types.ObjectId, ref: "users" },
  connectAccountId: { type: String }, // Stripe connected ID
  brandId: {
    // Should be array 💫
    title: { type: String, require: true },
    shortName: { type: String },
    logo: { type: String },
  },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = User = mongoose.model("users", UserSchema);
