const Subscription = require("../../../../models/subscriptions");
const Shortly = require("../../../../models/shortly");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const {
  getSubscriptionDuration,
  getTimezoneName,
  getDatesFromDuration,
  amountToShow,
  capitalizeFirstLetter,
  licensePlateArrayToString,
} = require("../../../../global/functions");
const { get } = require("lodash");
const { sendMessage } = require("../../../../services/plivo");
const { sendEmail } = require("../../../../services/email");
const moment = require("moment");

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      userId,
      params: { subscriptionId },
    } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    const query = {
      _id: ObjectId(subscriptionId),
      subscriptionStatus: "pending",
    };
    const subscription = await Subscription.findOne(query).populate(
      "customerId placeId brandId"
    );
    if (!subscription) {
      return res.status(http400).json({
        success,
        message: "Invalid Subscription",
      });
    }
    const { customerId, placeId, brandId, shortlyId } = subscription;
    const expireDateUTC = moment()
      .add(7, "days")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss[Z]");
    await Shortly.findOneAndUpdate(
      { shortlyId },
      { $set: { expireOn: expireDateUTC } }
    );
    let paymentURL = "";
            if (placeId.paymentGateway === "JAZZ_CASH") {
          paymentURL = `${process.env.FRONT_DOMAIN}payment/jazzcash?shortlyId=${shortlyId}`;
        } else if (placeId.paymentGateway === "EASY_PAISA") {
          paymentURL = `${process.env.FRONT_DOMAIN}payment/easypaisa?shortlyId=${shortlyId}`;
    }
    else {
      paymentURL = `${process.env.FRONT_DOMAIN}payment?shortlyId=${shortlyId}`;
    }

    const duration = getSubscriptionDuration({
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      timezone: getTimezoneName(),
    });
    const dates = getDatesFromDuration({ duration });
    const licensePlates = licensePlateArrayToString(
      subscription.licensePlate.filter((plate) => plate.status === 10)
    );
    if (customerId.isEmailPrimary) {
      await sendEmail({
        to: customerId.email,
        subject: "Subscription details & payment link",
      })()({
        startDate: dates.startDate,
        endDate: dates.endDate,
        brandName: brandId.brandName,
        brandLogo: brandId.brandLogo,
        placeAddress: placeId.google.formatted_address,
        parkerName: capitalizeFirstLetter(
          `${customerId?.firstName + " " + customerId?.lastName}`
        ),
        licensePlates: licensePlates,
        amount: `${amountToShow(
          subscription.isMonthly
            ? subscription.firstMonthTotalAmount
            : subscription.totalAmount
        )}`,
        autoRenewal: subscription.isAutoRenew ? "Yes" : "No",
        paymentLink: paymentURL,
        message: subscription.message,
      });
    }

    const mobileNumber = get(customerId, "mobile", false);
    if (mobileNumber) {
      const plivoNumber = get(placeId, "plivoNumber", false);
      // console.log("plivoNumber ----->", plivoNumber);
      const props = {
        from: plivoNumber,
        to: mobileNumber,
        body: `Please click on this payment url to pay your subscription fee ${paymentURL}`,
      };
      await sendMessage(props);
    }
    return res.status(http200).json({
      success: true,
      message: "Payment Link Send!",
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
