const moment = require("moment");
const Subscription = require("../../models/subscriptions");
const ReceiptCollection = require("../../models/receipts");
const Payment = require("../../models/payments");
const Reservation = require("../../models/reservations");
const { get } = require("lodash");
const {
  createPaymentIntentForACH,
  getStripeCustomerId,
} = require("../../services/stripe");
const {
  Types: { ObjectId },
} = require("mongoose");
const {
  amountToShow,
  generateSerialNumber,
  generateExternalKey,
} = require("../../global/functions");

const { getSubscriptionRevenueModel } = require("../../services/revenue");

const getNewDates = async ({ startDate, endDate, isMonthly }) => {
  const oldStartMoment = moment(startDate);
  const oldEndMoment = moment(endDate);
  const duration = oldEndMoment.diff(oldStartMoment, "days");
  let newStartDate, newEndDate;
  if (isMonthly) {
    newStartDate = oldEndMoment.clone().add(1, "days");
    const daysInMonth = newStartDate.daysInMonth();
    newEndDate = moment(newStartDate)
      .utc()
      .add(daysInMonth - 1, "days");
  } else {
    newStartDate = oldStartMoment.clone().add(1, "month").startOf("day");
    newEndDate = newStartDate.clone().add(duration, "days").startOf("day");
  }
  const nextRenewalDate = newEndDate.clone().add(1, "days");

  return {
    startDate: newStartDate.format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
    endDate: newEndDate.format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
    nextRenewalDate: moment(nextRenewalDate).format("MM/DD/YYYY"),
  };
};

