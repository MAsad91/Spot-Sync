const Validation = require("../../../../models/validations");
const ReceiptCollection = require("../../../../models/receipts");
const ValidationSession = require("../../../../models/validationSession");
const Payment = require("../../../../models/payments");
const Reservation = require("../../../../models/reservations");
const Shortly = require("../../../../models/shortly");
// Session model removed - no longer needed for chatbot functionality
const { http200, http400 } = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
} = require("mongoose");
const { get } = require("lodash");
const {
  amountToShow,
  generateSerialNumber,
  generateShortlyId,
} = require("../../../../global/functions");
const { sendMessage } = require("../../../../services/plivo");
const { getRateDuration } = require("../../../../services/rateDuration");
const { sendSlack } = require("../../../../services/slack");
const { sendDiscord } = require("../../../../services/discord");
const moment = require("moment-timezone");
const Authorizenet = require("../../../../services/authorizenet");

const { getWithDefault } = require("../../../../services/utilityService");
// Simple replacements for chatbot functions
const messageBotCopy = async () => ({ success: false, textMessage: "" });
const dynamicVariableReplacer = (messages, variables) => {
  if (!Array.isArray(messages)) return [messages];
  return messages.map(message => {
    let result = message;
    Object.keys(variables).forEach(key => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), variables[key] || '');
    });
    return result;
  });
};

