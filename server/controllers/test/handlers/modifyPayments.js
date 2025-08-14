const { http200, http400 } = require("../../../global/errors/httpCodes");
const Payments = require("../../../models/payments");
const {
  Types: { ObjectId },
} = require("mongoose");

module.exports = async (req, res) => {
  try {
    const paymentsList = await Payments.find({
      paymentInfo: { $exists: true },
      isUpdated: false,
    })
      .populate("subscriptionId")
      .limit(100);

    console.log("paymentsList ---->", paymentsList.length);

    if (!paymentsList.length) {
      return res.status(http200).json({
        success: true,
        message: "No payments to update!",
      });
    }

    let updatedCount = 0;
    const failedToUpdate = [];

    const updatePromises = paymentsList.map(async (payment) => {
      const { subscriptionId, paymentInfo } = payment;

      if (!subscriptionId) {
        failedToUpdate.push(payment._id);
        return;
      }
      console.log("paymentId --->", payment._id);
      const transactionId = paymentInfo.id
        ? paymentInfo.id
        : paymentInfo.payment_intent.id;

      const paymentUpdateObject = {
        transactionId,
        subscriptionNumber: subscriptionId.subscriptionNumber,
        placeId: subscriptionId.placeId,
        paymentMethodType: subscriptionId.paymentMethodType,
        licensePlate: subscriptionId.licensePlate,
        isApplyTax: subscriptionId.isApplyTax,
        isApplyServiceFee: subscriptionId.isApplyServiceFee,
        isApplyTaxOnServiceFee: subscriptionId.isApplyTaxOnServiceFee,
        paymentGatewayFeePayBy: subscriptionId.paymentGatewayFeePayBy,
        baseRate: subscriptionId.baseRate,
        tax: subscriptionId.tax,
        taxPercentage: subscriptionId.taxPercentage,
        serviceFee: subscriptionId.serviceFee,
        ownerPayout: subscriptionId.ownerPayout,
        isbpRevenue: subscriptionId.isbpRevenue,
        applicationFee: subscriptionId.applicationFee,
        paymentGatewayFee: subscriptionId.paymentGatewayFee,
        totalAmount: subscriptionId.totalAmount,
        isUpdated: true,
      };

      const updatedPayment = await Payments.findByIdAndUpdate(
        payment._id,
        { $set: paymentUpdateObject },
        { new: true }
      );

      if (updatedPayment) {
        updatedCount++;
      }
      console.log("updatedCount ---->", updatedCount);
    });

    await Promise.all(updatePromises);

    return res.status(http200).json({
      success: true,
      message: `Successfully updated ${updatedCount} out of ${paymentsList.length} payments!`,
      failedToUpdate: failedToUpdate,
    });
  } catch (error) {
    console.log("error --->", error);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
