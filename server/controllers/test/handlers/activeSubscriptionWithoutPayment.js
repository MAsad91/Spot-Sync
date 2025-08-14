const Subscription = require("../../../models/subscriptions");
const Payment = require("../../../models/payments");
const Reservation = require("../../../models/reservations");
const ReceiptCollection = require("../../../models/receipts");
const Shortly = require("../../../models/shortly");
// Session model removed - no longer needed for chatbot functionality
const { http200, http400 } = require("../../../global/errors/httpCodes");
const moment = require("moment");
const {
  Types: { ObjectId },
} = require("mongoose");
const { getStripeCustomerId } = require("../../../services/stripe");
const { get } = require("lodash");
const {
  amountToShow,
  generateSerialNumber,
  getSubscriptionDuration,
  getDatesFromDuration,
  getTimezoneName,
} = require("../../../global/functions");

const { getWithDefault } = require("../../../services/utilityService");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { body } = req;
    const { customerId, subscriptionId, paymentMethodId } = body;
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
      firstMonthIsbpRevenue,
      isbpRevenue,
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
      isbpRevenue: isMonthly ? firstMonthIsbpRevenue : isbpRevenue,
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
      paymentMethodType: "ACH",
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

    const paymentIntent = {
      success: true,
      data: {
        id: "pi_3QcgDpKCEdwqS3NJ1G0Jmkwr",
        object: "payment_intent",
        amount: 9116,
        amount_capturable: 0,
        amount_details: { tip: {} },
        amount_received: 9116,
        application: null,
        application_fee_amount: 276,
        automatic_payment_methods: null,
        canceled_at: null,
        cancellation_reason: null,
        capture_method: "automatic",
        client_secret:
          "pi_3QcgDpKCEdwqS3NJ1G0Jmkwr_secret_bHbCkQv3mntNZwnqGgcLfya7E",
        confirmation_method: "automatic",
        created: 1735792885,
        currency: "usd",
        customer: "cus_RVdELuFE0qt5BI",
        description: null,
        invoice: null,
        last_payment_error: null,
        latest_charge: "py_3QcgDpKCEdwqS3NJ199an2OW",
        livemode: true,
        metadata: {
          Purpose: "SUBSCRIPTION",
          email: "aspentoo@yahoo.com",
          isACHRenewal: "false",
          mobile: "",
          parkingCode: "Xpress7",
          paymentMethodType: "ACH",
          placeAddress: "200 W High St, Lexington, KY 40507, USA",
          shortlyId: "eda2fz",
          statement_descriptor: "Xpress parking",
          subscriptionId: "6775d8f85f34a25ab9573f92",
        },
        next_action: null,
        on_behalf_of: null,
        payment_method: "pm_1QcgPYKCEdwqS3NJpqP6MHBH",
        payment_method_configuration_details: null,
        payment_method_options: {
          us_bank_account: {
            mandate_options: {},
            verification_method: "automatic",
          },
        },
        payment_method_types: ["us_bank_account"],
        processing: null,
        receipt_email: "aspentoo@yahoo.com",
        review: null,
        setup_future_usage: "off_session",
        shipping: null,
        source: null,
        statement_descriptor: "Xpress parking",
        statement_descriptor_suffix: null,
        status: "succeeded",
        transfer_data: { destination: "acct_1NroqTGb0ETzfqzj" },
        transfer_group: "group_py_3QcgDpKCEdwqS3NJ199an2OW",
      },
    };

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
          paymentMethodType: "ACH",
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
