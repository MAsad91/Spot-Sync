const CustomSubscriptionEmailConfirmationSend = require("../../../../crons/subscription/customSubscription/sendEmailConfirmation");
// const SendEmailConfirmation = require("../../../../crons/subscription/newSendSubscriptionEmailConfirmation");
const { http200, http400 } = require("../../../../global/errors/httpCodes");

module.exports = async (req, res) => {
  try {
    const sendEmailConfirmation = await CustomSubscriptionEmailConfirmationSend();

    return res.status(http200).json({
      success: true,
      message: "successfully!",
      sendEmailConfirmation,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
