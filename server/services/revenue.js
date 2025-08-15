const {
  Types: { ObjectId },
} = require("mongoose");
const Places = require("../models/places");
const PricingTier = require("../models/pricingTiers");
const { get } = require("lodash");
const { getWithDefault } = require("../services/utilityService");

function roundUp(value) {
  return Math.ceil(value); // Round up to the nearest cent
}

function calculateProcessingFee({ amount, paymentGatewayFeePayBy, placeData }) {
  const percentageFee =
    getWithDefault(placeData, "merchantFee.percentage", 2.9) / 100;
  const fixedFee = getWithDefault(placeData, "merchantFee.fixedCents", 30);
  let fee = amount * percentageFee + fixedFee;
  if (paymentGatewayFeePayBy === "customer") {
    fee *= 1 + percentageFee;
  }
  return roundUp(fee);
}

function excludeProcessingFee(paymentGatewayFeePayBy, directChargePayment) {
  return directChargePayment || paymentGatewayFeePayBy === "spotsync";
}

function calculateApplicationFee({
  spotsyncRevenue,
  paymentGatewayFeePayBy,
  processingFee,
  directChargePayment,
}) {
  const fee = excludeProcessingFee(paymentGatewayFeePayBy, directChargePayment)
    ? spotsyncRevenue
    : spotsyncRevenue + processingFee;
  return roundUp(fee);
}

function isDirectChargePayment (place, subscription) {
  return subscription ? subscription.isDirectChargeSubscription : place.isDirectChargeLocation;
}

