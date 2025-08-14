const Subscription = require("../../../../models/subscriptions");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { getSubscriptionRevenueModel } = require("../../../../services/revenue");
const { get } = require("lodash");
const moment = require("moment");

const { generateShortlyId } = require("../../../../global/functions");

module.exports = async (req, res) => {
  try {
    const {
      userId,
      params: { subscriptionId },
      body: { licensePlate },
    } = req;

    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(http403)
        .json({ success: false, message: "Invalid Token" });
    }

    if (!subscriptionId || !isValidObjectId(subscriptionId)) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid Request" });
    }

    if (!licensePlate || !isValidObjectId(licensePlate._id)) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid License Plate data" });
    }

    const { _id, licensePlateNumber, assignName, price } = licensePlate;

    const subscriptionData = await Subscription.findOne({
      _id: ObjectId(subscriptionId),
      "licensePlate._id": ObjectId(_id),
    }).populate("paymentId customerId brandId placeId");

    if (!subscriptionData) {
      return res.status(http400).json({
        success: false,
        message: "License Plate not found in Subscription",
      });
    }

    const {
      placeId,
      isApplyTax,
      isApplyServiceFee,
      isApplyTaxOnServiceFee,
      baseRate,
      taxPercentage,
      cityTaxPercentage,
      countyTaxPercentage,
    } = subscriptionData;

    // Find the existing license plate in the subscription data
    const existingLicensePlate = subscriptionData.licensePlate.find(
      (plate) => plate._id.toString() === _id
    );

    if (!existingLicensePlate) {
      return res.status(http400).json({
        success: false,
        message: "License Plate not found in Subscription",
      });
    }

    // Calculate the new base rate
    const oldPrice = existingLicensePlate.price;
    const newPrice = price * 100;
    const adjustedBaseRate = baseRate - oldPrice + newPrice;
    const randomString = generateShortlyId();
    const externalKey = `${randomString}_${licensePlateNumber}`;
    // const externalKey = `${randomString}_${shortlyObject.licensePlate}`;
    const updateDate = moment().utc().toDate();
    // Update the license plate information
    await Subscription.updateOne(
      { _id: ObjectId(subscriptionId), "licensePlate._id": ObjectId(_id) },
      {
        $set: {
          "licensePlate.$.licensePlateNumber": licensePlateNumber.toUpperCase(),
          "licensePlate.$.assignName": assignName,
          "licensePlate.$.price": newPrice,
          "licensePlate.$.status": 10,
          "licensePlate.$.externalKey": externalKey,
          "licensePlate.$.ballparkValidateDate": updateDate,
        },
      }
    );

    // Update Subscription Revenue Data
    const revenueModel = await getSubscriptionRevenueModel(
      {
        baseRate: adjustedBaseRate,
        taxPercentage,
        cityTaxPercentage,
        countyTaxPercentage,
        placeId: placeId._id,
        isApplyTax,
        isApplyServiceFee,
        isApplyTaxOnServiceFee,
      },
      subscriptionData.isDirectChargeSubscription
    );

    await Subscription.updateOne(
      { _id: ObjectId(subscriptionId) },
      {
        baseRate: revenueModel.baseRate,
        tax: revenueModel.tax,
        cityTax: revenueModel.cityTax,
        countyTax: revenueModel.countyTax,
        serviceFee: revenueModel.serviceFee,
        ownerPayout: revenueModel.ownerPayout,
        isbpRevenue: revenueModel.isbpRevenue,
        applicationFee: revenueModel.applicationFee,
        paymentGatewayFee: revenueModel.paymentGatewayFee,
        totalAmount: revenueModel.totalAmount,
      }
    );



    return res.status(http200).json({
      success: true,
      message: "License plate updated successfully.",
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
