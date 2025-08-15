const moment = require("moment");
const Subscription = require("../../models/subscriptions");
const Payment = require("../../models/payments");
const Reservation = require("../../models/reservations");
const { get } = require("lodash");
const {
  createPaymentIntent,
  getOrCreateDCCustomer,
  getStripeCustomerId,
} = require("../../services/stripe");
const { amountToShow } = require("../../global/functions");
const { isDirectChargePayment } = require("../../services/revenue");
const JazzCash = require("../../services/jazzCash");
const EasyPaisa = require("../../services/easyPaisa");

const getNewDates = async ({ startDate, endDate, isMonthly }) => {
  const oldStartMoment = moment(startDate);
  const oldEndMoment = moment(endDate);
  const newStartDate = oldEndMoment.add(1, "days");
  let newEndDate;
  if (isMonthly) {
    const daysInMonth = newStartDate.daysInMonth();
    newEndDate = moment(newStartDate)
      .utc()
      .add(daysInMonth - 1, "days");
  } else {
    const duration = oldEndMoment.diff(oldStartMoment, "days");
    console.log("duration: " + duration);
    newEndDate = moment(newStartDate).utc().add(duration, "days");
  }
  const nextRenewalDate = newEndDate.clone().add(1, "days");

  return {
    startDate: newStartDate,
    endDate: newEndDate,
    nextRenewalDate: moment(nextRenewalDate).format("MM/DD/YYYY"),
  };
};

