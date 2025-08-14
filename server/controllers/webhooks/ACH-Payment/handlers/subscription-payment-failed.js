const {
  Types: { ObjectId },
} = require("mongoose");
const Subscription = require("../../../../models/subscriptions");
const Payment = require("../../../../models/payments");
const Reservation = require("../../../../models/reservations");
const Shortly = require("../../../../models/shortly");
const {
  getDatesFromDuration,
  getSubscriptionDuration,
  getTimezoneName,
  amountToShow,
  generateSerialNumber,
} = require("../../../../global/functions");
const { sendMessage } = require("../../../../services/plivo");
const { getStripeCustomerId } = require("../../../../services/stripe");
const { isEmpty, get } = require("lodash");
const handleSuccess = async ({ subscriptionId, requestData }) => {
  console.log("subscriptionId in success page --->", subscriptionId);
  console.log("enterd success =====>");
  try {
    console.log("requestData =====>", requestData);

    let subscription = await Subscription.findOne({
      _id: ObjectId(subscriptionId),
    })
      .populate({
        path: "customerId placeId paymentId brandId",
      })
      .lean();

    const {
      isMonthly,
      placeId,
      brandId,
      customerId,
      firstMonthTax,
      tax,
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
    } = subscription;

    const paymentMethodId = requestData?.object?.payment_method;
    const transactionId = requestData?.object?.payment_intent;
    const subscriptionNumber = await generateSerialNumber({
      type: "subscription",
    });
    //   const serialNumber = await generateSerialNumber({ type: "receipt" });
    if (subscription && subscription.subscriptionStatus !== "active") {
      let revenue = {
        tax: isMonthly ? firstMonthTax : tax,
        serviceFee: isMonthly ? firstMonthServiceFee : serviceFee,
        baseRate: isMonthly ? firstMonthBaseRate : baseRate,
        ownerPayout: isMonthly ? firstMonthOwnerPayout : ownerPayout,
        isbpRevenue: isMonthly ? firstMonthIsbpRevenue : isbpRevenue,
        applicationFee: isMonthly ? firstMonthApplicationFee : applicationFee,
        paymentGatewayFee: isMonthly ? firstMonthPaymentGatewayFee : paymentGatewayFee,
        totalAmount: isMonthly ? firstMonthTotalAmount : totalAmount,
      };

      let paymentObject = {
        subscriptionNumber,
        transactionId,
        paymentStatus: "failed",
        paymentInfo: requestData?.object,
        customerId: customerId._id,
        purpose: "SUBSCRIPTION",
        subscriptionId,
        shortlyId: get(subscription, "shortlyId", ""),
        paymentMethodId,
        paymentMethodType: "ACH",
        subscriptionId: subscription._id,
        stripeCustomerId: await getStripeCustomerId(subscription.customerId, placeId),
        placeId: placeId._id,
        licensePlate: get(subscription, "licensePlate", []).filter(
          (obj) => obj.status === 10
        ),
        isApplyTax: get(subscription, "isApplyTax", false),
        isApplyServiceFee: get(subscription, "isApplyServiceFee", false),
        isApplyTaxOnServiceFee: get(
          subscription,
          "isApplyTaxOnServiceFee",
          false
        ),
        paymentGatewayFeePayBy: subscription.paymentGatewayFeePayBy,
        baseRate: get(revenue, "baseRate", 0),
        tax: get(revenue, "tax", 0),
        taxPercentage: get(subscription, "taxPercentage", 0),
        serviceFee: get(revenue, "serviceFee", 0),
        ownerPayout: get(revenue, "ownerPayout", 0),
        isbpRevenue: get(revenue, "isbpRevenue", 0),
        applicationFee: get(revenue, "applicationFee", 0),
        paymentGatewayFee: get(revenue, "paymentGatewayFee", 0),
        totalAmount: get(revenue, "totalAmount", 0),
      };

      let reservationObject = {
        subscriptionNumber,
        transactionId,
        status: "failed",
        licensePlate: subscription?.licensePlate
          .filter((obj) => obj.status === 10)
          .map((obj) => obj.licensePlateNumber),
        subscriptionId: subscription._id,
        customerId: customerId._id,
        placeId: placeId._id,
        baseRate: get(revenue, "baseRate", 0),
        tax: get(revenue, "tax", 0),
        serviceFee: get(revenue, "serviceFee", 0),
        ownerPayout: get(revenue, "ownerPayout", 0),
        isbpRevenue: get(revenue, "isbpRevenue", 0),
        applicationFee: get(revenue, "applicationFee", 0),
        paymentGatewayFee: get(revenue, "paymentGatewayFee", 0),
        totalAmount: get(revenue, "totalAmount", 0),
        brandId: brandId._id,
        startDate: subscription?.startDate,
        endDate: subscription?.endDate,
      };

      // const duration = getSubscriptionDuration({
      //   startDate: subscription.startDate,
      //   endDate: subscription.endDate,
      //   timezone: getTimezoneName(),
      // });
      // const dates = getDatesFromDuration({ duration });
      // let receiptData = {
      //   type: "receipt",
      //   serialNumber,
      //   subscriptionNumber,
      //   transactionId,
      //   paymentData: subscription.createdAt,
      //   subscriptionType: subscription.isMonthly ? "Monthly" : "Custom",
      //   toEmail: get(subscription, "customerId.email", ""),
      //   parkerName: `${get(subscription, "customerId.firstName", "")} ${get(
      //     subscription,
      //     "customerId.lastName",
      //     ""
      //   )}`,
      //   brandLogo: get(subscription, "brandLogo", ""),
      //   startDate: dates.startDate,
      //   endDate: dates.endDate,
      //   tax: amountToShow(get(revenue, "tax", 0)),
      //   serviceFee: amountToShow(get(revenue, "serviceFee", 0)),
      //   total: amountToShow(get(revenue, "totalAmount", 0)),
      //   baseRate: amountToShow(get(revenue, "baseRate", 0)),
      //   brandName: get(brandId, "brandName", ""),
      //   brandAddress: get(brandId, "brandAddress", ""),
      //   brandMobile: get(brandId, "ownerMobileNumber", ""),
      //   companyName: get(subscription, "customerId.companyName", ""),
      //   parkerEmail: get(subscription, "customerId.email", ""),
      //   autoRenew: get(subscription, "isAutoRenew", false),
      //   nextRenewalDate: dates.nextRenewalDate,
      //   placeAddress: get(placeId, "google.formatted_address", ""),
      //   discount: 0,
      //   licensePlates: get(subscription, "licensePlate", []).filter(
      //     (obj) => obj.status === 10
      //   ),
      // };


      // const receiptURL = get(uploadFile, "url", false);
      // paymentObject.receiptURL = receiptURL;
      // reservationObject.receiptURL = receiptURL;
      const payment = await Payment.create(paymentObject);
      reservationObject.paymentId = payment._id;

      await Reservation.create(reservationObject);

      subscription = await Subscription.findOneAndUpdate(
        { _id: ObjectId(subscriptionId) },
        {
          isSubscriptionActive: false,
          paymentId: payment._id,
          defaultPaymentMethodId: paymentMethodId,
          subscriptionNumber: subscriptionNumber,
          subscriptionStatus: "failed",
          paymentMethodType: "ACH",
          // receiptURL,
        },
        { new: true }
      );
      await Shortly.updateOne(
        { shortlyId: subscription.shortlyId },
        { $set: { paymentStatus: "failed", clientSecretACH: null } }
      );

      // if (get(subscription, "customerId.isEmailPrimary", false)) {
      // } else {
      //   const mobileNumber = get(subscription, "customerId.mobile", false);
      //   if (mobileNumber && !isEmpty(mobileNumber)) {
      //     const plivoNumber = get(placeId, "plivoNumber", false);
      //     const props = {
      //       from: plivoNumber,
      //       to: mobileNumber,
      //       body: `
      //         Your payment for your parking subscription with ${get(
      //           brandId,
      //           "brandName",
      //           ""
      //         )} at ${get(
      //         placeId,
      //         "google.formatted_address",
      //         ""
      //       )} has been processed.
      //         Parker Name: ${get(
      //           subscription,
      //           "customerId.firstName",
      //           ""
      //         )} ${get(subscription, "customerId.lastName", "")}
      //         Amount: ${amountToShow(revenue.totalAmount)}
      //         License Plate(s): ${licensePlateArray}
      //         Start Date: ${moment(subscription.startDate).format("MM/DD/YYYY")}
      //         End Date: ${moment(subscription.endDate).format("MM/DD/YYYY")}
      //         To access a receipt for this transaction, please click on button below and access your parker dashboard.
      //         https://www.spot-sync.com/parker-login`,
      //     };
      //     await sendMessage(props);
      //     const props2 = {
      //       from: plivoNumber,
      //       to: mobileNumber,
      //       body: `
      //         To help you get acquainted with the Parker Dashboard, please click the link below for a step-by-step guide, containing useful tips and instructions on how to navigate your way through your dashboard.
      //         https://drive.google.com/file/d/1tOuAkESnRJ9LOhWX3sQU_577chpyUsU-/view?usp=drive_link
      //         `,
      //     };
      //     await sendMessage(props2);
      //   }
      // }

      console.log("process done ----->");
      return { success: true };
    }
    return { success: true };
  } catch (error) {
    console.log("error in success ====>", error);
    return {
      success: false,
      message: error?.message || "Something went wrong!",
    };
  }
};

module.exports = handleSuccess;
