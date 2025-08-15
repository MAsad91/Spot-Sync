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
  attachPaymentMethodToCustomer,
  createPaymentIntent,
  getOrCreateDCCustomer,
  getStripeCustomerId,
} = require("../../../services/stripe");
const { get, isEmpty } = require("lodash");
const {
  amountToShow,
  generateSerialNumber,
  getSubscriptionDuration,
  getDatesFromDuration,
  getTimezoneName,
} = require("../../../global/functions");
const { sendMessage } = require("../../../services/plivo");

const { isDirectChargePayment } = require("../../../services/revenue");
const { getWithDefault } = require("../../../services/utilityService");
const JazzCash = require("../../../services/jazzCash");
const EasyPaisa = require("../../../services/easyPaisa");
const SendAttachmentEmail = require("../../../services/APIServices/sendAttachmentEmail");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { body } = req;
    const { customerId, subscriptionId, paymentMethodId, saveCard } = body;
    if (!customerId || !subscriptionId) {
      return res.status(http400).json({
        success,
        message: "Invalid Payment",
      });
    }

    const subscription = await Subscription.findOne({
      _id: ObjectId(subscriptionId),
    }).populate({
      path: "customerId placeId brandId paymentId",
    });

    if (!subscription) {
      return res.status(http400).json({
        success,
        message: "Invalid Payment",
      });
    }

    const {
      isMonthly,
      placeId,
      brandId,
      firstMonthTax,
      tax,
      cityTax,
      firstMonthCityTax,
      countyTax,
      firstMonthCountyTax,
      firstMonthBaseRate,
      baseRate,
      firstMonthServiceFee,
      serviceFee,
      firstMonthOwnerPayout,
      ownerPayout,
              firstMonthSpotsyncRevenue,
        spotsyncRevenue,
      firstMonthApplicationFee,
      applicationFee,
      firstMonthPaymentGatewayFee,
      paymentGatewayFee,
      firstMonthTotalAmount,
      totalAmount,
      shortlyId,
    } = subscription;
    let revenue = {
      tax: isMonthly ? firstMonthTax : tax,
      cityTax: isMonthly ? firstMonthCityTax : cityTax,
      countyTax: isMonthly ? firstMonthCountyTax : countyTax,
      serviceFee: isMonthly ? firstMonthServiceFee : serviceFee,
      baseRate: isMonthly ? firstMonthBaseRate : baseRate,
      ownerPayout: isMonthly ? firstMonthOwnerPayout : ownerPayout,
              spotsyncRevenue: isMonthly ? firstMonthSpotsyncRevenue : spotsyncRevenue,
      applicationFee: isMonthly ? firstMonthApplicationFee : applicationFee,
      paymentGatewayFee: isMonthly ? firstMonthPaymentGatewayFee : paymentGatewayFee,
      totalAmount: isMonthly ? firstMonthTotalAmount : totalAmount,
    };

    let paymentObject = {
      customerId,
      purpose: "SUBSCRIPTION",
      subscriptionId,
      shortlyId: get(subscription, "shortlyId", ""),
      paymentMethodId,
      paymentMethodType: "card",
      subscriptionId: subscription._id,
      stripeCustomerId: await getStripeCustomerId(subscription.customerId, placeId),
      placeId: placeId._id,
      licensePlate: get(subscription, "licensePlate", []),
      isApplyTax: get(subscription, "isApplyTax", false),
      isApplyServiceFee: get(subscription, "isApplyServiceFee", false),
      isApplyTaxOnServiceFee: get(
        subscription,
        "isApplyTaxOnServiceFee",
        false
      ),
      paymentGatewayFeePayBy: subscription.paymentGatewayFeePayBy,
      baseRate: get(revenue, "baseRate", 0),
      tax: getWithDefault(revenue, "tax", 0),
      taxPercentage: getWithDefault(subscription, "taxPercentage", 0),
      cityTax: getWithDefault(revenue, "cityTax", 0),
      cityTaxPercentage: getWithDefault(subscription, "cityTaxPercentage", 0),
      countyTax: getWithDefault(revenue, "countyTax", 0),
      countyTaxPercentage: getWithDefault(
        subscription,
        "countyTaxPercentage",
        0
      ),
      serviceFee: get(revenue, "serviceFee", 0),
      ownerPayout: get(revenue, "ownerPayout", 0),
      isbpRevenue: get(revenue, "isbpRevenue", 0),
      applicationFee: get(revenue, "applicationFee", 0),
      paymentGatewayFee: get(revenue, "paymentGatewayFee", 0),
      totalAmount: get(revenue, "totalAmount", 0),
    };
    let reservationObject = {
      purpose: "SUBSCRIPTION",
      licensePlate: subscription?.licensePlate
        .filter((obj) => obj.status === 10)
        .map((obj) => obj.licensePlateNumber),
      subscriptionId: subscription._id,
      customerId: customerId,
      placeId: placeId._id,
      baseRate: get(revenue, "baseRate", 0),
      tax: getWithDefault(revenue, "tax", 0),
      cityTax: getWithDefault(revenue, "cityTax", 0),
      countyTax: getWithDefault(revenue, "countyTax", 0),
      serviceFee: get(revenue, "serviceFee", 0),
      ownerPayout: get(revenue, "ownerPayout", 0),
      isbpRevenue: get(revenue, "isbpRevenue", 0),
      applicationFee: get(revenue, "applicationFee", 0),
      paymentGatewayFee: get(revenue, "paymentGatewayFee", 0),
      totalAmount: get(revenue, "totalAmount", 0),
      brandId: brandId._id,
      startDate: moment(subscription?.startDate).utc().format(),
      endDate: moment(subscription?.endDate).utc().format(),
    };

    const duration = getSubscriptionDuration({
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      timezone: getTimezoneName(),
    });
    const dates = getDatesFromDuration({ duration });
    let paymentGatewayFeeForReceipt = 0;
    if (get(placeId, "paymentGatewayFeePayBy", "isbp") === "customer") {
      if (subscription.renewalCount === 0 && subscription.isMonthly) {
        paymentGatewayFeeForReceipt = subscription.firstMonthPaymentGatewayFee;
      } else {
        paymentGatewayFeeForReceipt = subscription.paymentGatewayFee;
      }
    }
    let receiptData = {
      subscriptionType: subscription.isMonthly ? "Monthly" : "Custom",
      toEmail: get(subscription, "customerId.email", ""),
      parkerName: `${get(subscription, "customerId.firstName", "")} ${get(
        subscription,
        "customerId.lastName",
        ""
      )}`,
      brandLogo: get(subscription, "brandLogo", ""),
      startDate: dates.startDate,
      endDate: dates.endDate,
      tax: amountToShow(getWithDefault(revenue, "tax", 0)),
      cityTax: amountToShow(getWithDefault(revenue, "cityTax", 0)),
      countyTax: amountToShow(getWithDefault(revenue, "countyTax", 0)),
      serviceFee: amountToShow(get(revenue, "serviceFee", 0)),
      paymentGatewayFee: `${amountToShow(paymentGatewayFeeForReceipt)}`,
      total: amountToShow(get(revenue, "totalAmount", 0)),
      baseRate: amountToShow(get(revenue, "baseRate", 0)),
      brandName: get(brandId, "brandName", ""),
      brandAddress: get(brandId, "brandAddress", ""),
      brandMobile: get(brandId, "ownerMobileNumber", ""),
      companyName: get(subscription, "customerId.companyName", ""),
      parkerEmail: get(subscription, "customerId.email", ""),
      autoRenew: get(subscription, "isAutoRenew", false),
      nextRenewalDate: dates.nextRenewalDate,
      placeAddress: get(placeId, "google.formatted_address", ""),
      discount: 0,
      licensePlates: get(subscription, "licensePlate", []).filter(
        (obj) => obj.status === 10
      ),
      updatedServiceFee:
        get(subscription, "paymentGatewayFeePayBy", "isbp") === "customer"
          ? (
              (paymentGatewayFeeForReceipt + subscription.serviceFee) /
              100
            ).toFixed(2)
          : `${subscription.serviceFee / 100}`,
    };

    const directChargePayment = isDirectChargePayment(placeId, subscription);
    const stripeProps = {
      total: get(revenue, "totalAmount", 0),
      applicationFeeAmount: get(revenue, "applicationFee", 0),
      connectedAccountId: get(
        placeId,
        "connectAccountId",
        "acct_1OmGEqH75gj1EHDr"
      ),
      customerId: await getStripeCustomerId(subscription.customerId, placeId),
      customer: subscription.customerId,
      place: placeId,
      directChargePayment,
      currency: "pkr",
      metadata: {
        mobile: get(subscription, "customerId.mobile", ""),
        email: get(subscription, "customerId.email", ""),
        subscriptionId: subscription._id.toString(),
        shortlyId: subscription.shortlyId,
        Purpose: "SUBSCRIPTION",
        parkingCode: get(subscription, "placeId.parkingCode", ""),
        paymentMethodType: "card",
        statement_descriptor: get(
          subscription,
          "placeId.statementDescriptor",
          false
        ),
        placeAddress: get(placeId, "google.formatted_address", ""),
      },
      paymentMethodId: paymentMethodId,
      is3DsecureHandled: true,
    };

    if (saveCard === true) {
      await attachPaymentMethodToCustomer(
        stripeProps.customerId,
        stripeProps.paymentMethodId,
        placeId
      );
    }

    let paymentIntent;
    // Pakistan payment gateways
    if (subscription.placeId.paymentGateway === "JAZZ_CASH") {
      const jazzCash = new JazzCash(subscription.placeId);
      paymentIntent = await jazzCash.chargeCustomer(
        subscription.customerId,
        totalAmount / 100
      );
    } else {
      if (directChargePayment) {
        const connectAccountId = get(
          subscription,
          "placeId.connectAccountId",
          "acct_1OmGEqH75gj1EHDr"
        );
        const customerDCProfile = await getOrCreateDCCustomer(
          subscription.customerId,
          connectAccountId,
          paymentMethodId,
          placeId
        );

        paymentObject.stripeCustomerId = customerDCProfile.customerId;
        paymentObject.paymentMethodId = customerDCProfile.paymentMethodId;
        paymentObject.isDirectCharge = true;
        paymentObject.connectAccountId = connectAccountId;
      }

      paymentIntent = await createPaymentIntent(stripeProps);
    }

    console.log("paymentIntent ->>", paymentIntent);

    if (get(paymentIntent, "data.status", "") === 'requires_action' ||
          get(paymentIntent, "data.status", "") === 'requires_source_action') {
      let transactionDate = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      if (paymentIntent.data?.created) {
        transactionDate = moment
          .unix(paymentIntent.data.created)
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      }

      paymentObject.transactionDate = transactionDate;
      paymentObject.paymentStatus = "requires_action";
      paymentObject.paymentInfo = paymentIntent.data;
      paymentObject.transactionId = paymentIntent.data?.id;
      
      reservationObject.transactionId = paymentIntent.data?.id;
      reservationObject.transactionDate = transactionDate;

      transferData = paymentIntent.transferData
      const payment = await Payment.create(paymentObject);

      const securePaymentData = await SecurePaymentData.create({
        placeId,
        paymentId: payment,
        customerId,
        subscriptionId,
        reservationObject,
        receiptData,
        stripeProps,
        transferData
      })

      return res.json({
        success: true,
        clientSecret: get(paymentIntent, "data.client_secret", ""),
        requiresAction: true,
        securePaymentDataId: securePaymentData._id
      });
    }

    let subscriptionNumber;
    let receiptNumber;
    let transactionDate = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    if (!paymentIntent.success) {
      if (paymentIntent.data?.payment_intent?.created) {
        transactionDate = moment
          .unix(paymentIntent.data.payment_intent.created)
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      }
      paymentObject.paymentStatus = "failed";
      paymentObject.paymentInfo = paymentIntent.data;
      paymentObject.transactionId = paymentIntent.data?.payment_intent?.id;
      paymentObject.transactionDate = transactionDate;
      reservationObject.transactionId = paymentIntent.data?.payment_intent?.id;
      reservationObject.transactionDate = transactionDate;
      const payment = await Payment.create(paymentObject);
      reservationObject.status = "failed";
      reservationObject.paymentId = payment._id;
      await Reservation.create(reservationObject);
      return res.status(http400).json({
        success: paymentIntent.success,
        message: paymentIntent.message,
      });
    } else {
      if (paymentIntent.data?.created) {
        transactionDate = moment
          .unix(paymentIntent.data.created)
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
      paymentObject.paymentInfo = paymentIntent.data;
      paymentObject.transactionId = paymentIntent.data?.id;
      paymentObject.transactionDate = transactionDate;

      reservationObject.transactionId = paymentIntent.data?.id;
      reservationObject.transactionDate = transactionDate;
      receiptData.paymentDate = moment
        .tz(transactionDate, placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A");
      receiptData.transactionId = paymentIntent.data?.id;

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
      const payment = await Payment.create(paymentObject);
      reservationObject.paymentId = payment._id;
      const subscriptionResponse = await Subscription.findOneAndUpdate(
        { _id: ObjectId(subscriptionId) },
        {
          isSubscriptionActive: true,
          paymentId: payment._id,
          defaultPaymentMethodId: paymentMethodId,
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

      const shortlyData = await Shortly.findOne({ shortlyId });
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
          const licensePlateArray = get(
            subscription,
            "licensePlate",
            []
          ).filter((obj) => obj.status === 10);
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
    console.log("error ====>", error);
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};

//pi_3P8yz3KCEdwqS3NJ1F5eVx8o_secret_pFkplNsoqsf85T7h601oC7ahJ
