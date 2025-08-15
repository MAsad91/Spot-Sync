const { http200, http400 } = require("../../../global/errors/httpCodes");
const { Types: { ObjectId } } = require("mongoose");
const { get } = require("lodash");
const moment = require("moment");

// Models
const Shortly = require("../../../models/shortly");
// Session model removed - no longer needed for chatbot functionality
const Payments = require("../../../models/payments");
const Reservations = require("../../../models/reservations");
const ReceiptCollection = require("../../../models/receipts");

// Services
const { sendEmail } = require("../../../services/email");
const { sendMessage } = require("../../../services/plivo");
const { sendSlack } = require("../../../services/slack");
const { sendDiscord } = require("../../../services/discord");

// Functions
const { 
  generateSerialNumber,
  generateShortlyId,
  capitalizeFirstLetter,
  amountToShow 
} = require("../../../global/functions");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { body } = req;
    const { shortlyId, paymentIntent } = body;

    if (!shortlyId || !paymentIntent) {
      return res.status(http400).json({
        success,
        message: "Missing required fields: shortlyId, paymentIntent"
      });
    }

    // Find shortly data
    const shortlyData = await Shortly.findOne({
      shortlyId: shortlyId,
      isParking: true,
      purpose: "PARKING"
    }).populate("customerId placeId brandId rateId sessionId");

    if (!shortlyData) {
      return res.status(http400).json({
        success,
        message: "Invalid payment link or payment already processed"
      });
    }

    const {
      placeId,
      brandId,
      rateId,
      customerId,
      sessionId,
      licensePlate,
      totalAmount,
      baseRate,
      tax,
      cityTax,
      countyTax,
      serviceFee,
      ownerPayout,
              spotsyncRevenue,
      applicationFee,
      paymentGatewayFee,
      startDate,
      endDate
    } = shortlyData;

    // Generate receipt and transient numbers
    const receiptNumber = await generateSerialNumber({ type: "receipt" });
    const transientNumber = await generateSerialNumber({ type: "transient" });

    // Create receipt data
    const receiptData = {
      type: "receipt",
      transactionId: paymentIntent.id,
      serialNumber: receiptNumber,
      transientNumber: transientNumber,
      parkerMobile: shortlyData.phoneNumber,
      brandLogo: brandId.brandLogo,
      receiptColor: brandId.receiptColor,
      startDate: moment(startDate).tz(placeId.timeZoneId).format("MM/DD/YYYY hh:mm A"),
      endDate: moment(endDate).tz(placeId.timeZoneId).format("MM/DD/YYYY hh:mm A"),
      tax: tax / 100,
      cityTax: cityTax / 100,
      countyTax: countyTax / 100,
      serviceFee: serviceFee / 100,
      paymentGatewayFee: paymentGatewayFee / 100,
      total: totalAmount / 100,
      baseRate: baseRate / 100,
      brandName: brandId.brandName,
      brandAddress: brandId.brandAddress,
      brandMobile: brandId.ownerMobileNumber,
      companyName: customerId?.companyName || "",
      placeAddress: get(placeId, "google.formatted_address", ""),
      parkerName: `${customerId?.firstName || ""} ${customerId?.lastName || ""}`,
      parkerEmail: customerId?.email || "",
      licensePlates: [
        {
          licensePlateNumber: licensePlate,
          price: baseRate,
        },
      ],
      updatedServiceFee: serviceFee / 100,
      paymentData: moment().tz(placeId.timeZoneId).format("MM/DD/YYYY hh:mm A"),
    };

    const receiptURL = `${process.env.FRONT_DOMAIN}receipt?id=${receiptData.serialNumber}`;

    // Create payment record
    const paymentObject = {
      customerId: customerId._id,
      placeId: placeId._id,
      brandId: brandId._id,
      paymentMethodType: "card",
      amount: totalAmount,
      baseRate: baseRate,
      tax: tax,
      serviceFee: serviceFee,
      ownerPayout: ownerPayout,
              spotsyncRevenue: spotsyncRevenue,
      applicationFee: applicationFee,
      paymentGatewayFee: paymentGatewayFee,
      currency: "USD",
      paymentStatus: "success",
      status: 10,
      receiptNumber: receiptNumber,
      paymentDate: new Date(),
      transactionId: paymentIntent.id,
      paymentInfo: paymentIntent
    };

    const payment = await Payments.create(paymentObject);

    // Check if reservation already exists (for dashboard-created reservations)
    let reservation = null;
    if (shortlyData.reservationId) {
      // Update existing reservation
      reservation = await Reservations.findByIdAndUpdate(
        shortlyData.reservationId,
        {
          paymentId: payment._id,
          status: "success",
          receiptNumber: receiptNumber,
          transientNumber: transientNumber,
          transactionId: paymentIntent.id
        },
        { new: true }
      );
    } else {
                 // Create new reservation record
           const reservationObject = {
             customerId: customerId._id,
             placeId: placeId._id,
             brandId: brandId._id,
             rateId: rateId._id,
             paymentId: payment._id,
             startDate: startDate,
             endDate: endDate,
             totalAmount: totalAmount,
             baseRate: baseRate,
             tax: tax,
             cityTax: cityTax,
             countyTax: countyTax,
             serviceFee: serviceFee,
             ownerPayout: ownerPayout,
             spotsyncRevenue: spotsyncRevenue,
             applicationFee: applicationFee,
             paymentGatewayFee: paymentGatewayFee,
             paymentMethodType: "card",
             paymentStatus: "success",
             status: "success",
             receiptNumber: receiptNumber,
             receiptURL: receiptURL,
             transientNumber: transientNumber,
             licensePlate: [licensePlate],
             purpose: "PARKING",
             externalKey: `${generateShortlyId()}_${licensePlate}`,
             ballparkValidateDate: new Date(),
             transactionId: paymentIntent.id,
                            hours: shortlyData.hours || 1,
               noOfPasses: 1,
               isValidationApplied: false,
               isPaymentOnHold: false,
               discountPercentage: 0,
               transactionDate: new Date(),
               ridersLastName: customerId.lastName || ""
           };

      reservation = await Reservations.create(reservationObject);
    }

    // Update shortly with success status
    await Shortly.findOneAndUpdate(
      { shortlyId: shortlyId },
      {
        paymentStatus: "success",
        receiptNumber: receiptNumber,
        paymentId: payment._id,
        reservationId: reservation._id,
        transientNumber: transientNumber,
        paymentMethodType: "card",
        transactionId: paymentIntent.id
      }
    );



    // Create receipt
    await ReceiptCollection.create(receiptData);

    // Send confirmation email and SMS
    try {
      await sendEmail({
        to: customerId.email,
        subject: "Payment Confirmation - Reservation Created",
        templateId: "d-f5345bae0b4c40b997617aa33889eaad", // PAYMENT_CONFIRMATION_TEMPLATE
      })({
        customerName: capitalizeFirstLetter(customerId.firstName || "Customer"),
        reservationNumber: transientNumber,
        receiptNumber: receiptNumber,
        totalAmount: amountToShow(totalAmount),
        startDate: moment(startDate).format("MMM DD, YYYY hh:mm A"),
        endDate: moment(endDate).format("MMM DD, YYYY hh:mm A"),
        brandName: brandId.brandName,
        placeName: placeId.google?.formatted_address || placeId.address?.formatted_address || "Unknown Address",
        paymentMethod: "Card",
        collectedBy: "Online Payment"
      });

      // Send SMS
      if (shortlyData.phoneNumber) {
        const plivoNumber = get(placeId, "plivoNumber", false);
        await sendMessage({
          from: plivoNumber,
          to: shortlyData.phoneNumber,
          body: `Thank You! Your payment for license plate ${licensePlate} has been processed! 
          Total: ₨${amountToShow(totalAmount)}
          Start time: ${receiptData.startDate}
          End time: ${receiptData.endDate}
          ${receiptURL}`
        });
      }

      // Send Slack notification
      const slackMessage = `Payment received -
        Place: ${receiptData.placeAddress}
        License plate: ${licensePlate}
        Mobile: ${shortlyData.phoneNumber}
        Total: $${receiptData.total}
        Start time: ${receiptData.startDate}
        End time: ${receiptData.endDate}
        Receipt - ${receiptURL}`;

      await sendSlack({
        purpose: "Payment Confirmation",
        placeId: placeId._id,
        message: slackMessage,
      });

      // Send Discord notification
      await sendDiscord({
        purpose: "Payment Confirmation",
        placeId: placeId._id,
        message: slackMessage,
      });

    } catch (error) {
      console.error("Error sending notifications:", error);
    }

    return res.status(http200).json({
      success: true,
      message: "Payment processed successfully",
      data: {
        reservationId: reservation._id,
        receiptNumber: receiptNumber,
        transientNumber: transientNumber,
        totalAmount: totalAmount,
        status: "success",
        receiptURL: receiptURL
      }
    });

  } catch (error) {
    console.error("Error processing reservation payment:", error);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
}; 