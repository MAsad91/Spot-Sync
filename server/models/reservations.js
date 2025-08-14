const { Schema, model } = require("mongoose");

const ReservationSchema = new Schema(
  {
    licensePlate: {
      type: [
        {
          type: String,
        },
      ],
    },
    placeId: { type: Schema.Types.ObjectId, ref: "places", index: true },
    brandId: { type: Schema.Types.ObjectId, ref: "brands" },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "subscriptions" },
    rateId: { type: Schema.Types.ObjectId, ref: "rates" },
    assignRateId: { type: Schema.Types.ObjectId, ref: "assignRates" },
    parentReservationId: { type: Schema.Types.ObjectId, ref: "reservations" },
    shortly_id: { type: Schema.Types.ObjectId, ref: "shortlies" },
    baseRate: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    subscriptionNumber: { type: String },
    shortlyId: { type: String },
    transientNumber: { type: String },
    spaceNumber: { type: String },
    spotsyncRevenue: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    ownerPayout: { type: Number, default: 0 },
    paymentGatewayFee: { type: Number, default: 0 },
    applicationFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    cityTax: { type: Number, default: 0 },
    countyTax: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    isExtendReminderSend: { type: Boolean, default: false },
    isExtend: { type: Boolean, default: false },
    purpose: { type: String },
    transactionId: { type: String },
    transactionDate: { type: Date, default: null },
    receiptURL: { type: String },
    externalKey: { type: String },
    ballparkValidateDate: { type: Date },
    paymentMethodId: { type: String },
    paymentMethodType: { type: String },
    paymentStatus: { type: String, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: "payments" },
    customerId: { type: Schema.Types.ObjectId, ref: "customers" },
    validationId: { type: Schema.Types.ObjectId, ref: "validations" },
    discountPercentage: { type: Number, default: 0 },
    noOfPasses: { type: Number, default: 1 },
    ridersLastName: { type: String },
    validationCode: { type: String },
    isValidationApplied: { type: Boolean, default: false },
    isPaymentOnHold: { type: Boolean, default: false },
    withoutDiscounted: {},
    gracePeriodExpirationDate: { type: Date },
    status: { type: String, default: "pending", index: true },
    refundPayments: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "payments",
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = Reservations = model("reservations", ReservationSchema);