const AutoRenewCharge = async () => {
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
      isAutoRenew: true,
      endDate: {
        $gte: startOfYesterday,
        $lte: endOfYesterday,
      },
    };
    console.log("query ====>", query);
    const records = await Subscription.find(query)
      .populate({
        path: "customerId paymentId placeId brandId",
      })
      .exec();
    console.log("records ====>", records);
    if (records.length === 0) {
      return { success: true, message: "No subscriptions to renew." };
    }
    const promises = records.map(async (subscription) => {
      const { totalAmount, customerId, defaultPaymentMethodId, paymentId, placeId } =
        subscription;
      const paymentMethod = defaultPaymentMethodId
        ? defaultPaymentMethodId
        : paymentId.paymentMethodId;

      const newDates = await getNewDates({
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        isMonthly: subscription.isMonthly,
      });

      let reservationObject = {
        licensePlate: subscription?.licensePlate.map(
          (obj) => obj.licensePlateNumber
        ),
        subscriptionId: subscription._id,
        customerId,
        placeId: subscription?.placeId,
        baseRate: subscription?.amount,
        totalAmount: subscription?.totalAmount,
        spotsyncRevenue: subscription?.spotsyncRevenue,
        tax: subscription?.tax,
        cityTax: subscription?.cityTax,
        countyTax: subscription?.countyTax,
        serviceFee: subscription?.serviceFee,
        ownerPayout: subscription?.ownerPayout,
        paymentGatewayFee: subscription?.paymentGatewayFee,
        applicationFee: subscription?.applicationFee,
        brandId: subscription?.brandId,
        orderId: subscription?.orderId,
        startDate: newDates?.startDate,
        endDate: newDates?.endDate,
      };
      let paymentObject = {
        customerId,
        purpose: "SUBSCRIPTION",
        subscriptionId: subscription._id,
        shortlyId: get(subscription, "shortlyId", ""),
        stripeCustomerId: await getStripeCustomerId(customerId, placeId),
        paymentMethodId: paymentMethod,
        paymentMethodType: "card",
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
        metadata: {},
        paymentMethodId: paymentMethod,
      };

      console.log("newDates ===>", newDates);
      let emailData = {
        subscriptionType: subscription.isMonthly ? "Monthly" : "Custom",
        serialNumber: subscription.serialNumber,
        toEmail: get(subscription, "customerId.email", ""),
        parkerName: `${get(subscription, "customerId.firstName", "")} ${get(
          subscription,
          "customerId.lastName",
          ""
        )}`,
        brandLogo: get(subscription, "brandLogo", ""),
        startDate: moment(newDates.startDate).format("MM/DD/YYYY"),
        endDate: moment(newDates.endDate).format("MM/DD/YYYY"),
        tax: `${amountToShow(subscription.tax)}`,
        cityTax: `${amountToShow(subscription.cityTax)}`,
        countyTax: `${amountToShow(subscription.countyTax)}`,
        serviceFee: `${subscription.serviceFee / 100}`,
        total: `${amountToShow(subscription.totalAmount)}`,
        baseRate: `${amountToShow(subscription?.baseRate)}`,
        brandName: `${get(subscription, "brandId.brandName", "")}`,
        brandAddress: `${get(subscription, "brandId.brandAddress", "")}`,
        brandMobile: `${get(subscription, "brandId.ownerMobileNumber", "")}`,
        companyName: `${get(subscription, "customerId.companyName", "")}`,
        parkerEmail: `${get(subscription, "customerId.email", "")}`,
        autoRenew: get(subscription, "isAutoRenew", false),
        nextRenewalDate: newDates.nextRenewalDate,
        placeAddress: get(subscription, "placeId.google.formatted_address", ""),
        discount: 0,
        licensePlates: get(subscription, "licensePlate", []),
      };

      let paymentIntent;
      if (subscription.placeId.paymentGateway === "JAZZ_CASH") {
        const jazzCash = new JazzCash(subscription.placeId);
        paymentIntent = await jazzCash.chargeCustomer(subscription.customerId, totalAmount/100, "Subscription renewal via Jazz Cash");
      } else if (subscription.placeId.paymentGateway === "EASY_PAISA") {
        const easyPaisa = new EasyPaisa(subscription.placeId);
        paymentIntent = await easyPaisa.chargeCustomer(subscription.customerId, totalAmount/100, "Subscription renewal via EasyPaisa");
      } else {
        if (directChargePayment) {
          const connectAccountId = get(subscription, "placeId.connectAccountId", "acct_1OmGEqH75gj1EHDr")
          const customerDCProfile = await getOrCreateDCCustomer(
            customerId,
            connectAccountId,
            paymentMethod,
            placeId
          );
    
          paymentObject.stripeCustomerId = customerDCProfile.customerId
          paymentObject.paymentMethodId = customerDCProfile.paymentMethodId
          paymentObject.isDirectCharge = true
          paymentObject.connectAccountId = connectAccountId
        }

        paymentIntent = await createPaymentIntent(stripeProps);
      }

      if (!paymentIntent.success) {
        paymentObject.paymentStatus = "failed";
        paymentObject.paymentInfo = paymentIntent.data;
        const payment = await Payment.create(paymentObject);
        reservationObject.status = "failed";
        reservationObject.paymentId = payment._id;
        await Reservation.create(reservationObject);
        await Subscription.updateOne(
          { _id: subscription._id },
          { subscriptionStatus: "failed" }
        );
      } else {
        paymentObject.paymentStatus = "success";
        paymentObject.paymentInfo = paymentIntent.data;
        reservationObject.status = "success";
        reservationObject.transactionId = paymentIntent.data?.id;
        const payment = await Payment.create(paymentObject);
        emailData.transactionId = get(payment, "paymentInfo.id", "N/A");
        emailData.paymentDate = get(payment, "createdAt", "");
        reservationObject.paymentId = payment._id;
        await Reservation.create(reservationObject);
        await Subscription.updateOne(
          { _id: subscription._id },
          {
            isSubscriptionActive: true,
            paymentId: payment._id,
            subscriptionStatus: "active",
            $inc: { renewalCount: 1 },
            startDate: newDates.startDate,
            endDate: newDates.endDate,
          }
        );
        // send email of payment done for autoRenew subscription with paymentReceipt
      }
    });

    await Promise.all(promises);

    return { success: true, message: "Success" };
  } catch (error) {
    console.error("AutoRenewCharge error:", error);
    return {
      success: false,
      message: error.message || "Something went wrong!",
    };
  }
};

module.exports = AutoRenewCharge;
