const mongoose = require("mongoose");
const { DEFAULT_COUNTRY_CODE } = require("../constants");
const Schema = mongoose.Schema;

const BrandSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", index: true },

    receiptColor: { type: String, default: "#f44336" },
    brandLogo: { type: String, require: true },
    brandName: { type: String, require: true },
    brandAddress: { type: String, require: true },
    shortBrandName: { type: String, require: true },
    ownerName: { type: String, require: true },
    ownerEmail: { type: String, require: true },
    ownerMobileNumber: {
      type: String,
      require: true,
    },
    countryCode: { type: String, require: true, default: DEFAULT_COUNTRY_CODE },
    status: { type: Number, default: 10 },
    onBoardingFrom: { type: String, default: "Admin Dashboard" },
    plivoNumber: { type: String, default: "" },
    paymentGateway: { type: String, default: "" },
    connectAccountId: { type: String, default: "" },
    paymentGatewayFeePayBy: { type: String, default: "" },
    isDirectChargeLocation: { type: Boolean, default: false },
    applyTaxOnServiceFee: { type: Boolean, default: false },
    // Advanced revenue features - Commented out for basic Pakistan setup
    // spotsyncRevenue: { type: Number, default: 0 },
    // spotsyncRevenueType: { type: String, default: "" },
    // spotsyncRevenuePercentOf: { type: String, default: "" },
    // subscriptionSpotsyncRevenue: { type: Number, default: 0 },
    // subscriptionSpotsyncRevenueType: { type: String, default: "" },
    // subscriptionSpotsyncRevenuePercentOf: { type: String, default: "" },
    
    // Advanced payment gateway features - Commented out for basic Pakistan setup
    // paymentGatewayFeePercentage: { type: Number, default: 0 },
    // paymentGatewayFeeFixedCents: { type: Number, default: 0 },
    // Pakistani Tax Structure
    gst: { type: Number, default: 17 }, // General Sales Tax (GST) - Default 17%
    federalExciseDuty: { type: Number, default: 0 }, // Federal Excise Duty
    provincialTax: { type: Number, default: 0 }, // Provincial Tax
    withholdingTax: { type: Number, default: 0 }, // Withholding Tax
    
    // Pakistani Tax for Subscriptions
    subscriptionGst: { type: Number, default: 17 },
    subscriptionFederalExciseDuty: { type: Number, default: 0 },
    subscriptionProvincialTax: { type: Number, default: 0 },
    subscriptionWithholdingTax: { type: Number, default: 0 },
    
    // Legacy tax fields (for backward compatibility) - Commented out for basic Pakistan setup
    // subscriptionStateTax: { type: Number, default: 0 },
    // subscriptionCityTax: { type: Number, default: 0 },
    // subscriptionCountyTax: { type: Number, default: 0 },
    // transientStateTax: { type: Number, default: 0 },
    // transientCityTax: { type: Number, default: 0 },
    // transientCountyTax: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    subscriptionServiceFee: { type: Number, default: 0 },
    isPaymentByCard: { type: Boolean, default: true },
    isPaymentByAch: { type: Boolean, default: true },
    isPaymentByGooglePay: { type: Boolean, default: true },
    isPaymentByApplePay: { type: Boolean, default: true },
    isPaymentByCrypto: { type: Boolean, default: false },
    isPaymentByCash: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = Brand = mongoose.model("brands", BrandSchema);