const AutoRenewChargeACH = async () => {
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
      placeId: ObjectId("662f8f27dc55533a53bd1435"),
      isAutoRenew: true,
      isMonthly: true,
      paymentMethodType: "ACH",
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
      .limit(1)
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
      const {
        baseRate,
        customerId,
        defaultPaymentMethodId,
        paymentId,
        paymentMethodType,
        placeId,
        licensePlate,
      } = subscription;
      const paymentMethod = defaultPaymentMethodId
        ? defaultPaymentMethodId
        : paymentId.paymentMethodId;

      const newDates = await getNewDates({
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        isMonthly: subscription.isMonthly,
      });

      const activeLicensePlateCount = licensePlate.filter(
        (plate) => plate.status === 10
      );
      const revenueModal = await getSubscriptionRevenueModel(
        {
          baseRate,
          placeId: placeId._id,
          isApplyTax: subscription.isApplyTax || false,
          isApplyServiceFee: subscription.isApplyServiceFee || false,
          isApplyTaxOnServiceFee: placeId.applyTaxOnServiceFee || false,
          licensePlateCount: activeLicensePlateCount.length,
        },
        subscription.isDirectChargeSubscription
      );

      let reservationObject = {
        status: "initialize",
        licensePlate: subscription?.licensePlate
          .filter((obj) => obj.status === 10)
          .map((place) => place.licensePlateNumber),
        subscriptionId: subscription._id,
        customerId: customerId._id,
        placeId: subscription?.placeId._id,
        baseRate: revenueModal?.baseRate || 0,
        totalAmount: revenueModal?.totalAmount || 0,
        isbpRevenue: revenueModal?.isbpRevenue || 0,
        tax: revenueModal?.tax || 0,
        cityTax: revenueModal?.cityTax || 0,
        countyTax: revenueModal?.countyTax || 0,
        serviceFee: revenueModal?.serviceFee || 0,
        ownerPayout: revenueModal?.ownerPayout || 0,
        paymentGatewayFee: revenueModal?.paymentGatewayFee || 0,
        applicationFee: revenueModal?.applicationFee || 0,
        brandId: subscription?.brandId._id,
        subscriptionNumber: subscription?.subscriptionNumber,
        startDate: newDates?.startDate,
        endDate: newDates?.endDate,
      };
      let paymentObject = {
        paymentStatus: "initialize",
        customerId: customerId._id,
        purpose: "SUBSCRIPTION",
        subscriptionId: subscription._id,
        stripeCustomerId: await getStripeCustomerId(customerId, placeId),
        paymentMethodId: paymentMethod,
        paymentMethodType,
        subscriptionNumber: get(subscription, "subscriptionNumber", ""),
        placeId: placeId._id,
        licensePlate: get(subscription, "licensePlate", []).filter(
          (obj) => obj.status === 10
        ),
        isMonthly: get(subscription, "isMonthly", false),
        isApplyTax: get(subscription, "isApplyTax", false),
        isApplyServiceFee: get(subscription, "isApplyServiceFee", false),
        isApplyTaxOnServiceFee: get(
          subscription,
          "isApplyTaxOnServiceFee",
          false
        ),
        baseRate: revenueModal?.baseRate || 0,
        tax: revenueModal?.tax || 0,
        taxPercentage: subscription.taxPercentage || 0,
        cityTax: revenueModal?.cityTax || 0,
        cityTaxPercentage: subscription.cityTaxPercentage || 0,
        countyTax: revenueModal?.countyTax || 0,
        countyTaxPercentage: subscription.countyTaxPercentage || 0,
        serviceFee: revenueModal?.serviceFee || 0,
        ownerPayout: revenueModal?.ownerPayout || 0,
        isbpRevenue: revenueModal?.isbpRevenue || 0,
        applicationFee: revenueModal?.applicationFee || 0,
        paymentGatewayFee: revenueModal?.paymentGatewayFee || 0,
        totalAmount: revenueModal?.totalAmount || 0,
      };

      const stripeProps = {
        total: revenueModal?.totalAmount || 0,
        applicationFeeAmount: reservationObject.applicationFee,
        connectedAccountId: get(
          subscription,
          "placeId.connectAccountId",
          "acct_1OmGEqH75gj1EHDr"
        ),
        customerId: await getStripeCustomerId(customerId, placeId),
        currency: "usd",
        place: placeId,
        metadata: {
          mobile: get(customerId, "mobile", ""),
          email: get(customerId, "email", ""),
          subscriptionId: subscription._id.toString(),
          shortlyId: subscription.shortlyId,
          Purpose: "SUBSCRIPTION",
          parkingCode: get(subscription, "placeId.parkingCode", ""),
          paymentMethodType: "ACH",
          statement_descriptor: get(
            subscription,
            "placeId.statementDescriptor",
            false
          ),
        },
        paymentMethodId: paymentMethod,
      };

      let receiptData = {
        subscriptionNumber: subscription.subscriptionNumber,
        toEmail: get(subscription, "customerId.email", ""),
        parkerName: `${get(subscription, "customerId.firstName", "")} ${get(
          subscription,
          "customerId.lastName",
          ""
        )}`,
        brandLogo: get(subscription, "brandLogo", ""),
        startDate: moment(newDates.startDate).format("MM/DD/YYYY"),
        endDate: moment(newDates.endDate).format("MM/DD/YYYY"),
        tax: `${amountToShow(revenueModal.tax)}`,
        cityTax: `${amountToShow(revenueModal.cityTax)}`,
        countyTax: `${amountToShow(revenueModal.countyTax)}`,
        serviceFee: `${revenueModal.serviceFee / 100}`,
        paymentGatewayFee: `${amountToShow(revenueModal.paymentGatewayFee)}`,
        total: `${amountToShow(revenueModal.totalAmount)}`,
        baseRate: `${amountToShow(revenueModal?.baseRate)}`,
        brandName: `${get(subscription, "brandId.brandName", "")}`,
        brandAddress: `${get(subscription, "brandId.brandAddress", "")}`,
        brandMobile: `${get(subscription, "brandId.ownerMobileNumber", "")}`,
        companyName: `${get(subscription, "customerId.companyName", "")}`,
        parkerEmail: `${get(subscription, "customerId.email", "")}`,
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
                get(revenueModal, "paymentGatewayFee", 0) +
                  revenueModal.serviceFee
              )}`
            : `${amountToShow(revenueModal.serviceFee)}`,
      };
      // console.log("reservationObject ----->",reservationObject);
      // console.log("paymentObject ----->",paymentObject);
      // console.log("stripeProps ----->",stripeProps);
      // console.log("receiptData ---->",receiptData);
      // return { success: true, message: "Success" };

      const paymentIntent = await createPaymentIntentForACH(stripeProps);
      console.log("paymentIntent ====>", paymentIntent.success);

      if (!paymentIntent.success) {
        const transactionDate = moment
          .unix(paymentIntent.data?.payment_intent?.created || moment().unix())
          .utc()
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        paymentObject.paymentInfo = paymentIntent.data;
        paymentObject.transactionId = paymentIntent.data?.payment_intent?.id;
        paymentObject.transactionDate = transactionDate;
        reservationObject.transactionId =
          paymentIntent.data?.payment_intent?.id;
        reservationObject.transactionDate = transactionDate;
        paymentObject.paymentStatus = "failed";
        reservationObject.status = "failed";
        const payment = await Payment.create(paymentObject);
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
        receiptData.transactionId = paymentIntent.data?.id;
        paymentObject.paymentInfo = paymentIntent.data;
        paymentObject.transactionId = paymentIntent.data?.id;
        reservationObject.transactionId = paymentIntent.data?.id;
        paymentObject.transactionDate = transactionDate;
        reservationObject.transactionDate = transactionDate;
        receiptData.paymentDate = moment
          .tz(transactionDate, placeId.timeZoneId)
          .format("MM/DD/YYYY hh:mm A");
        receiptData.paymentData = moment
          .tz(transactionDate, placeId.timeZoneId)
          .format("MM/DD/YYYY hh:mm A");
        receiptData.transactionId = paymentIntent.data?.id;

        const receiptURL = `${process.env.FRONT_DOMAIN}sub-invoice?id=${receiptData.serialNumber}`;
        await ReceiptCollection.create(receiptData),
          console.log("receiptURL ---->", receiptURL);

        paymentObject.receiptURL = receiptURL;
        const payment = await Payment.create(paymentObject);
        receiptData.paymentDate = payment.createdAt;
        reservationObject.paymentId = payment._id;
        await Reservation.create(reservationObject);

        await Subscription.updateOne(
          { _id: subscription._id },
          {
            paymentId: payment._id,
            subscriptionStatus: "initialize",
            startDate: newDates.startDate,
            endDate: newDates.endDate,
            $inc: { renewalCount: 1 },
            paymentMethodType: "ACH",
            receiptURL,
          }
        );

      }
      count++;
      console.log("count ---->", count);
      console.log("Auto renew process done for ---->", subscription._id);
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

module.exports = AutoRenewChargeACH;
