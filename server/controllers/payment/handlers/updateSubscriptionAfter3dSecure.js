const Subscription = require("../../../models/subscriptions");
const Payment = require("../../../models/payments");
const Reservation = require("../../../models/reservations");
const ReceiptCollection = require("../../../models/receipts");
const Shortly = require("../../../models/shortly");
// Session model removed - no longer needed for chatbot functionality
const SecurePaymentData = require("../../../models/securePaymentData");
const { http200, http400 } = require("../../../global/errors/httpCodes");
const moment = require("moment");
const {
  Types: { ObjectId },
} = require("mongoose");
const {
  transferSplitRevenuePaymentAfter3dSecure,
} = require("../../../services/stripe");
const { get, isEmpty } = require("lodash");
const {
  amountToShow,
  generateSerialNumber,
} = require("../../../global/functions");
const { sendMessage } = require("../../../services/plivo");

const SendAttachmentEmail = require("../../../services/APIServices/sendAttachmentEmail");

module.exports = async (req, res) => {
  try {
    let { securePaymentDataId, paymentIntent, error } = req.body;

    const securePaymentData = await SecurePaymentData.findOne({ _id: ObjectId(securePaymentDataId) })
      .populate("placeId, paymentId")
      .lean();

    const {
      placeId,
      reservationObject,
      receiptData,
      transferData
    } = securePaymentData

    const subscription = await Subscription.findOne({ _id: securePaymentData.subscriptionId }).populate("customerId");
    const subscriptionId = subscription._id;
    const paymentId = securePaymentData.paymentId;

    let paymentObject = {}
    let subscriptionNumber;
    let receiptNumber;
    let transactionDate = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    
    if (error) {
      paymentObject.paymentStatus = "failed";
      const payment = await Payment.findOneAndUpdate(
        { _id: paymentId._id },
        { $set: paymentObject },
        { new: true }
      );

      reservationObject.status = "failed";
      reservationObject.paymentId = payment._id;
      await Reservation.create(reservationObject);
      return res.status(http400).json({
        success: false,
        message: error,
      });
    } else {
      // For revenue split logic
      if (transferData) {
        const result = await transferSplitRevenuePaymentAfter3dSecure({
          ...transferData,
          place: placeId
        });

        paymentIntent["extraParams"] = result.data;

        paymentObject.paymentInfo = paymentIntent;
      }

      if (paymentIntent.created) {
        transactionDate = moment
          .unix(paymentIntent.created)
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      }
      await Shortly.findOneAndUpdate(
        { shortlyId: subscription.shortlyId },
        { paymentStatus: "success", clientSecretACH: null }
      );
      receiptNumber = await generateSerialNumber({ type: "receipt" });
      receiptData.serialNumber = receiptNumber;
      receiptData.type = "receipt";
      subscriptionNumber = await generateSerialNumber({ type: "subscription" });
      receiptData.subscriptionNumber = subscriptionNumber;
      paymentObject.subscriptionNumber = subscriptionNumber;
      reservationObject.subscriptionNumber = subscriptionNumber;
      paymentObject.paymentStatus = "success";
      reservationObject.status = "success";
      paymentObject.paymentInfo = paymentIntent;
      paymentObject.transactionId = paymentIntent?.id;
      paymentObject.transactionDate = transactionDate;

      reservationObject.transactionId = paymentIntent?.id;
      reservationObject.transactionDate = transactionDate;
      receiptData.paymentDate = moment
        .tz(transactionDate, placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A");
      receiptData.transactionId = paymentIntent?.id;

      const invoiceNumber = await generateSerialNumber({ type: "invoice" });
      const receiptURL = `${process.env.FRONT_DOMAIN}sub-receipt?id=${receiptData.serialNumber}`;
      const invoiceURL = `${process.env.FRONT_DOMAIN}sub-invoice?id=${invoiceNumber}`;
      await Promise.all([
        ReceiptCollection.create(receiptData),
        ReceiptCollection.create({
          ...receiptData,
          type: "invoice",
          serialNumber: invoiceNumber,
        }),
      ]);

      paymentObject.receiptURL = receiptURL;
      reservationObject.receiptURL = receiptURL;
      const payment = await Payment.findOneAndUpdate(
        { _id: paymentId._id },
        { $set: paymentObject },
        { new: true }
      );
      reservationObject.paymentId = payment._id;
      const subscriptionResponse = await Subscription.findOneAndUpdate(
        { _id: ObjectId(subscriptionId) },
        {
          isSubscriptionActive: true,
          paymentId: payment._id,
          defaultPaymentMethodId: paymentObject.paymentMethodId,
          subscriptionNumber: subscriptionNumber,
          subscriptionStatus: "active",
          paymentMethodType: "card",
          receiptURL,
          invoiceURL,
          isEmailSend: true,
          isSMSSend: true,
          isBallparkUpdate: true,
          isSlackUpdate: true,
        },
        { new: true }
      );

      const shortlyData = await Shortly.findOne({ shortlyId: subscription.shortlyId });
      reservationObject.noOfPasses = shortlyData.noOfPasses;

      await Reservation.create(reservationObject);


      if (get(subscription, "customerId.isEmailPrimary", false)) {
        await SendAttachmentEmail({
          type: "paymentConfirmation",
          attachmentData: receiptData,
        });
      } else {
        const mobileNumber = get(subscription, "customerId.mobile", false);
        if (mobileNumber && !isEmpty(mobileNumber)) {
          const licensePlateArray = get(subscription, "licensePlate", []).filter(
            (obj) => obj.status === 10
          );
          const plivoNumber = get(placeId, "plivoNumber", false);
          const props = {
            from: plivoNumber,
            to: mobileNumber,
            body: `
              Your payment for your parking subscription with ${get(
                brandId,
                "brandName",
                ""
              )} at ${get(
              placeId,
              "google.formatted_address",
              ""
            )} has been processed.
              Parker Name: ${get(
                subscription,
                "customerId.firstName",
                ""
              )} ${get(subscription, "customerId.lastName", "")}
              Amount: ₨${amountToShow(revenue.totalAmount)}
              License Plate(s): ${licensePlateArray}
              Start Date: ${moment(subscription.startDate).format("MM/DD/YYYY")}
              End Date: ${moment(subscription.endDate).format("MM/DD/YYYY")}
              To access a receipt for this transaction, please click on button below and access your parker dashboard.
              https://www.spot-sync.com/parker-login`,
          };
          await sendMessage(props);
          const props2 = {
            from: plivoNumber,
            to: mobileNumber,
            body: `
              To help you get acquainted with the Parker Dashboard, please click the link below for a step-by-step guide, containing useful tips and instructions on how to navigate your way through your dashboard.
              https://drive.google.com/file/d/1tOuAkESnRJ9LOhWX3sQU_577chpyUsU-/view?usp=drive_link
              `,
          };
          await sendMessage(props2);
        }
      }


      return res.status(http200).json({
        success: true,
        message: "Payment Success",
        data: subscriptionResponse,
      });
    }
  } catch (error) {
    console.log('refundPayment error.message ===>', error?.message)
    console.log('refundPayment error.stack ===>', error?.stack)
    return res.status(http400).json({
      success: false,
      message: error?.message || 'Something went wrong!'
    })
  }
}
