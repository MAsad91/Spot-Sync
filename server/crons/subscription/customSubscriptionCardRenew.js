const moment = require("moment");
const Subscription = require("../../models/subscriptions");
const ReceiptCollection = require("../../models/receipts");
const Payment = require("../../models/payments");
const Reservation = require("../../models/reservations");
const { get, isEmpty } = require("lodash");
const {
  createPaymentIntent,
  getOrCreateDCCustomer,
  getStripeCustomerId,
} = require("../../services/stripe");
const {
  amountToShow,
  generateSerialNumber,
  generateExternalKey,
} = require("../../global/functions");
const { sendMessage } = require("../../services/plivo");

const {
  Types: { ObjectId },
} = require("mongoose");
const { isDirectChargePayment } = require("../../services/revenue");
const JazzCash = require("../../services/jazzCash");
const EasyPaisa = require("../../services/easyPaisa");
const SendAttachmentEmail = require("../../services/APIServices/sendAttachmentEmail");

const getNewDates = async ({ startDate, endDate }) => {
  const oldStartMoment = moment(startDate);
  const oldEndMoment = moment(endDate);
  const newStartDate = oldEndMoment.add(1, "days");
  let newEndDate;

  const duration = oldEndMoment.diff(oldStartMoment, "days");
  console.log("duration: " + duration);
  newEndDate = moment(newStartDate).utc().add(duration, "days");

  const nextRenewalDate = newEndDate.clone().add(1, "days");

  return {
    startDate: newStartDate,
    endDate: newEndDate,
    nextRenewalDate: moment(nextRenewalDate).format("MM/DD/YYYY"),
  };
};

