const {
  isValidObjectId,
  Types: { ObjectId },
} = require("mongoose");
const { http200, http400 } = require("../../../global/errors/httpCodes");
const Subscription = require("../../../models/subscriptions");
const ReceiptCollection = require("../../../models/receipts");
const moment = require("moment");
const { get } = require("lodash");
const {
  generateSerialNumber,
  getSubscriptionDuration,
  getTimezoneName,
  getDatesFromDuration,
  amountToShow,
  generateShortlyId,
} = require("../../../global/functions");

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

  return {
    startDate: moment(newStartDate).format("MM/DD/YYYY"),
    endDate: moment(newEndDate).format("MM/DD/YYYY"),
  };
};

module.exports = async (req, res) => {
  try {
    const subscriptionId = "66312ac38c29aa9ae4a197ea";
    const subscriptionData = await Subscription.findOne({
      _id: ObjectId(subscriptionId),
    }).populate("paymentId customerId brandId placeId");

    if (!subscriptionData) {
      return res.status(http400).json({
        success: false,
        message: "Subscription not found",
      });
    }

    const {
      defaultPaymentMethodId,
      paymentId,
      customerId,
      paymentMethodType,
      placeId,
      isApplyTax,
      isApplyServiceFee,
      isApplyTaxOnServiceFee,
      subscriptionNumber,
      baseRate,
      taxPercentage,
      cityTaxPercentage,
      countyTaxPercentage,
    } = subscriptionData;

    const licensePlate = [
      {
        licensePlateNumber: "BOW3RS",
        assignName: "Mya Bowers",
        price: 14500,
      },
    ];

    const licensePlateArray = licensePlate.map((plate) => ({
      licensePlateNumber: plate.licensePlateNumber.toUpperCase(),
      assignName: plate.assignName,
      price: plate.price,
    }));
    const duration = getSubscriptionDuration({
      startDate: subscriptionData.startDate,
      endDate: subscriptionData.endDate,
      timezone: getTimezoneName(),
    });
    const dates = getDatesFromDuration({ duration });
    const receiptNumber = await generateSerialNumber({ type: "receipt" });

    const transactionDate = moment
      .unix(1723041056)
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

    const receiptData = {
      subscriptionNumber,
      subscriptionType: get(subscriptionData, "isMonthly", false)
        ? "Monthly"
        : "Custom",
      toEmail: get(customerId, "email", ""),
      parkerName: `${get(customerId, "firstName", "")} ${get(
        customerId,
        "lastName",
        ""
      )}`,
      startDate: dates.startDate,
      endDate: dates.endDate,
      brandLogo: get(subscriptionData, "brandLogo", ""),
      tax: 0,
      cityTax: 0,
      countyTax: 0,
      serviceFee: 0,
      paymentGatewayFee: `${amountToShow(450.5)}`,
      total: `${amountToShow(14500)}`,
      baseRate: `${amountToShow(14500)}`,
      brandName: `${get(subscriptionData, "brandId.brandName", "")}`,
      brandAddress: `${get(subscriptionData, "brandId.brandAddress", "")}`,
      brandMobile: `${get(subscriptionData, "brandId.ownerMobileNumber", "")}`,
      companyName: `${get(subscriptionData, "customerId.companyName", "")}`,
      parkerEmail: `${get(subscriptionData, "customerId.email", "")}`,
      placeAddress: get(
        subscriptionData,
        "placeId.google.formatted_address",
        ""
      ),
      discount: 0,
      licensePlates: licensePlateArray,
      serialNumber: receiptNumber,
      type: "receipt",
      transactionId: "pi_3PlAtAKCEdwqS3NJ1Ypgukku",
      paymentDate: moment
        .tz(transactionDate, placeId.timeZoneId)
        .format("MM/DD/YYYY hh:mm A"),
    };

    const receiptURL = `${process.env.FRONT_DOMAIN}sub-receipt?id=${receiptData.serialNumber}`;
    await ReceiptCollection.create(receiptData),
      console.log("receiptURL ---->", receiptURL);

    return res.status(http200).json({
      success: true,
      message: `Successfully receipt created `,
    });
  } catch (error) {
    console.log("error ==>", error);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
