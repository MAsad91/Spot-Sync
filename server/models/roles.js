const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users" },
  title: { type: String },
  modules: {
    Dashboard_view: { type: Boolean, default: true },
    Profile_view: { type: Boolean, default: true },
    Role_view: { type: Boolean, default: false },
    MyUser_view: { type: Boolean, default: false },

    Brand_view: { type: Boolean, default: false },
    Setting_view: { type: Boolean, default: false },
    Pricing_view: { type: Boolean, default: false },
    Place_view: { type: Boolean, default: false },
    Rate_view: { type: Boolean, default: false },
    Assign_rate_view: { type: Boolean, default: false },
    Validation_view: { type: Boolean, default: false },
    QRCode_view: { type: Boolean, default: false },
    Subscription_view: { type: Boolean, default: false },
    Reservation_view: { type: Boolean, default: false },
    Transaction_view: { type: Boolean, default: false },
    Report_view : { type: Boolean, default: false },

    Transaction_export: { type: Boolean, default: false },

    Brand_add: { type: Boolean, default: false },
    Brand_delete: { type: Boolean, default: false },
    Brand_update: { type: Boolean, default: false },
    Brand_impersonate: { type: Boolean, default: false },


    Place_add: { type: Boolean, default: false },
    Place_delete: { type: Boolean, default: false },
    Place_update: { type: Boolean, default: false },
    Place_visibility: { type: Boolean, default: false },

    Role_add: { type: Boolean, default: false },
    Role_update: { type: Boolean, default: false },
    Role_delete: { type: Boolean, default: false },

    Rate_add: { type: Boolean, default: false },
    Rate_delete: { type: Boolean, default: false },
    Rate_update: { type: Boolean, default: false },

    Assign_rate_add: { type: Boolean, default: false },

    Pricing_add: { type: Boolean, default: false },
    Pricing_delete: { type: Boolean, default: false },
    Pricing_update: { type: Boolean, default: false },

    MyUser_add: { type: Boolean, default: false },
    MyUser_delete: { type: Boolean, default: false },
    MyUser_update: { type: Boolean, default: false },

    Validation_add: { type: Boolean, default: false },
    Validation_delete: { type: Boolean, default: false },
    Validation_update: { type: Boolean, default: false },

    Subscription_add: { type: Boolean, default: false },
    Subscription_refund: { type: Boolean, default: false },
    Subscription_delete: { type: Boolean, default: false },
    Subscription_report: { type: Boolean, default: false },

    Setting_plivo: { type: Boolean, default: false },
    Setting_payment_gateway: { type: Boolean, default: false },
    Setting_slack: { type: Boolean, default: false },
    Setting_automation: { type: Boolean, default: false },

    Reservation_report: { type: Boolean, default: false },
    Reservation_refund: { type: Boolean, default: false },

    Permit_view: { type: Boolean, default: false },

    QRCode_add: { type: Boolean, default: false },
    QRCode_delete: { type: Boolean, default: false },
    QRCode_update: { type: Boolean, default: false },


  },
  level: { type: Number, default: 80 }, // 100 - super admin, 90 - BRAND OWNER
  status: { type: Number, default: 10 },
  default: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = Role = mongoose.model("roles", RoleSchema);
