const {
  Types: { ObjectId },
} = require("mongoose");
const Subscription = require("../../../../models/subscriptions");
const Payment = require("../../../../models/payments");
const Reservation = require("../../../../models/reservations");
const Shortly = require("../../../../models/shortly");
// const PaymentReceipt = require("../../../../models/paymentReceipt");
const {
  getSubscriptionDuration,
  getTimezoneName,
  getDatesFromDuration,
  generateSerialNumber,
  amountToShow,
} = require("../../../../global/functions");
const { get } = require("lodash");

const handleFailed = async ({ subscriptionId, requestData }) => {
  console.log("entered failed ====>");
  try {
    const subscriptionData = await Subscription.findOne(
      { _id: ObjectId(subscriptionId) },
      { paymentId: 1, receiptId: 1, receiptURL: 1, shortlyId: 1 }
    ).lean();
    console.log("subscriptionData ====>", subscriptionData);
    const { paymentId, receiptId, shortlyId } = subscriptionData;

    const updatePaymentObject = {
      paymentStatus: "failed",
      paymentMethodId: requestData.object.payment_method,
      paymentInfo: requestData.object,
    };

    const updateSubscriptionObj = {
      subscriptionStatus: "failed",
      isSubscriptionActive: false,
    };

    // Update Payment
    await Payment.updateOne(
      { _id: ObjectId(paymentId) },
      { $set: updatePaymentObject }
    );

    // Update Reservation
    await Reservation.updateOne(
      { subscriptionId: ObjectId(subscriptionId) },
      { $set: { status: "failed" } }
    );

    // Update Subscription
    await Subscription.updateOne(
      { _id: ObjectId(subscriptionId) },
      { $set: updateSubscriptionObj }
    );

    await Shortly.updateOne(
      { shortlyId },
      { $set: { paymentStatus: "failed" } }
    );
    // Retrieve Receipt
    // const receipt = await PaymentReceipt.findOne({
    //   _id: ObjectId(receiptId),
    // }).lean();

    // Prepare receiptData
    const receiptData = await prepareReceiptData(subscriptionData);
    console.log("Process done ----->");
    return { success: true };
  } catch (error) {
    console.log("error in failed ----->", error);
    return {
      success: false,
      message: error?.message || "Something went wrong!",
    };
  }
};

async function prepareReceiptData(subscriptionData) {
  const duration = getSubscriptionDuration({
    startDate: subscriptionData.startDate,
    endDate: subscriptionData.endDate,
    timezone: getTimezoneName(),
  });
  const dates = getDatesFromDuration({ duration });
  const serialNumber = await generateSerialNumber({ type: "receipt" });
  return {
    subscriptionNumber: get(subscriptionData, "subscriptionNumber", "N/A"),
    transactionId: get(subscriptionData, "paymentId.paymentInfo.id", "N/A"),
    paymentDate: get(subscriptionData, "createdAt", ""),
    subscriptionType: get(subscriptionData, "isMonthly.", false)
      ? "Monthly"
      : "Custom",
    subscriptionId: get(subscriptionData, "_id", ""),
    toEmail: get(subscriptionData, "customerId.email", ""),
    parkerName: `${get(subscriptionData, "customerId.firstName", "")} ${get(
      subscriptionData,
      "customerId.lastName",
      ""
    )}`,
    brandLogo: get(subscriptionData, "brandLogo", ""),
    startDate: dates.startDate,
    endDate: dates.endDate,
    tax: amountToShow(get(subscriptionData, "tax", 0)),
    serviceFee: amountToShow(get(subscriptionData, "serviceFee", 0)),
    total: amountToShow(get(subscriptionData, "totalAmount", 0)),
    baseRate: amountToShow(get(subscriptionData, "baseRate", 0)),
    brandName: get(subscriptionData, "brandId.brandName", ""),
    brandAddress: get(subscriptionData, "brandId.brandAddress", ""),
    brandMobile: get(subscriptionData, "brandId.ownerMobileNumber", ""),
    companyName: get(subscriptionData, "customerId.companyName", ""),
    parkerEmail: get(subscriptionData, "customerId.email", ""),
    autoRenew: get(subscriptionData, "isAutoRenew", false),
    nextRenewalDate: dates.nextRenewalDate,
    placeAddress: get(subscriptionData, "placeId.google.formatted_address", ""),
    discount: 0,
    licensePlates: get(subscriptionData, "licensePlate", []),
    serialNumber: serialNumber,
  };
}

module.exports = handleFailed;
