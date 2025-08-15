const mongoose = require("mongoose");
const config = require("../config");
const Schema = mongoose.Schema;

const placeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users", index: true },
  brandId: { type: Schema.Types.ObjectId, ref: "brands", index: true },
  paymentGateway: { type: String, default: config.PAYMENT_GATEWAY.STRIPE },
  // Pakistan Payment Gateway Settings
  jazzCashSettings: { 
    merchantId: { type: String },
    password: { type: String },
    returnUrl: { type: String },
    currency: { type: String, default: "PKR" },
    language: { type: String, default: "EN" },
    apiUrl: { type: String, default: "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction" }
  },
  easyPaisaSettings: {
    merchantId: { type: String },
    password: { type: String },
    returnUrl: { type: String },
    currency: { type: String, default: "PKR" },
    language: { type: String, default: "EN" },
    apiUrl: { type: String, default: "https://easypay.easypaisa.com.pk/easypay/Index.jsf" }
  },
  merchantFee: { type: Object,
    percentage: { type: Number, default: 2.9 },
    fixedCents: { type: Number, default: 30 }
  },

  google: { type: Object },
  parkingCode: { type: String, index: true, unique: true },
  domain: { type: String, default: "" },
  lotName: { type: String },
  address: { type: Object },
  spaces: { type: Number, default: 0 },
  default: { type: Boolean },
  // Pakistani Tax Structure
  gst: { type: Number, default: 17 }, // General Sales Tax (GST) - Default 17%
  federalExciseDuty: { type: Number, default: 0 }, // Federal Excise Duty
  provincialTax: { type: Number, default: 0 }, // Provincial Tax
  withholdingTax: { type: Number, default: 0 }, // Withholding Tax
  
  // Legacy tax fields (for backward compatibility) - Commented out for basic Pakistan setup
  // tax: { type: Number, default: 0 }, // In Percent
  // cityTax: { type: Number, default: 0 }, // In Percent
  // countyTax: { type: Number, default: 0 }, // In Percent
  
  subscriptionSurcharge: {
    gst: { type: Number, default: 17 }, // GST for subscriptions
    federalExciseDuty: { type: Number, default: 0 },
    provincialTax: { type: Number, default: 0 },
    withholdingTax: { type: Number, default: 0 },
          // Legacy fields - Commented out for basic Pakistan setup
      // stateTax: { type: Number, default: 0 },
      // cityTax: { type: Number, default: 0 },
      // countyTax: { type: Number, default: 0 },
  },
  applyTaxOnServiceFee: { type: Boolean, default: false }, // In Percent
      // Advanced revenue features - Commented out for basic Pakistan setup
      // spotsyncRevenue: { type: Number, default: 0 }, // In cents
      // spotsyncRevenueType: { type: String, default: "fixed" }, // fixed, percentage
      // spotsyncRevenuePercentOf: { type: String }, // total, serviceFee
      // subscriptionSpotsyncRevenue: { type: Number, default: 0 }, // In cents
      // subscriptionSpotsyncRevenueType: { type: String, default: "fixed" }, // fixed, percentage
      // subscriptionSpotsyncRevenuePercentOf: { type: String }, // total, serviceFee
  paymentGatewayFeePayBy: { type: String, default: "customer" },
  connectAccountId: { type: String, default: "" },
  isDirectChargeLocation: { type: Boolean, default: false },
  statementDescriptor: { type: String },
  timeZoneName: { type: String, default: "Pakistan Standard Time" },
  timeZoneId: { type: String, default: "Asia/Karachi" },
  status: { type: Number, default: 10, index: true },
  // Advanced SaaS features - Commented out for basic Pakistan setup
  // saasSubscriptionValue: { type: Number, default: 0 },
  // saasSubscription: { type: Boolean, default: false },
  default: { type: Boolean, default: true },
  plivoId: { type: Schema.Types.ObjectId, ref: "plivos" },
  plivoNumber: { type: String },

  extensionExpireLimit: { type: Number, default: 15 },
  isPass: { type: Boolean, default: false },

  isExtensionEnable: { type: Boolean, default: false },
  collectSpaceNumber: { type: Boolean, default: false },
  rateOptionCount: { type: Number, default: 20 },
  splitRevenue: { type: Object },
  stripeConfiguration: {
    name: { type: String },
  },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
});

module.exports = Place = mongoose.model("places", placeSchema);
