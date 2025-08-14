const {
  isValidObjectId,
  Types: { ObjectId },
} = require("mongoose");
const { http200, http400 } = require("../../../global/errors/httpCodes");
const SubscriptionCollection = require("../../../models/subscriptions");
const ReceiptCollection = require("../../../models/receipts");
const {
  generateSerialNumber,
  amountToShow,
} = require("../../../global/functions");
const moment = require("moment");
const { get } = require("lodash");

const getNewDates = async ({ isMonthly, startDate, endDate }) => {
  const oldStartMoment = moment.utc(startDate);
  const oldEndMoment = moment.utc(endDate);
  const newStartDate = oldEndMoment.add(1, "days");
  let newEndDate;
  if (isMonthly) {
    const daysInMonth = newStartDate.daysInMonth();
    newEndDate = moment.utc(newStartDate).add(daysInMonth - 1, "days");
  } else {
    const duration = oldEndMoment.diff(oldStartMoment, "days");
    newEndDate = moment.utc(newStartDate).add(duration, "days");
  }
  const renewalDate = newEndDate.clone().add(1, "days");
  return {
    startDate: newStartDate.format("MM/DD/YYYY"),
    endDate: newEndDate.format("MM/DD/YYYY"),
    renewalDate: renewalDate.format("MM/DD/YYYY"),
    renewalInHours: "",
  };
};

module.exports = async (req, res) => {
  try {
    const placeId = "";
    const query = {
      _id: ObjectId("66c71c2372db39f781dc8eb4"),
      // placeId: ObjectId(placeId),
    };
    const subscriptionList = await SubscriptionCollection.find(query)
      .populate("customerId placeId brandId")
      .lean();

    let count = 0;
    for (const subscription of subscriptionList) {
      const email = get(subscription, "customerId.email");
      const { customerId, placeId, brandId } = subscription;
      const newDates = await getNewDates({
        // startDate: subscription.startDate,
        startDate: "2024-08-01T04:00:00.000+00:00",
        // endDate: subscription.endDate,
        endDate: "2024-08-31T03:59:59.999+00:00",
        isMonthly: subscription.isMonthly,
      });

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
        // tax: `${amountToShow(subscription.tax)}`,
        serviceFee: `${amountToShow(subscription.serviceFee)}`,
        // serviceFee: `${amountToShow(100)}`,
        paymentGatewayFee: `${amountToShow(subscription.paymentGatewayFee)}`,
        // paymentGatewayFee: `${amountToShow(3466.5)}`,
        total: `${amountToShow(subscription.totalAmount)}`,
        // total: `${amountToShow(118500)}`,
        baseRate: `${amountToShow(subscription.baseRate)}`,
        // baseRate: `${amountToShow(118400)}`,
        brandName: `${get(brandId, "brandName", "")}`,
        brandAddress: `${get(brandId, "brandAddress", "")}`,
        brandMobile: `${get(brandId, "ownerMobileNumber", "")}`,
        companyName: `${get(subscription, "companyName", "")}`,
        parkerEmail: `${get(customerId, "email", "")}`,
        parkerMobile: `${get(customerId, "mobile", "")}`,
        autoRenew: get(subscription, "isAutoRenew", false),
        placeAddress: get(subscription, "placeId.google.formatted_address", ""),
        discount: 0,

        licensePlates: get(subscription, "licensePlate", []).filter(
          (obj) => obj.status === 10
        ),
        renewalDate: newDates.renewalDate,
        renewalInHours: 0,
        parkerDashboardLink: "https://www.spot-sync.com/parker-login",

        updatedServiceFee:
          get(subscription, "paymentGatewayFeePayBy", "isbp") === "customer"
            ? `${amountToShow(
                get(subscription, "paymentGatewayFee", 0) +
                  subscription.serviceFee
              )}`
            : `${amountToShow(subscription.serviceFee)}`,

        // updatedServiceFee:
        //   get(subscription, "paymentGatewayFeePayBy", "isbp") === "customer"
        //     ? `${amountToShow(3466.5 + subscription.serviceFee)}`
        //     : `${amountToShow(subscription.serviceFee)}`,
      };

      console.log("receiptData ===>", receiptData);
      const receiptURL = `${process.env.FRONT_DOMAIN}sub-invoice?id=${receiptData.serialNumber}`;
      receiptData.invoiceURL = receiptURL;
      console.log("receiptURL ===>", receiptURL);
      await ReceiptCollection.create(receiptData);
      // await SubscriptionCollection.findOneAndUpdate(
      //   {
      //     _id: ObjectId(subscription._id),
      //   },
      //   { $set: { receiptURL } }
      // );
      count++;
      console.log(
        `Successfully invoice created ${subscriptionList.length} out of ${count}`
      );
    }

    return res.status(http200).json({
      success: true,
      message: `Successfully invoice created ${subscriptionList.length} out of ${count}`,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
