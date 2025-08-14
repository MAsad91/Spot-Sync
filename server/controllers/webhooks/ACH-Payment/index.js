const { get } = require("lodash");
const { http200, http400 } = require("../../../global/errors/httpCodes");
const handleRenewalFailed = require("./handlers/renewal-payment-failed");
const handleRenewalSuccess = require("./handlers/renewal-payment-success");
const handleSubscriptionPaymentSuccess = require("./handlers/subscription-payment-success");
const handleSubscriptionPaymentFailed = require("./handlers/subscription-payment-failed");
module.exports = async (req, res) => {
  try {
    const requestData = req.body?.data;
    const metadata = get(requestData, "object.metadata", {});
    const { subscriptionId } = metadata;
    const paymentStatus = get(requestData, "object.status", "pending");
    const paymentMethodType = get(metadata, "paymentMethodType", "");
    const isACHRenewal = get(metadata, "isACHRenewal", "false");
    console.log("paymentStatus ====>", paymentStatus);
    console.log("subscriptionId ====>", subscriptionId);
    console.log("metadata ====>", metadata);
    if (paymentMethodType !== "card") {
      if (isACHRenewal === "true") {
        switch (paymentStatus) {
          case "succeeded":
            await handleRenewalSuccess({ subscriptionId, requestData });
            break;
          case "failed":
            await handleRenewalFailed({ subscriptionId, requestData });
            break;
        }
      } else {
        console.log("this payment is from subscription ====>");
        switch (paymentStatus) {
          case "succeeded":
            await handleSubscriptionPaymentSuccess({
              subscriptionId,
              requestData,
            });
            break;
          case "failed":
            await handleSubscriptionPaymentFailed({
              subscriptionId,
              requestData,
            });
            break;
        }
      }
    }

    return res.status(http200).json({
      success: true,
      message: "successfully!",
    });
  } catch (error) {
    console.log("error ===>", error);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
