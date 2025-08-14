const { get } = require("lodash");
const {
  Types: { ObjectId },
} = require("mongoose");
const errorLogs = require("../../models/errorLogs");
const ReservationsCollection = require("../../models/reservations");
const ShortlyCollection = require("../../models/shortly");
const PaymentCollection = require("../../models/payments");
const { capturePaymentForValidationFlow } = require("../../services/stripe");
const moment = require("moment");
const { sendMessage } = require("../../services/plivo");
const { sendSlack } = require("../../services/slack");
const { amountToShow } = require("../../global/functions");
const Authorizenet = require("../../services/authorizenet");

const CapturePaymentForValidationLaterFLow = async () => {
  try {
    const currentDate = moment().utc().toDate();
    const query = {
      isPaymentOnHold: true,
      status: "initialize",
      gracePeriodExpirationDate: { $lt: currentDate },
    };

    const reservations = await ReservationsCollection.find(query)
      .populate("placeId customerId")
      .lean();

    if (reservations.length === 0) {
      return { success: true, message: "No reservation to capture." };
    }

    let count = 0;
    const failedToCapture = [];
    const Promises = reservations.map(async (reservation) => {
      try {
        const {
          totalAmount,
          transactionId,
          paymentId,
          placeId,
          customerId,
          receiptURL,
        } = reservation;

        let paymentObject = {};
        let reservationObject = {};
        const stripeProps = {
          total: totalAmount || 0,
          transactionId: transactionId || "",
          place: placeId,
        };
        
        let paymentIntent = {}

        if (placeId?.paymentGateway === "AUTHORIZENET") {
          const authorizenet = new Authorizenet(placeId);
          paymentIntent = await authorizenet.captureAuthorizedPayment(
            customerId,
            totalAmount / 100,
            transactionId
          )
        }
        else {
          paymentIntent = await capturePaymentForValidationFlow(
            stripeProps
          );
        }

        let transactionDate = moment()
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

        if (!paymentIntent.success) {
          if (paymentIntent.data?.payment_intent?.created) {
            transactionDate = moment
              .unix(paymentIntent.data.payment_intent.created)
              .utc()
              .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
          }

          paymentObject.paymentStatus = "failed";
          paymentObject.paymentInfo = paymentIntent.data;
          paymentObject.transactionId =
            paymentIntent.data?.payment_intent?.id || "";
          paymentObject.transactionDate = transactionDate;

          await PaymentCollection.findOneAndUpdate(
            { _id: ObjectId(paymentId) },
            paymentObject
          );

          reservationObject.status = "failed";
          reservationObject.transactionDate = transactionDate;

          await ReservationsCollection.findOneAndUpdate(
            { _id: ObjectId(reservation._id) },
            reservationObject
          );
        } else {
          if (paymentIntent.data?.created) {
            transactionDate = moment
              .unix(paymentIntent.data.created)
              .utc()
              .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
          }

          paymentObject.paymentStatus = "success";
          reservationObject.status = "success";
          paymentObject.paymentInfo = paymentIntent.data;
          paymentObject.transactionId = paymentIntent.data?.id || "";
          paymentObject.transactionDate = transactionDate;
          reservationObject.transactionId = paymentIntent.data?.id || "";
          reservationObject.transactionDate = transactionDate;
          reservationObject.gracePeriodExpirationDate = null;
          reservationObject.isPaymentOnHold = false;

          await PaymentCollection.findOneAndUpdate(
            { _id: ObjectId(reservation.paymentId) },
            paymentObject
          );

          await ReservationsCollection.findOneAndUpdate(
            { _id: ObjectId(reservation._id) },
            reservationObject
          );

          await ShortlyCollection.findOneAndUpdate(
            { shortlyId: reservation.shortlyId },
            { paymentStatus: "success" }
          );

          const plivoNumber = placeId?.plivoNumber || "";
          const phoneNumber = customerId?.mobile || "";
          const smsPromise = phoneNumber
            ? sendMessage({
                from: plivoNumber,
                to: phoneNumber,
                body: `Thank You! Your payment for license plate ${get(
                  reservation,
                  "licensePlate",
                  []
                ).join(",")} has been processed! Total: $${amountToShow(
                  totalAmount || 0
                )} ${receiptURL || ""}`,
              })
            : Promise.resolve();

          const slackMessage = `Payment received -
            Place: ${get(placeId, "google.formatted_address", "")}
            License plate: ${get(reservation, "licensePlate", []).join(",")}
            Mobile: ${phoneNumber}
            Total: $${amountToShow(totalAmount || 0)}
            Receipt - ${receiptURL || ""}`;

          const slackPromise = sendSlack({
            purpose: "Payment Confirmation",
            placeId: placeId?._id,
            message: slackMessage,
          });

          await Promise.all([smsPromise, slackPromise]);
        }

        count++;
      } catch (error) {
        failedToCapture.push(reservation._id);
        await errorLogs.create({
          reservationId: reservation._id,
          from: "validationLaterPaymentCapture",
          type: "cron",
          errorMessage: error.message,
          error,
        });
      }
    });

    await Promise.all(Promises);

    return {
      success: true,
      message: `Captured payment for ${count} reservations out of ${reservations.length}`,
      failedToCapture: failedToCapture,
    };
  } catch (error) {
    console.error("Error in capture payment:", error);
    return {
      success: false,
      message: error.message || "Something went wrong!",
    };
  }
};

module.exports = CapturePaymentForValidationLaterFLow;
