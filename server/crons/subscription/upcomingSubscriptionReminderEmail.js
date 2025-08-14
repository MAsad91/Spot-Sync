const moment = require("moment");
const Subscription = require("../../models/subscriptions");
const ReceiptCollection = require("../../models/receipts");
const { get, isEmpty } = require("lodash");
const {
  generateSerialNumber,
  amountToShow,
} = require("../../global/functions");
const {
  Types: { ObjectId },
} = require("mongoose");
const errorLogs = require("../../models/errorLogs");
const { sendMessage } = require("../../services/plivo");
const { getSubscriptionRevenueModel } = require("../../services/revenue");
const SendAttachmentEmail = require("../../services/APIServices/sendAttachmentEmail");

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
    startDate: newStartDate.format("MM/DD/YYYY"),
    endDate: newEndDate.format("MM/DD/YYYY"),
    nextRenewalDate: moment(nextRenewalDate).format("MM/DD/YYYY"),
  };
};

const UpcomingSubscriptionEmailSend = async () => {
  try {
    const startDate = moment.utc().startOf("day").toDate();
    const targetDate = moment.utc().add(3, "days").endOf("day").toDate();

    const query = {
      placeId: ObjectId("6630edb0815f3b16d529910c"),
      subscriptionStatus: "active",
      isAutoRenew: true,
      isReminderEmailSend: false,
      isMonthly: true,
      isSubscriptionPaused: { $ne: true },
      endDate: {
        $gte: startDate,
        $lte: targetDate,
      },
    };

    const subscriptions = await Subscription.find(query)
      .populate("customerId placeId brandId")
      .limit(10)
      .lean();
    console.log("subscriptions ------>", subscriptions.length);
    // return { success: true, message: "No subscriptions to renew." };
    if (subscriptions.length === 0) {
      return { success: true, message: "No subscriptions to renew." };
    }

    let count = 0;
    const failedSubscriptions = [];
    const emailPromises = subscriptions.map(async (subscription) => {
      try {
        const { customerId, placeId, brandId, baseRate, licensePlate } =
          subscription;
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

        const invoiceNumber = await generateSerialNumber({ type: "invoice" });
        let receiptData = {
          subscriptionId: subscription._id,
          type: "invoice",
          subscriptionType: get(subscription, "isMonthly", false)
            ? "Monthly"
            : "Custom",
          subscriptionNumber: get(subscription, "subscriptionNumber", "N/A"),
          serialNumber: invoiceNumber,
          toEmail: get(customerId, "email", ""),
          parkerName: `${get(customerId, "firstName", "")} ${get(
            customerId,
            "lastName",
            ""
          )}`,
          brandLogo: get(subscription, "brandLogo", ""),
          startDate: newDates.startDate,
          endDate: newDates.endDate,
          tax: `${amountToShow(revenueModal.tax)}`,
          cityTax: `${amountToShow(revenueModal.cityTax)}`,
          countyTax: `${amountToShow(revenueModal.countyTax)}`,
          serviceFee: `${amountToShow(revenueModal.serviceFee)}`,
          paymentGatewayFee: `${amountToShow(revenueModal.paymentGatewayFee)}`,
          total: `${amountToShow(revenueModal.totalAmount)}`,
          baseRate: `${amountToShow(revenueModal?.baseRate)}`,
          brandName: `${get(brandId, "brandName", "")}`,
          brandAddress: `${get(brandId, "brandAddress", "")}`,
          brandMobile: `${get(brandId, "ownerMobileNumber", "")}`,
          companyName: `${get(subscription, "companyName", "")}`,
          parkerEmail: `${get(customerId, "email", "")}`,
          parkerMobile: `${get(customerId, "mobile", "")}`,
          autoRenew: get(subscription, "isAutoRenew", false),
          placeAddress: get(
            subscription,
            "placeId.google.formatted_address",
            ""
          ),
          discount: 0,
          licensePlates: get(subscription, "licensePlate", []).filter(
            (obj) => obj.status === 10
          ),
          renewalDate: newDates.nextRenewalDate,
          renewalInHours: 0,
          parkerDashboardLink: "https://www.spot-sync.com/parker-login",
          updatedServiceFee:
            get(subscription, "paymentGatewayFeePayBy", "isbp") === "customer"
              ? `${amountToShow(
                  get(revenueModal, "paymentGatewayFee", 0) +
                    revenueModal.serviceFee
                )}`
              : `${amountToShow(revenueModal.serviceFee)}`,
        };

        const receiptURL = `${process.env.FRONT_DOMAIN}sub-invoice?id=${receiptData.serialNumber}`;
        receiptData.invoiceURL = receiptURL;
        console.log("receiptURL ===>", receiptURL);
        await ReceiptCollection.create(receiptData);

        const isEmailPrimary = get(
          subscription,
          "customerId.isEmailPrimary",
          false
        );

        let isEmailSent = false;
        if (isEmailPrimary) {
          const emailResponse = await SendAttachmentEmail({
            type: "renewalReminder",
            attachmentData: receiptData,
          });
          isEmailSent = emailResponse.success;
          
        }

        const mobileNumber = get(customerId, "mobile", false);
        if (mobileNumber && !isEmpty(mobileNumber)) {
          const plivoNumber = get(placeId, "plivoNumber", false);
          const props = {
            from: plivoNumber,
            to: mobileNumber,
            body: `Your parking subscription with ${get(
              brandId,
              "brandName",
              ""
            )} at ${get(
              subscription,
              "placeId.google.formatted_address",
              ""
            )} is set to renew in 72 hours.
            Amount : $${amountToShow(revenueModal.totalAmount)}
            If you would like to cancel or edit your parking subscription, please click on the link below and login to your parker dashboard account.

            https://www.spot-sync.com/parker-login`,
          };
          await sendMessage(props);
        }

        await Subscription.findOneAndUpdate(
          { _id: ObjectId(subscription._id) },
          {
            isReminderEmailSend: isEmailPrimary ? isEmailSent : true,
            invoiceURL: receiptURL,
          }
        );
        if (!isEmailSent && isEmailPrimary) {
          failedSubscriptions.push(subscription._id);
        }
        count++;
        console.log("count ---->", count);

        console.log(
          "subscriptionNumber ---->",
          subscription.subscriptionNumber
        );
      } catch (error) {
        console.log(
          "error in upcoming subscription reminder email send ----->",
          error.message
        );
        failedSubscriptions.push(subscription._id);
        await errorLogs.create({
          subscriptionId: subscription._id,
          from: "upcomingSubscriptionReminderEmail",
          type: "cron",
          errorMessage: error.message,
          error,
        });
      }
    });

    await Promise.all(emailPromises);

    return {
      success: true,
      message: `Email sent to ${count} customers out of ${subscriptions.length}`,
      failedEmailSend: failedSubscriptions,
    };
  } catch (error) {
    console.error("Error in UpcomingSubscriptionEmailSend:", error);
    return {
      success: false,
      message: error.message || "Something went wrong!",
    };
  }
};

module.exports = UpcomingSubscriptionEmailSend;
