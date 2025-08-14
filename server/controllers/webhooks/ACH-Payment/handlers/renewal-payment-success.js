const {
  Types: { ObjectId },
} = require("mongoose");
const Subscription = require("../../../../models/subscriptions");
const Payment = require("../../../../models/payments");
const Reservation = require("../../../../models/reservations");
const Shortly = require("../../../../models/shortly");
const {
  getDatesFromDuration,
  getSubscriptionDuration,
  getTimezoneName,
  amountToShow,
  generateSerialNumber,
} = require("../../../../global/functions");
const { sendMessage } = require("../../../../services/plivo");
const { isEmpty, get } = require("lodash");
const SendAttachmentEmail = require("../../../../services/APIServices/sendAttachmentEmail");
const handleSuccess = async ({ subscriptionId, requestData }) => {
  console.log("subscriptionId in success page --->", subscriptionId);
  console.log("enterd success =====>");
  try {
    const subscriptionData = await Subscription.findOne({
      _id: ObjectId(subscriptionId),
    })
      .populate({
        path: "customerId placeId paymentId brandId",
      })
      .lean();

    if (subscriptionData && subscriptionData.subscriptionStatus !== "active") {
      console.log("process start =====>");
      const { paymentId, shortlyId } = subscriptionData;
      const updatePaymentObject = {
        paymentStatus: "success",
        paymentMethodId: requestData.object.payment_method,
        paymentInfo: requestData.object,
      };
      let updateSubscriptionObj = {
        subscriptionStatus: "active",
        isSubscriptionActive: true,
        isReminderEmailSend: false,
        defaultPaymentMethodId: requestData.object.payment_method,
      };
      // Update Payment

      // Update Reservation
      await Reservation.updateOne(
        { subscriptionId: ObjectId(subscriptionId) },
        { $set: { status: "success" } }
      );

      await Shortly.updateOne(
        { shortlyId },
        { $set: { paymentStatus: "success", clientSecretACH: null } }
      );

      // Prepare receiptData
      const emailData = await prepareReceiptData(subscriptionData);
     
      const receiptURL = "";
      updateSubscriptionObj.receiptURL = receiptURL;
      updatePaymentObject.receiptURL = receiptURL;
      await Payment.updateOne(
        { _id: ObjectId(paymentId._id) },
        { $set: updatePaymentObject }
      );
      await Subscription.updateOne(
        { _id: ObjectId(subscriptionId) },
        { $set: updateSubscriptionObj }
      );
      // Send email with attachment
      if (get(subscriptionData, "customerId.isEmailPrimary", false)) {
        await SendAttachmentEmail({
          type: "paymentConfirmation",
          attachmentData: receiptData,
        });
      } else {
        const mobileNumber = get(subscriptionData, "customerId.mobile", false);
        if (mobileNumber || !isEmpty(mobileNumber)) {
          const plivoNumber = get(
            subscriptionData,
            "placeId.plivoNumber",
            false
          );
          const props = {
            from: plivoNumber,
            to: mobileNumber,
            body: `Your payment is under process! One's we receive the payment we will update your subscription status and notify you via email/SMS `,
          };
          await sendMessage(props);
        }
      }

      console.log("process done ----->");
      return { success: true };
    }
    return { success: true };
  } catch (error) {
    console.log("error in success ====>", error);
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
    paymentGatewayFee: amountToShow(subscriptionData?.paymentGatewayFee ?? 0),
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
    licensePlates: get(subscriptionData, "licensePlate", []).filter(
      (obj) => obj.status === 10
    ),
    serialNumber: serialNumber,
    paymentData: dates.startDate,
  };
}

module.exports = handleSuccess;
