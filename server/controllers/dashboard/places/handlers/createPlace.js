const Places = require("../../../../models/places");
const Brands = require("../../../../models/brands");
const {
  http200,
  http400,
  http401,
} = require("../../../../global/errors/httpCodes");
const { isValidObjectId } = require("mongoose");
const { PAYMENT_GATEWAY } = require("../../../../config");
const { generateAddress } = require("../../../../global/functions");
const { get } = require("lodash");
const { find } = require("geo-tz");
const PricingTiers = require("../../../../models/pricingTiers");


module.exports = async (req, res) => {
  const { body, userId } = req;

  if (!userId || !isValidObjectId(userId)) {
    return res
      .status(http401)
      .json({ success: false, message: "Invalid Token" });
  }

  const requiredFields = [
    { key: "parkingCode", message: "Lot Code is required." },
    { key: "google", message: "Address is required." },
    { key: "spaces", message: "Spaces is required." },
  ];

  for (const { key, message } of requiredFields) {
    if (
      !body?.[key] ||
      (typeof body[key] === "string" && body[key].trim().length === 0)
    ) {
      return res.status(http400).json({ success: false, message });
    }
  }

  if (body?.paymentGateway) {
    const gateway = body.paymentGateway.toUpperCase();
    if (!PAYMENT_GATEWAY.hasOwnProperty(gateway)) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid payment gateway" });
    }
    body.paymentGateway = gateway;
  }

  try {
    const isParkingCodeExists = await Places.findOne({
      parkingCode: { $regex: `^${body?.parkingCode}$`, $options: "i" },
    }).lean();

    if (isParkingCodeExists) {
      return res
        .status(http400)
        .json({ success: false, message: "Parking code must be unique." });
    }
  } catch (error) {
    return res
      .status(http400)
      .json({
        success: false,
        message: "Error checking parking code uniqueness.",
      });
  }

  const location = get(body, "google.geometry.location", {});
  const timezone = find(get(location, "lat", 0), get(location, "lng", 0));
  const address = generateAddress(body.google);
  const statementDescriptor = get(body, "statementDescriptor", " ").trim();

  let brandData;
  try {
    brandData = await Brands.findById(body.brandId);
    if (!brandData) {
      return res
        .status(http400)
        .json({ success: false, message: "Brand not found." });
    }
  } catch (error) {
    return res
      .status(http400)
      .json({ success: false, message: "Error retrieving brand data." });
  }

  const payload = {
    userId,
    brandId: brandData._id,
    address,
    statementDescriptor,
    timeZoneId: timezone.join(""),

    ...body,
    plivoNumber: brandData.plivoNumber,
    paymentGateway: brandData.paymentGateway,
    connectAccountId: brandData.connectAccountId,
    paymentGatewayFeePayBy: brandData.paymentGatewayFeePayBy,
    applyTaxOnServiceFee: brandData.applyTaxOnServiceFee,
    isDirectChargeLocation: brandData.isDirectChargeLocation,
    
    // Advanced revenue features - Commented out for basic Pakistan setup
    // spotsyncRevenue: brandData.spotsyncRevenue,
    // spotsyncRevenueType: brandData.spotsyncRevenueType,
    // spotsyncRevenuePercentOf: brandData.spotsyncRevenuePercentOf,
    // subscriptionSpotsyncRevenue: brandData.subscriptionSpotsyncRevenue,
    // subscriptionSpotsyncRevenueType: brandData.subscriptionSpotsyncRevenueType,
    // subscriptionSpotsyncRevenuePercentOf: brandData.subscriptionSpotsyncRevenuePercentOf,
    
    // Advanced payment gateway features - Commented out for basic Pakistan setup
    // merchantFee: {
    //   percentage: brandData.paymentGatewayFeePercentage,
    //   fixedCents: brandData.paymentGatewayFeeFixedCents,
    // },
    // Pakistani Tax Structure
    gst: brandData.gst || 17,
    federalExciseDuty: brandData.federalExciseDuty || 0,
    provincialTax: brandData.provincialTax || 0,
    withholdingTax: brandData.withholdingTax || 0,
    
    subscriptionSurcharge: {
      // Pakistani Tax for Subscriptions
      gst: brandData.subscriptionGst || 17,
      federalExciseDuty: brandData.subscriptionFederalExciseDuty || 0,
      provincialTax: brandData.subscriptionProvincialTax || 0,
      withholdingTax: brandData.subscriptionWithholdingTax || 0,
      // Legacy fields
      stateTax: brandData.subscriptionStateTax,
      cityTax: brandData.subscriptionCityTax,
      countyTax: brandData.subscriptionCountyTax,
    },
    // Legacy tax fields (for backward compatibility) - Commented out for basic Pakistan setup
    // tax: brandData.transientStateTax,
    // cityTax: brandData.transientCityTax,
    // countyTax: brandData.transientCountyTax,
    serviceFee: brandData.serviceFee,
    subscriptionServiceFee: brandData.subscriptionServiceFee,
  };

  let place;
  try {
    place = await Places.create(payload);
  } catch (error) {
    return res
      .status(http400)
      .json({
        success: false,
        message: error?.message || "Error creating place.",
      });
  }

  const pricingTierPayload = {
    placeId: place._id,
    creatorId: userId,
    serviceFee: brandData.serviceFee,
    subscriptionServiceFee: brandData.subscriptionServiceFee,
  };

  try {
    await PricingTiers.create(pricingTierPayload);
  } catch (error) {
    return res
      .status(http400)
      .json({ success: false, message: "Error creating pricing tier." });
  }



  return res.status(http200).json({
    success: true,
    message: "Place created successfully!",
  });
};
