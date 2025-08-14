const moment = require("moment");
const Subscription = require("../../models/subscriptions");
const ReceiptCollection = require("../../models/receipts");
const Payment = require("../../models/payments");
const Reservation = require("../../models/reservations");
const { get } = require("lodash");
const {
  createPaymentIntent,
  getOrCreateDCCustomer,
  createPaymentIntentForACH,
  getStripeCustomerId,
} = require("../../services/stripe");
const {
  amountToShow,
  generateSerialNumber,
} = require("../../global/functions");
const {
  isDirectChargePayment,
  getSubscriptionRevenueModel,
} = require("../../services/revenue");
const Authorizenet = require("../../services/authorizenet");

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

const RenewAllSubscriptions = async () => {
  try {
    const timezone = "America/New_York";
    const nowInTimeZone = moment.tz(timezone);
    const sixHoursAgo = nowInTimeZone.subtract(6, "hours");
    // const startOfYesterday = moment
    //   .utc()
    //   .subtract(1, "days")
    //   .startOf("day")
    //   .toDate();
    // const endOfYesterday = moment
    //   .utc()
    //   .subtract(1, "days")
    //   .endOf("day")
    //   .toDate();

    const query = {
      isMonthly: false,
      isCustomSubscription: true,
      isAutoRenew: true,
      subscriptionStatus: "active",
      endDate: {
        $gte: sixHoursAgo.startOf("minute").toDate(),
        $lte: nowInTimeZone.startOf("minute").toDate(),
      },
    };
    const records = await Subscription.find(query)
      .populate({
        path: "customerId paymentId placeId brandId",
      })
      .exec();
    console.log("records ====>", records.endDate);
    if (records.length === 0) {
      return { success: true, message: "No subscriptions to renew." };
    }
    return true;

    let count = 0;
    const failedRenews = [];
    const promises = records.map(async (subscription) => {
      console.log(
        `Renewal Process start for ${subscription.subscriptionNumber} S.No`
      );
      const {
        baseRate,
        customerId,
        defaultPaymentMethodId,
        paymentId,
        paymentMethodType,
        placeId,
        licensePlate,
      } = subscription;
      const paymentMethod = defaultPaymentMethodId || paymentId.paymentMethodId;

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
        licensePlate: subscription?.licensePlate
          .filter((obj) => obj.status === 10)
          .map((obj) => obj.licensePlateNumber),
        subscriptionId: subscription._id,
        customerId: customerId._id,
        placeId: placeId._id,
        baseRate: revenueModal?.baseRate,
        totalAmount: revenueModal?.totalAmount,
        spotsyncRevenue: revenueModal?.spotsyncRevenue,
        tax: revenueModal?.tax,
        cityTax: revenueModal?.cityTax,
        countyTax: revenueModal?.countyTax,
        serviceFee: revenueModal?.serviceFee,
        ownerPayout: revenueModal?.ownerPayout,
        paymentGatewayFee: revenueModal?.paymentGatewayFee,
        applicationFee: revenueModal?.applicationFee,
        brandId: subscription?.brandId,
        subscriptionNumber: subscription?.subscriptionNumber,
        startDate: newDates?.startDate,
        endDate: newDates?.endDate,
      };
      let paymentObject = {
        customerId: customerId._id,
        purpose: "SUBSCRIPTION",
        subscriptionId: subscription._id,
        stripeCustomerId: await getStripeCustomerId(customerId, placeId) || "",
        paymentMethodId: paymentMethod,
        paymentMethodType,
        subscriptionNumber: subscription.subscriptionNumber || "",
        placeId: placeId._id,
        licensePlate: subscription.licensePlate || [],
        isApplyTax: subscription.isApplyTax || false,
        isApplyServiceFee: subscription.isApplyServiceFee || false,
        isApplyTaxOnServiceFee: placeId.isApplyTaxOnServiceFee || false,
        paymentGatewayFeePayBy: subscription.paymentGatewayFeePayBy,
        baseRate: revenueModal.baseRate || 0,
        tax: revenueModal.tax || 0,
        taxPercentage: subscription.taxPercentage || 0,
        cityTax: revenueModal.cityTax || 0,
        cityTaxPercentage: subscription.cityTaxPercentage || 0,
        countyTax: revenueModal.countyTax || 0,
        countyTaxPercentage: subscription.countyTaxPercentage || 0,
        serviceFee: revenueModal.serviceFee || 0,
        ownerPayout: revenueModal.ownerPayout || 0,
        spotsyncRevenue: revenueModal.spotsyncRevenue || 0,
        applicationFee: revenueModal.applicationFee || 0,
        paymentGatewayFee: revenueModal.paymentGatewayFee || 0,
        totalAmount: revenueModal.totalAmount || 0,
      };

      const directChargePayment = isDirectChargePayment(placeId, subscription);
      const stripeProps = {
        total: revenueModal.totalAmount,
        applicationFeeAmount: revenueModal.applicationFee,
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
          mobile: customerId.mobile || "",
          email: customerId.email || "",
          subscriptionId: subscription._id.toString(),
          shortlyId: subscription.shortlyId ? subscription.shortlyId : "",
          Purpose: "SUBSCRIPTION",
          parkingCode: get(subscription, "placeId.parkingCode", ""),
          paymentMethodType,
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
        toEmail: customerId.email || "",
        parkerName: `${customerId.firstName || ""} ${
          customerId.lastName || ""
        }`,
        brandLogo: subscription.brandLogo || "",
        startDate: moment(newDates.startDate).format("MM/DD/YYYY"),
        endDate: moment(newDates.endDate).format("MM/DD/YYYY"),
        tax: `${amountToShow(revenueModal?.tax)}`,
        cityTax: `${amountToShow(revenueModal?.cityTax)}`,
        countyTax: `${amountToShow(revenueModal?.countyTax)}`,
        serviceFee: `${revenueModal?.serviceFee / 100}`,
        paymentGatewayFee: `${amountToShow(revenueModal?.paymentGatewayFee)}`,
        total: `${amountToShow(revenueModal?.totalAmount)}`,
        baseRate: `${amountToShow(revenueModal?.baseRate)}`,
        brandName: get(subscription, "brandId.brandName", ""),
        brandAddress: get(subscription, "brandId.brandAddress", ""),
        brandMobile: get(subscription, "brandId.ownerMobileNumber", ""),
        companyName: customerId.companyName || "",
        parkerEmail: customerId.email || "",
        autoRenew: subscription.isAutoRenew || false,
        renewalDate: newDates.nextRenewalDate,
        placeAddress: get(subscription, "placeId.google.formatted_address", ""),
        discount: 0,
        licensePlates: subscription.licensePlate.filter(
          (obj) => obj.status === 10
        ),
        updatedServiceFee:
          get(subscription, "paymentGatewayFeePayBy", "spotsync") === "customer"
            ? `${amountToShow(
                get(revenueModal, "paymentGatewayFee", 0) +
                  revenueModal.serviceFee
              )}`
            : `${amountToShow(revenueModal.serviceFee)}`,
      };
      console.log("stripeProps ===>", stripeProps);
      let paymentIntent;
      if (paymentMethodType === "ACH") {
        paymentIntent = await createPaymentIntentForACH(stripeProps);
      } else if (paymentMethodType === "card") {
        if (subscription.placeId.paymentGateway === "AUTHORIZENET") {
          const authorizenet = new Authorizenet(subscription.placeId);
          paymentIntent = await authorizenet.chargeCustomerProfile(
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
        }
      }
      console.log("paymentIntent ====>", paymentIntent.success);

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

        Reservation.create(reservationObject);
        Subscription.updateOne(
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
        paymentObject.paymentStatus =
          paymentMethodType === "ACH" ? "initialize" : "success";
        paymentObject.paymentInfo = paymentIntent.data;
        reservationObject.status =
          paymentMethodType === "ACH" ? "initialize" : "success";
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
            subscriptionStatus:
              paymentMethodType === "ACH" ? "initialize" : "active",
            $inc: { renewalCount: 1 },
            startDate: newDates.startDate,
            endDate: newDates.endDate,
            receiptURL,
            receiptNumber: receiptData.serialNumber,
            isEmailSend: false,
            isSMSSend: false,
            isBallparkUpdate: false,
            isSlackUpdate: false,
          }
        );
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

module.exports = RenewAllSubscriptions;
