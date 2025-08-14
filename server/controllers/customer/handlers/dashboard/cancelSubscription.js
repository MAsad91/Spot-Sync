const Subscription = require("../../../../models/subscriptions");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { API_TYPES } = require("../../../dashboard/places/placeConstants");
const moment = require("moment");
const { customerOtpVerification, cancelSubscriptionEmail } = require("../../../../services/email");
const { get } = require("lodash");

module.exports = async (req, res) => {
  try {
    const {
      userId,
      params: { subscriptionId },
      body: { isReActive },
    } = req;

    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(http403)
        .json({ success: false, message: "Invalid Token" });
    }
    if (!subscriptionId || !isValidObjectId(subscriptionId)) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid Request" });
    }
    let filter = { _id: ObjectId(subscriptionId) };
    const subscriptionData = await Subscription.findOne(filter).populate(
      "placeId brandId customerId"
    );
    let updateValues
    if(isReActive) {
      updateValues = {
        subscriptionStatus: "active",
        subscriptionCancelDate: null,
        isAutoRenew: true,
      }
    } else {
    updateValues = {
      subscriptionStatus: "cancel",
      subscriptionCancelDate: moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      isAutoRenew: false,
    } 
    }
    const update = API_TYPES["UPDATE"](updateValues);
    const updateSubscription = await Subscription.updateOne(filter, update);
    if (updateSubscription.nModified === 0) {
      return res.status(http200).json({
        success,
        message: "Subscription already canceled!",
      });
    }
    const { placeId, brandId, endDate, licensePlate, customerId } =
      subscriptionData;
    const isEmailPrimary = get(customerId, "isEmailPrimary", false);
    if (isEmailPrimary) {
      cancelSubscriptionEmail(get(customerId, "email", ""))()({
        brandName: get(brandId, "brandName", ""),
        subscriptionEndDate: moment(endDate).format("MM/DD/YYYY"),
        placeAddress: get(placeId, "google.formatted_address", ""),
        licensePlates: licensePlate.map((obj) => obj.licensePlateNumber),
        address: get(brandId, "brandAddress", ""),
      });
    }

    return res
      .status(http200)
      .json({ success: true, message: isReActive ? "Subscription has been Re Activated" : "Subscription has been canceled" });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
