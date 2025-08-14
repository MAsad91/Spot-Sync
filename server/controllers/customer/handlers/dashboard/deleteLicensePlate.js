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

module.exports = async (req, res) => {
  try {
    const {
      userId,
      params: { subscriptionId },
      body: { licensePlateId },
    } = req;

    console.log("body ===>", req.body);

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

    const filter = {
      _id: ObjectId(subscriptionId),
      "licensePlate._id": ObjectId(licensePlateId),
    };
    const subscriptionData = await Subscription.findOne(filter).populate(
      "paymentId customerId brandId placeId"
    );

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
      licensePlate,
    } = subscriptionData;

    const existingLicensePlate = licensePlate.find(
      (plate) => plate._id.toString() === licensePlateId
    );
    const oldPrice = existingLicensePlate.price;
    const adjustedBaseRate = baseRate - oldPrice;

    const revenueModel = await getSubscriptionRevenueModel({
      baseRate: adjustedBaseRate,
      taxPercentage,
      cityTaxPercentage,
      countyTaxPercentage,
      placeId: placeId._id,
      isApplyTax,
      isApplyServiceFee,
      isApplyTaxOnServiceFee,
    }, subscriptionData._id);
    await Subscription.updateOne(filter, {
      $set: {
        "licensePlate.$.status": 0,
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
        isReminderEmailSend: false,
      },
    });

    return res.status(http200).json({
      success: true,
      message: "License plate numbers deleted successfully.",
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