module.exports = {
  isDirectChargePayment,
  calculateProcessingFee,
  calculateApplicationFee,
  async getSubscriptionRevenueModel({
    baseRate,
    placeId,
    isApplyTax,
    isApplyServiceFee,
    isApplyTaxOnServiceFee,
    licensePlateCount,
    taxPercentage,
    cityTaxPercentage,
    countyTaxPercentage,
  }, isDirectChargeSubscription = null) {
    try {
      console.log("baseRate ===>", baseRate);

      const placeData = await Places.findOne({ _id: ObjectId(placeId) });
      const paymentGatewayFeePayBy = get(
        placeData,
        "paymentGatewayFeePayBy",
        "spotsync"
      );
      const directChargePayment = isDirectChargeSubscription !== null ? isDirectChargeSubscription : isDirectChargePayment(placeData, null);      
      const pricingTier = await PricingTier.findOne(
        { placeId: ObjectId(placeId), default: true, status: 10 },
        { subscriptionServiceFee: 1 }
      );
      let totalAmount = baseRate;
      const placeTaxPercentage = taxPercentage
        ? taxPercentage
        : get(placeData, "subscriptionSurcharge.stateTax", 0);
      const placeCityTaxPercentage = cityTaxPercentage
        ? cityTaxPercentage
        : get(placeData, "subscriptionSurcharge.cityTax", 0);
      const placeCountyTaxPercentage = countyTaxPercentage
        ? countyTaxPercentage
        : get(placeData, "subscriptionSurcharge.countyTax", 0);

      let tax = 0;
      let cityTax = 0;
      let countyTax = 0;
      let serviceFee = roundUp(
        get(pricingTier, "subscriptionServiceFee", 0)
      );

      if (licensePlateCount > 0) {
        serviceFee = roundUp(serviceFee * licensePlateCount);
      }
      console.log("serviceFee ====>", serviceFee);
      if (isApplyTax) {
        if (isApplyTaxOnServiceFee && isApplyServiceFee) {
          tax = roundUp(((baseRate + serviceFee) * placeTaxPercentage) / 100);
          cityTax = roundUp(
            ((baseRate + serviceFee) * placeCityTaxPercentage) / 100
          );
          countyTax = roundUp(
            ((baseRate + serviceFee) * placeCountyTaxPercentage) / 100
          );
        } else {
          tax = roundUp((baseRate * placeTaxPercentage) / 100);
          cityTax = roundUp((baseRate * placeCityTaxPercentage) / 100);
          countyTax = roundUp((baseRate * placeCountyTaxPercentage) / 100);
        }
        totalAmount = roundUp(totalAmount + tax + cityTax + countyTax);
      }
      if (isApplyServiceFee) {
        totalAmount = roundUp(totalAmount + serviceFee);
      }

      const paymentGatewayFee = calculateProcessingFee({
        amount: totalAmount,
        paymentGatewayFeePayBy: paymentGatewayFeePayBy,
        placeData
      });

      if (paymentGatewayFeePayBy === "customer") {
        totalAmount = roundUp(totalAmount + paymentGatewayFee);
      }

      // Advanced revenue features - Commented out for basic Pakistan setup
      // const spotsyncRevenueType = get(
      //   placeData,
      //   "subscriptionSpotsyncRevenueType",
      //   "fixed"
      // );
      // const spotsyncRevenuePercentageOf = get(
      //   placeData,
      //   "subscriptionSpotsyncRevenuePercentageOf",
      //   ""
      // );
      // const spotsyncRevenueValue = get(placeData, "subscriptionSpotsyncRevenue", 0);

      // let spotsyncRevenue = 0;

      // if (spotsyncRevenueType === "fixed") {
      //   spotsyncRevenue = roundUp(spotsyncRevenueValue * 100);
      // } else if (spotsyncRevenueType === "percentage") {
      //   switch (spotsyncRevenuePercentageOf) {
      //     case "serviceFee":
      //       spotsyncRevenue = roundUp((serviceFee * spotsyncRevenueValue) / 100);
      //       break;
      //     case "baseRate":
      //       spotsyncRevenue = roundUp((baseRate * spotsyncRevenueValue) / 100);
      //       break;
      //     case "totalAmount":
      //       spotsyncRevenue = roundUp((totalAmount * spotsyncRevenueValue) / 100);
      //       break;
      //     default:
      //       spotsyncRevenue = 0;
      //       break;
      //   }
      // }
      // const saasSubscription = get(placeData, "saasSubscription", false);
      // if (saasSubscription) {
      //   spotsyncRevenue = 0;
      // }
      
      // Set default values for basic Pakistan setup
      let spotsyncRevenue = 0;

      const applicationFee = calculateApplicationFee({
        spotsyncRevenue: spotsyncRevenue,
        paymentGatewayFeePayBy: paymentGatewayFeePayBy,
        processingFee: paymentGatewayFee,
        directChargePayment: directChargePayment,
      });

      const totalAmountInDollars = totalAmount / 100;
      const applicationFeeInDollars = applicationFee / 100;
      const paymentGatewayFeeInDollars = paymentGatewayFee / 100;

      const ownerPayoutInDollars =
        totalAmountInDollars -
        applicationFeeInDollars -
        (excludeProcessingFee(paymentGatewayFeePayBy, directChargePayment)
          ? paymentGatewayFeeInDollars
          : 0);

      // Convert ownerPayout back to cents
      const ownerPayout = roundUp(ownerPayoutInDollars * 100);

      return {
        baseRate: roundUp(baseRate),
        serviceFee,
        tax,
        cityTax,
        countyTax,
        totalAmount: roundUp(totalAmount),
        ownerPayout,
        spotsyncRevenue,
        applicationFee: roundUp(applicationFee),
        paymentGatewayFee: roundUp(paymentGatewayFee),
      };
    } catch (error) {
      return error;
    }
  },

  async getParkingRevenueModel({
    isFreeRate,
    baseRate,
    placeId,
    isApplyServiceFee,
    rateType,
    hours,
    isSecondStepValidation = false,
    isPass = false,
    noOfPasses = 0
  }) {
    try {
      if (isFreeRate) {
        return {
          baseRate: 0,
          serviceFee: 0,
          tax: 0,
          cityTax: 0,
          countyTax: 0,
          totalAmount: 0,
          ownerPayout: 0,
          spotsyncRevenue: 0,
          applicationFee: 0,
          paymentGatewayFee: 0,
        };
      }
      const placeData = await Places.findOne(
        { _id: ObjectId(placeId) },
        {
          tax: 1,
          cityTax: 1,
          countyTax: 1,
          paymentGatewayFeePayBy: 1,
                  spotsyncRevenue: 1,
        spotsyncRevenueType: 1,
        spotsyncRevenuePercentOf: 1,
          saasSubscription: 1,
          applyTaxOnServiceFee: 1,
          isDirectChargeLocation: 1,
          merchantFee: 1,
          subscriptionSurcharge: 1,
        }
      );
      const directChargePayment = get(placeData, "isDirectChargeLocation", false);
      const paymentGatewayFeePayBy = get(placeData, "paymentGatewayFeePayBy", "spotsync")
      // Pakistani Tax Structure
      let gstPercentage = get(placeData, "gst", 17);
      let federalExciseDutyPercentage = get(placeData, "federalExciseDuty", 0);
      let provincialTaxPercentage = get(placeData, "provincialTax", 0);
      let withholdingTaxPercentage = get(placeData, "withholdingTax", 0);

      // Legacy tax fields (for backward compatibility) - Commented out for basic Pakistan setup
      // let placeTaxPercentage = get(placeData, "tax", 0);
      // let placeCityTaxPercentage = get(placeData, "cityTax", 0);
      // let placeCountyTaxPercentage = get(placeData, "countyTax", 0);

      if (rateType === "monthly") {
        gstPercentage = get(placeData, "subscriptionSurcharge.gst", 17);
        federalExciseDutyPercentage = get(placeData, "subscriptionSurcharge.federalExciseDuty", 0);
        provincialTaxPercentage = get(placeData, "subscriptionSurcharge.provincialTax", 0);
        withholdingTaxPercentage = get(placeData, "subscriptionSurcharge.withholdingTax", 0);
        
        // Legacy fields - Commented out for basic Pakistan setup
        // placeTaxPercentage = get(placeData, "subscriptionSurcharge.stateTax", 0);
        // placeCityTaxPercentage = get(placeData, "subscriptionSurcharge.cityTax", 0);
        // placeCountyTaxPercentage = get(placeData, "subscriptionSurcharge.countyTax", 0);
      }

      const isApplyTax = gstPercentage > 0 || federalExciseDutyPercentage > 0 || provincialTaxPercentage > 0 || withholdingTaxPercentage > 0 || placeTaxPercentage > 0 || placeCityTaxPercentage > 0 || placeCountyTaxPercentage > 0;
      const isApplyTaxOnServiceFee = get(
        placeData,
        "applyTaxOnServiceFee",
        false
      );
      const findQuery = {
        placeId,
        status: 10,
      };
      let pricingTier = await PricingTier.find(findQuery);
      let actualServiceFee = 0;
      let pricingTierObj = "";
      const findDefault = pricingTier.find((pricing) => pricing.default);
      actualServiceFee = findDefault.serviceFee;

      pricingTier = pricingTier.map((pricing) => {
        if (pricingTierObj !== "") {
          return;
        }
        if (
          baseRate === pricing.condition_value &&
          pricing.condition_operator === "="
        ) {
          pricingTierObj = pricing;
          actualServiceFee = pricing.serviceFee;
          return pricing;
        } else if (
          baseRate > pricing.condition_value &&
          pricing.condition_operator === ">"
        ) {
          pricingTierObj = pricing;
          actualServiceFee = pricing.serviceFee;
          return pricing;
        } else if (
          baseRate < pricing.condition_value &&
          pricing.condition_operator === "<"
        ) {
          pricingTierObj = pricing;
          actualServiceFee = pricing.serviceFee;
          return pricing;
        }
      });
      let totalAmount =
        rateType === "hourly"
          ? isSecondStepValidation
            ? baseRate
            : baseRate * hours
          : baseRate;

      baseRate =
        rateType === "hourly"
          ? isSecondStepValidation
            ? baseRate
            : baseRate * hours
          : baseRate;
        
      baseRate = rateType === "custom" && isPass && noOfPasses > 0 ? baseRate * noOfPasses : baseRate;
      totalAmount = isPass ? baseRate : totalAmount;

      // Pakistani Tax Calculations
      let gst = 0;
      let federalExciseDuty = 0;
      let provincialTax = 0;
      let withholdingTax = 0;
      
      // Legacy tax calculations (for backward compatibility)
      let tax = 0;
      let cityTax = 0;
      let countyTax = 0;
      let placeTaxPercentage = get(placeData, "tax", 0);
      let placeCityTaxPercentage = get(placeData, "cityTax", 0);
      let placeCountyTaxPercentage = get(placeData, "countyTax", 0);
      let serviceFee = actualServiceFee; // PKR is already in whole numbers

      if (isApplyTax) {
        const taxBase = isApplyTaxOnServiceFee && isApplyServiceFee ? (baseRate + serviceFee) : baseRate;
        
        // Pakistani Tax Calculations
        gst = roundUp((taxBase * gstPercentage) / 100);
        federalExciseDuty = roundUp((taxBase * federalExciseDutyPercentage) / 100);
        provincialTax = roundUp((taxBase * provincialTaxPercentage) / 100);
        withholdingTax = roundUp((taxBase * withholdingTaxPercentage) / 100);
        
        // Legacy tax calculations
        tax = roundUp((taxBase * placeTaxPercentage) / 100);
        cityTax = roundUp((taxBase * placeCityTaxPercentage) / 100);
        countyTax = roundUp((taxBase * placeCountyTaxPercentage) / 100);
        
        totalAmount = totalAmount + gst + federalExciseDuty + provincialTax + withholdingTax + tax + cityTax + countyTax;
      }
      if (isApplyServiceFee) {
        totalAmount += roundUp(serviceFee);
      }
      const paymentGatewayFee = calculateProcessingFee({
        amount: totalAmount,
        paymentGatewayFeePayBy: paymentGatewayFeePayBy,
        placeData
      });

      if (paymentGatewayFeePayBy === "customer") {
        totalAmount += roundUp(paymentGatewayFee);
      }

      // Advanced revenue features - Commented out for basic Pakistan setup
      // const spotsyncRevenueType = get(placeData, "spotsyncRevenueType", "fixed");
      // const spotsyncRevenuePercentageOf = get(
      //   placeData,
      //   "spotsyncRevenuePercentOf",
      //   ""
      // );
      // const spotsyncRevenueValue = get(placeData, "spotsyncRevenue", 0);
      // let spotsyncRevenue = 0;
      // if (spotsyncRevenueType === "fixed") {
      //   spotsyncRevenue = spotsyncRevenueValue * 100;
      // } else if (spotsyncRevenueType === "percentage") {
      //   switch (spotsyncRevenuePercentageOf) {
      //     case "serviceFee":
      //       spotsyncRevenue = roundUp((serviceFee * spotsyncRevenueValue) / 100);
      //       break;
      //     case "baseRate":
      //       spotsyncRevenue = roundUp((baseRate * spotsyncRevenueValue) / 100);
      //       break;
      //     case "totalAmount":
      //       spotsyncRevenue = roundUp((totalAmount * spotsyncRevenueValue) / 100);
      //       break;
      //     default:
      //       spotsyncRevenue = 0;
      //       break;
      //   }
      // }
      // const saasSubscription = get(placeData, "saasSubscription", false);
      // if (saasSubscription) {
      //   spotsyncRevenue = 0;
      // }
      
      // Set default values for basic Pakistan setup
      let spotsyncRevenue = 0;

      const applicationFee = calculateApplicationFee({
        spotsyncRevenue: spotsyncRevenue,
        paymentGatewayFeePayBy: get(
          placeData,
          "paymentGatewayFeePayBy",
          "spotsync"
        ),
        processingFee: paymentGatewayFee,
        directChargePayment,
      });
      // For PKR, amounts are already in whole rupees (no division by 100 needed)
      const totalAmountInPKR = totalAmount;
      const applicationFeeInPKR = applicationFee;
      const paymentGatewayFeeInPKR = paymentGatewayFee;

      const ownerPayoutInPKR =
        totalAmountInPKR -
        applicationFeeInPKR -
        (excludeProcessingFee(paymentGatewayFeePayBy, directChargePayment)
          ? paymentGatewayFeeInPKR
          : 0);

      const ownerPayout = roundUp(ownerPayoutInPKR);

      return {
        baseRate,
        serviceFee,
        // Pakistani Taxes
        gst,
        federalExciseDuty,
        provincialTax,
        withholdingTax,
        // Legacy taxes (for backward compatibility)
        tax,
        cityTax,
        countyTax,
        totalAmount,
        ownerPayout,
        spotsyncRevenue: spotsyncRevenue, // Map spotsyncRevenue to spotsyncRevenue for compatibility
        applicationFee,
        paymentGatewayFee,
        noOfPasses: parseInt(noOfPasses),
      };
    } catch (error) {
      console.log("error (parking revenue) =====>", error.message);
      return error;
    }
  },
};