const CustomSubscriptionCardAutoRenew = async () => {
  try {
    const startOfYesterday = moment
      .utc()
      .subtract(1, "days")
      .startOf("day")
      .toDate();
    const endOfYesterday = moment
      .utc()
      .subtract(1, "days")
      .endOf("day")
      .toDate();

    const query = {
      placeId: ObjectId("66b77aad3b00b57fb7d15e33"),
      isAutoRenew: true,
      isMonthly: false,
      isCustomSubscription: true,
      paymentMethodType: "card",
      subscriptionStatus: "active",
      endDate: {
        $gte: startOfYesterday,
        $lte: endOfYesterday,
      },
    };
    console.log("query ====>", query);
    const totalRecord = await Subscription.countDocuments(query);
    const records = await Subscription.find(query)
      .populate({
        path: "customerId paymentId placeId brandId",
      })
      .limit(10)
      .exec();
    console.log("Total records ====>", totalRecord);
    console.log("renew to be ====>", records.length);
    // return { success: true };
    if (records.length === 0) {
      return { success: true, message: "No subscriptions to renew." };
    }
    let count = 0;
    const failedRenews = [];
    const promises = records.map(async (subscription) => {
      console.log(
        `Renewal Process start for ${subscription.subscriptionNumber} S.No`
      );
      const {
        totalAmount,
        customerId,
        defaultPaymentMethodId,
        paymentId,
        paymentMethodType,
        placeId,
      } = subscription;
      const paymentMethod = defaultPaymentMethodId
        ? defaultPaymentMethodId
        : paymentId.paymentMethodId;

      const newDates = await getNewDates({
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      });

      let reservationObject = {
        licensePlate: subscription?.licensePlate
          .filter((obj) => obj.status === 10)
          .map((obj) => obj.licensePlateNumber),
        subscriptionId: subscription._id,
        customerId: customerId._id,
        placeId: placeId._id,
        baseRate: subscription?.baseRate,
        totalAmount: subscription?.totalAmount,
        isbpRevenue: subscription?.isbpRevenue,
        tax: subscription?.tax,
        cityTax: subscription?.cityTax,
        countyTax: subscription?.countyTax,
        serviceFee: subscription?.serviceFee,
        ownerPayout: subscription?.ownerPayout,
        paymentGatewayFee: subscription?.paymentGatewayFee,
        applicationFee: subscription?.applicationFee,
        brandId: subscription?.brandId,
        subscriptionNumber: subscription?.subscriptionNumber,
        startDate: newDates?.startDate,
        endDate: newDates?.endDate,
      };
      let paymentObject = {
        customerId: customerId._id,
        purpose: "SUBSCRIPTION",
        subscriptionId: subscription._id,
        stripeCustomerId: await getStripeCustomerId(customerId, placeId),
        paymentMethodId: paymentMethod,
        paymentMethodType,
        subscriptionNumber: get(subscription, "subscriptionNumber", ""),
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
        baseRate: get(subscription, "baseRate", 0),
        tax: get(subscription, "tax", 0),
        taxPercentage: get(subscription, "taxPercentage", 0),
        cityTax: get(subscription, "cityTax", 0),
        cityTaxPercentage: get(subscription, "cityTaxPercentage", 0),
        countyTax: get(subscription, "countyTax", 0),
        countyTaxPercentage: get(subscription, "countyTaxPercentage", 0),
        serviceFee: get(subscription, "serviceFee", 0),
        ownerPayout: get(subscription, "ownerPayout", 0),
        isbpRevenue: get(subscription, "isbpRevenue", 0),
        applicationFee: get(subscription, "applicationFee", 0),
        paymentGatewayFee: get(subscription, "paymentGatewayFee", 0),
        totalAmount: get(subscription, "totalAmount", 0),
      };

      const directChargePayment = isDirectChargePayment(placeId, subscription);
      const stripeProps = {
        total: totalAmount,
        applicationFeeAmount: reservationObject.applicationFee,
        connectedAccountId: get(
          subscription,
          "placeId.connectAccountId",
          "acct_1OmGEqH75gj1EHDr"
        ),
        customerId: await getStripeCustomerId(customerId, placeId),
        customer: customerId,
        place: placeId,
        directChargePayment,
        currency: "usd",
        metadata: {
          mobile: get(customerId, "mobile", ""),
          email: get(customerId, "email", ""),
          subscriptionId: subscription._id.toString(),
          shortlyId: subscription.shortlyId ? subscription.shortlyId : "",
          Purpose: "SUBSCRIPTION",
          parkingCode: get(subscription, "placeId.parkingCode", ""),
          paymentMethodType: "card",
          statement_descriptor: get(
            subscription,
            "placeId.statementDescriptor",
            false
          ),
        },
        paymentMethodId: paymentMethod,
      };

      let receiptData = {
        subscriptionType: subscription.isMonthly ? "Monthly" : "Custom",
        subscriptionNumber: subscription.subscriptionNumber,
        toEmail: get(customerId, "email", ""),
        parkerName: `${get(customerId, "firstName", "")} ${get(
          customerId,
          "lastName",
          ""
        )}`,
        brandLogo: get(subscription, "brandLogo", ""),
        startDate: moment(newDates.startDate).format("MM/DD/YYYY"),
        endDate: moment(newDates.endDate).format("MM/DD/YYYY"),
        tax: `${amountToShow(subscription.tax)}`,
        cityTax: `${amountToShow(subscription.cityTax)}`,
        countyTax: `${amountToShow(subscription.countyTax)}`,
        serviceFee: `${subscription.serviceFee / 100}`,
        paymentGatewayFee: `${amountToShow(subscription.paymentGatewayFee)}`,
        total: `${amountToShow(subscription.totalAmount)}`,
        baseRate: `${amountToShow(subscription?.baseRate)}`,
        brandName: `${get(subscription, "brandId.brandName", "")}`,
        brandAddress: `${get(subscription, "brandId.brandAddress", "")}`,
        brandMobile: `${get(subscription, "brandId.ownerMobileNumber", "")}`,
        companyName: `${get(customerId, "companyName", "")}`,
        parkerEmail: `${get(customerId, "email", "")}`,
        autoRenew: get(subscription, "isAutoRenew", false),
        nextRenewalDate: newDates.nextRenewalDate,
        placeAddress: get(subscription, "placeId.google.formatted_address", ""),
        discount: 0,
        licensePlates: get(subscription, "licensePlate", []).filter(
          (obj) => obj.status === 10
        ),
        updatedServiceFee:
          get(subscription, "paymentGatewayFeePayBy", "isbp") === "customer"
            ? `${amountToShow(
                get(subscription, "paymentGatewayFee", 0) +
                  subscription.serviceFee
              )}`
            : `${amountToShow(subscription.serviceFee)}`,
      };

      let paymentIntent;
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
            customerId,
            connectAccountId,
            paymentMethod,
            subscription.placeId
          );

          paymentObject.stripeCustomerId = customerDCProfile.customerId;
          paymentObject.paymentMethodId = customerDCProfile.paymentMethodId;
          paymentObject.isDirectCharge = true;
          paymentObject.connectAccountId = connectAccountId;
        }

        paymentIntent = await createPaymentIntent(stripeProps);
        console.log("paymentIntent stratus ====>", paymentIntent.success);
      }

      if (!paymentIntent.success) {
        const transactionDate = moment
          .unix(paymentIntent.data?.payment_intent?.created || moment().unix())
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        paymentObject.paymentStatus = "failed";
        paymentObject.paymentInfo = paymentIntent.data;
        paymentObject.transactionId = paymentIntent.data?.payment_intent?.id;
        paymentObject.transactionDate = transactionDate;
        reservationObject.transactionId =
          paymentIntent.data?.payment_intent?.id;
        reservationObject.transactionDate = transactionDate;
        const payment = await Payment.create(paymentObject);
        reservationObject.status = "failed";
        reservationObject.paymentId = payment._id;
        await Reservation.create(reservationObject);
        await Subscription.updateOne(
          { _id: subscription._id },
          { subscriptionStatus: "failed" }
        );
        failedRenews.push({
          subscriptionId: subscription.subscriptionNumber,
          reason: paymentIntent.data.message,
        });
      } else {
        const transactionDate = moment
          .unix(paymentIntent.data?.payment_intent?.created || moment().unix())
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        const receiptNumber = await generateSerialNumber({ type: "receipt" });
        receiptData.serialNumber = receiptNumber;
        receiptData.type = "receipt";
        paymentObject.paymentStatus = "success";
        paymentObject.paymentInfo = paymentIntent.data;
        reservationObject.status = "success";
        reservationObject.transactionId = paymentIntent.data?.id;
        paymentObject.transactionId = paymentIntent.data?.id;
        paymentObject.transactionDate = transactionDate;
        reservationObject.transactionDate = transactionDate;
        receiptData.paymentData = moment
          .tz(transactionDate, placeId.timeZoneId)
          .format("MM/DD/YYYY hh:mm A");
        receiptData.paymentDate = moment
          .tz(transactionDate, placeId.timeZoneId)
          .format("MM/DD/YYYY hh:mm A");
        receiptData.transactionId = paymentIntent.data?.id;

        const receiptURL = `${process.env.FRONT_DOMAIN}sub-receipt?id=${receiptData.serialNumber}`;
        await ReceiptCollection.create(receiptData),
          console.log("receiptURL ---->", receiptURL);

        paymentObject.receiptURL = receiptURL;
        const payment = await Payment.create(paymentObject);
        reservationObject.paymentId = payment._id;

        await Reservation.create(reservationObject);

        await Subscription.updateOne(
          { _id: subscription._id },
          {
            isReminderEmailSend: false,
            isSubscriptionActive: true,
            paymentId: payment._id,
            subscriptionStatus: "active",
            $inc: { renewalCount: 1 },
            startDate: newDates.startDate,
            endDate: newDates.endDate,
            receiptURL,
          }
        );

        if (customerId.isEmailPrimary) {
          await SendAttachmentEmail({
            type: "paymentConfirmation",
            attachmentData: receiptData,
          });
        } else {
          const licensePlateArray = subscription?.licensePlate
            .filter((obj) => obj.status === 10)
            .map((obj) => obj.licensePlateNumber);
          const mobileNumber = get(customerId, "mobile", false);
          if (mobileNumber || !isEmpty(mobileNumber)) {
            const plivoNumber = get(subscription, "placeId.plivoNumber", false);
            const props = {
              from: plivoNumber,
              to: mobileNumber,
              body: `
              Your payment for your parking subscription with ${get(
                subscription,
                "brandId.brandName",
                ""
              )} at ${get(
                subscription,
                "placeId.google.formatted_address",
                ""
              )} has been processed.
              Parker Name: ${get(customerId, "firstName", "")} ${get(
                customerId,
                "lastName",
                ""
              )}
              Amount: ${amountToShow(subscription.totalAmount)}
              License Plate(s): ${licensePlateArray}
              Start Date: ${moment(newDates.startDate).format("MM/DD/YYYY")}
              End Date: ${moment(newDates.endDate).format("MM/DD/YYYY")}
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

        count++;
        console.log("Count ===>", count);
        console.log(
          "Auto renew process done for ---->",
          subscription.subscriptionNumber
        );
      }
    });

    await Promise.all(promises);

    return {
      success: true,
      message: `Renew ${count} subscription out of ${records.length}`,
      failedRenew: failedRenews,
    };
  } catch (error) {
    console.error("AutoRenewCharge error:", error);
    return {
      success: false,
      message: error.message || "Something went wrong!",
    };
  }
};

module.exports = CustomSubscriptionCardAutoRenew;