module.exports = async (req, res) => {
  let success = false;
  try {
    const { body } = req;

    const { paymentToken, paymentProfileId, shortlyId } = body;

    if (!shortlyId) {
      return res.status(http400).json({
        success,
        message: "Invalid Payment",
      });
    }

    let shortlyData = await Shortly.findOne({
      isParking: true,
      _id: ObjectId(shortlyId),
      customerId: ObjectId(body.customerId),
    }).populate("customerId placeId brandId rateId sessionId");

    if (!shortlyData) {
      return res.status(http400).json({
        success,
        message: "Invalid Payment",
      });
    }
    const {
      placeId,
      licensePlate,
      baseRate,
      brandId,
      rateId,
      sessionId,
      isExtension,
      isPayNowValidationLaterFlow,
      customerId,
    } = shortlyData;

    const authorizenet = new Authorizenet(placeId);

    if (paymentProfileId) {
      await authorizenet.setPaymentProfile(customerId, paymentProfileId);
    } else {
      let response = await authorizenet.createPaymentProfileViaToken(
        customerId,
        paymentToken
      );
      if (!response.success) {
        return res.status(http400).json({
          success: false,
          message: response.message,
        });
      }
    }

    const paymentProfile = authorizenet.getAuthorizeNetProfile(customerId);

    const mobile = get(sessionId, "phoneNumber", false);
    const rateDuration = await getRateDuration({
      rate: rateId,
      tz: placeId.timeZoneId,
      hours: get(sessionId, "hours", 0),
      parentReservationId: get(shortlyData, "reservationId", ""),
      isExtension,
    });

    console.log(
      "isPayNowValidationLaterFlow ===>",
      isPayNowValidationLaterFlow
    );

    const currentDate = moment().utc();
    const gracePeriod = get(rateId, "gracePeriod", 0);
    const gracePeriodExpirationDate = moment(currentDate)
      .add(gracePeriod, "minutes")
      .utc()
      .format();

    let paymentObject = {
      customerId: customerId._id,
      purpose: "PARKING",
      shortlyId: shortlyData?.shortlyId,
      authorizenetCustomerId: paymentProfile.profileId,
      paymentMethodId: paymentProfile.paymentProfileId,
      paymentMethodType: "card",
      placeId: placeId._id,
      licensePlate: [{ licensePlateNumber: licensePlate, price: baseRate }],
      isApplyTax: get(shortlyData, "isApplyTax", false),
      isApplyServiceFee: get(shortlyData, "isApplyServiceFee", false),
      isApplyTaxOnServiceFee: get(shortlyData, "isApplyTaxOnServiceFee", false),
      paymentGatewayFeePayBy: get(
        shortlyData,
        "paymentGatewayFeePayBy",
        "isbp"
      ),
      baseRate: get(shortlyData, "baseRate", 0),
      tax: getWithDefault(shortlyData, "tax", 0),
      taxPercentage: getWithDefault(shortlyData, "taxPercentage", 0),
      cityTax: getWithDefault(shortlyData, "cityTax", 0),
      cityTaxPercentage: getWithDefault(shortlyData, "cityTaxPercentage", 0),
      countyTax: getWithDefault(shortlyData, "countyTax", 0),
      countyTaxPercentage: getWithDefault(
        shortlyData,
        "countyTaxPercentage",
        0
      ),
      serviceFee: get(shortlyData, "serviceFee", 0),
      ownerPayout: get(shortlyData, "ownerPayout", 0),
      isbpRevenue: get(shortlyData, "isbpRevenue", 0),
      applicationFee: get(shortlyData, "applicationFee", 0),
      paymentGatewayFee: get(shortlyData, "paymentGatewayFee", 0),
      totalAmount: get(shortlyData, "totalAmount", 0),
      startDate: rateDuration.utcStartDate,
      endDate: rateDuration.utcEndDate,
    };
    let reservationObject = {
      purpose: "PARKING",
      licensePlate: [licensePlate],
      shortlyId: shortlyData?.shortlyId,
      spaceNumber: get(shortlyData, "spaceNumber", ""),
      customerId,
      rateId: rateId._id,
      placeId: placeId._id,
      brandId: brandId._id,
      startDate: rateDuration.utcStartDate,
      endDate: rateDuration.utcEndDate,
      baseRate: get(shortlyData, "baseRate", 0),
      tax: getWithDefault(shortlyData, "tax", 0),
      taxPercentage: getWithDefault(shortlyData, "taxPercentage", 0),
      cityTax: getWithDefault(shortlyData, "cityTax", 0),
      cityTaxPercentage: getWithDefault(shortlyData, "cityTaxPercentage", 0),
      countyTax: getWithDefault(shortlyData, "countyTax", 0),
      countyTaxPercentage: getWithDefault(
        shortlyData,
        "countyTaxPercentage",
        0
      ),
      serviceFee: get(shortlyData, "serviceFee", 0),
      ownerPayout: get(shortlyData, "ownerPayout", 0),
      isbpRevenue: get(shortlyData, "isbpRevenue", 0),
      applicationFee: get(shortlyData, "applicationFee", 0),
      paymentGatewayFee: get(shortlyData, "paymentGatewayFee", 0),
      totalAmount: get(shortlyData, "totalAmount", 0),
      paymentMethodType: "card",
      withoutDiscounted: shortlyData.withoutDiscounted,
      paymentMethodId: paymentProfile.paymentProfileId,
    };
    let receiptData = {
      parkerMobile: mobile,
      brandLogo: get(brandId, "brandLogo", ""),
      receiptColor: get(brandId, "receiptColor", "#00ab6b"),
      startDate: moment(rateDuration.utcStartDate)
        .tz(placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A"),
      endDate: moment(rateDuration.utcEndDate)
        .tz(placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A"),
      tax: `${getWithDefault(shortlyData, "tax", 0) / 100}`,
      cityTax: `${getWithDefault(shortlyData, "cityTax", 0) / 100}`,
      countyTax: `${getWithDefault(shortlyData, "countyTax", 0) / 100}`,
      serviceFee:
        get(shortlyData, "paymentGatewayFeePayBy", "isbp") === "customer"
          ? (
              (get(shortlyData, "paymentGatewayFee", 0) +
                shortlyData.serviceFee) /
              100
            ).toFixed(2)
          : `${shortlyData.serviceFee / 100}`,
      total: `${amountToShow(shortlyData.totalAmount)}`,
      baseRate: `${amountToShow(shortlyData.baseRate)}`,
      brandName: `${get(brandId, "brandName", "")}`,
      brandAddress: `${get(brandId, "brandAddress", "")}`,
      brandMobile: `${get(brandId, "ownerMobileNumber", "")}`,
      companyName: `${get(shortlyData, "customerId.companyName", "")}`,
      placeAddress: get(placeId, "google.formatted_address", ""),
      discount: 0,
      licensePlates: [{ licensePlateNumber: licensePlate, price: baseRate }],
      updatedServiceFee:
        get(shortlyData, "paymentGatewayFeePayBy", "isbp") === "customer"
          ? (
              (get(shortlyData, "paymentGatewayFee", 0) +
                shortlyData.serviceFee) /
              100
            ).toFixed(2)
          : `${shortlyData.serviceFee / 100}`,
    };
    if (shortlyData.isValidationApplied) {
      const discount =
        shortlyData?.withoutDiscounted?.totalAmount - shortlyData.totalAmount;
      reservationObject.isValidationApplied = true;
      reservationObject.validationCode = shortlyData.validationCode;
      reservationObject.discountPercentage = shortlyData.discountPercentage;
      reservationObject.validationId = shortlyData.validationId;
      receiptData.isValidationApplied = true;
      receiptData.validationCode = shortlyData.validationCode;
      receiptData.discountPercentage = shortlyData.discountPercentage;
      receiptData.discount = amountToShow(discount);
    }
    if (isExtension) {
      reservationObject.parentReservationId = get(
        shortlyData,
        "reservationId",
        ""
      );
    }

    let paymentIntent = {};
    if (isPayNowValidationLaterFlow) {
      paymentIntent = await authorizenet.authorizePayment(
        customerId,
        shortlyData.totalAmount / 100
      );
    } else {
      paymentIntent = await authorizenet.chargeCustomerProfile(
        customerId,
        shortlyData.totalAmount / 100
      );
    }
    const transactionId = paymentIntent.data?.transactionResponse?.transId;
    console.log("paymentIntent ===>", paymentIntent);

    let receiptNumber;
    let transientNumber;
    if (!paymentIntent.success) {
      const transactionDate = moment.utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

      paymentObject.paymentStatus = "failed";
      paymentObject.paymentInfo = paymentIntent.data;
      paymentObject.transactionId = transactionId;
      paymentObject.transactionDate = transactionDate;
      reservationObject.transactionId = transactionId;
      reservationObject.transactionDate = transactionDate;
      const payment = await Payment.create(paymentObject);
      shortlyData = await Shortly.findOneAndUpdate(
        { _id: ObjectId(shortlyId) },
        {
          expireOn: moment(),
        }
      );

      reservationObject.status = "failed";
      reservationObject.paymentId = payment._id;
      await Reservation.create(reservationObject);
      const slackMessage = `Payment Failed -
      Place: ${receiptData.placeAddress}
      License plate: ${licensePlate}
      Mobile: ${mobile}
      Total: $${receiptData.total}
      Start time: ${moment(rateDuration.utcStartDate)
        .tz(placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A")}
      End time: ${moment(rateDuration.utcEndDate)
        .tz(placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A")}
      
      Reason - ${paymentIntent.message}`;
      await sendSlack({
        purpose: "Payment Confirmation",
        placeId: placeId?._id,
        message: slackMessage,
      });
      await sendDiscord({
        purpose: "Payment Confirmation",
        placeId: placeId?._id,
        message: slackMessage,
      });

      return res.status(http400).json({
        success: paymentIntent.success,
        message: paymentIntent.message,
      });
    } else {
      const transactionDate = moment.utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

      receiptNumber = await generateSerialNumber({ type: "receipt" });
      transientNumber = await generateSerialNumber({ type: "transient" });
      receiptData.serialNumber = receiptNumber;
      receiptData.transientNumber = transientNumber;
      paymentObject.transientNumber = transientNumber;
      reservationObject.transientNumber = transientNumber;
      receiptData.type = "receipt";
      paymentObject.paymentStatus = isPayNowValidationLaterFlow
        ? "initialize"
        : "success";
      reservationObject.status = isPayNowValidationLaterFlow
        ? "initialize"
        : "success";
      paymentObject.paymentInfo = paymentIntent.data;
      paymentObject.transactionId = paymentIntent.data?.id;
      paymentObject.transactionDate = transactionDate;
      reservationObject.transactionId = paymentIntent.data?.id;
      reservationObject.transactionDate = transactionDate;
      reservationObject.gracePeriodExpirationDate = gracePeriodExpirationDate;
      reservationObject.isPaymentOnHold = isPayNowValidationLaterFlow;
      receiptData.paymentData = moment
        .tz(transactionDate, placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A");
      receiptData.transactionId = paymentIntent.data?.id;
      receiptData.spaceNumber = get(shortlyData, "spaceNumber", "");

      const receiptURL = `${process.env.FRONT_DOMAIN}receipt?id=${receiptData.serialNumber}`;
      await ReceiptCollection.create(receiptData),
        console.log("receiptURL ---->", receiptURL);
      paymentObject.receiptURL = receiptURL;
      reservationObject.receiptURL = receiptURL;

      console.log("paymentObject ===>", paymentObject);

      const payment = await Payment.create(paymentObject);
      reservationObject.paymentId = payment._id;

      const randomString = generateShortlyId();
      const externalKey = `${randomString}_${shortlyData.licensePlate}`;
      const updateDate = moment().utc().toDate();
      reservationObject.externalKey = externalKey;
      reservationObject.ballparkValidateDate = updateDate;
      const reservation = await Reservation.create(reservationObject);
      shortlyData = await Shortly.findOneAndUpdate(
        { _id: ObjectId(shortlyId) },
        {
          paymentStatus: isPayNowValidationLaterFlow ? "initialize" : "success",
          receiptURL,
          receiptNumber: receiptData.serialNumber,
          paymentId: payment._id,
          reservationId: reservation._id,
          transientNumber,
          transactionDate,
          paymentMethodType: "card",
          transactionId: paymentIntent.data?.id,
          gracePeriodExpirationDate,
        },
        { new: true }
      );

      if (shortlyData.isValidationApplied) {
        await Validation.findOneAndUpdate(
          { _id: ObjectId(shortlyData.validationId) },
          { $inc: { quantity: -1 } }
        );
      }
      let responseMessages = [""];
      if (!isPayNowValidationLaterFlow) {
        await ValidationSession.findOneAndUpdate(
          { "shortlyData.shortlyId": shortlyData.shortlyId },
          { $set: { status: 0 } }
        );
      } else {
        let validationLink = "";
        validationLink = `${process.env.DASHBOARD_DOMAIN}/parking/validation?ref=${shortlyData.shortlyId}_validate`;
        const messageResponse = await messageBotCopy({
          purpose: "After LicensePlate Submission SMS (Two Step Validation)",
          placeId: placeId._id,
          tz: placeId.timeZoneId,
        });
        if (messageResponse.success) {
          responseMessages = dynamicVariableReplacer(
            [messageResponse.textMessage],
            {
              displayName: rateId.displayName || "",
              rateTitle: rateId.title || "",
              licensePlate: shortlyData.licensePlate,
              totalAmount: amountToShow(shortlyData.totalAmount ?? 0),
              validationLink: validationLink,
            }
          );
        }

        const validationObject = {
          shortlyData,
          place: placeId,
          brand: brandId,
          rate: rateId,
          customer: shortlyData.customerId,
          validationLink,
          toNumber: shortlyData.phoneNumber,
          fromNumber: get(placeId, "plivoNumber", false),
          licensePlate: shortlyData.licensePlate,
          triggerDate: gracePeriodExpirationDate,
          withoutDiscountedRevenue: shortlyData.withoutDiscounted,
        };
        await ValidationSession.create(validationObject);
      }

      if (mobile) {
        const plivoNumber = get(placeId, "plivoNumber", false);
        const confirmationSMS = `Thank You! Your payment for license plate ${licensePlate} has been processed! 
        Total: $${receiptData.total}
        Start time: ${receiptData.startDate}
        End time: ${receiptData.endDate}
        ${receiptURL}`;
        const props = {
          from: plivoNumber,
          to: mobile,
          body: isPayNowValidationLaterFlow
            ? responseMessages.join("")
            : confirmationSMS,
        };
        await sendMessage(props);
      }
      const slackMessage = `Payment received -
      Place: ${receiptData.placeAddress}
      License plate: ${licensePlate}
      Mobile: ${mobile}
      Total: $${receiptData.total}
      Start time: ${moment(rateDuration.utcStartDate)
        .tz(placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A")}
      End time: ${moment(rateDuration.utcEndDate)
        .tz(placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A")}
      
      Receipt - ${receiptURL}`;

      await sendSlack({
        purpose: "Payment Confirmation",
        placeId: placeId?._id,
        message: slackMessage,
      });
      await sendDiscord({
        purpose: "Payment Confirmation",
        placeId: placeId?._id,
        message: slackMessage,
      });
      

      return res.status(http200).json({
        success: true,
        message: "Payment Success",
        data: shortlyData,
      });
    }
  } catch (error) {
    console.log("error ====>", error);
    console.log("stack ====>", error.stack);
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
