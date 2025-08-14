const SendSMSConfirmation = require("../../../../crons/subscription/newSendSubscriptionSMSConfirmation");
const { http200, http400 } = require("../../../../global/errors/httpCodes");

module.exports = async (req, res) => {
  try {
    const sendSMSConfirmation = await SendSMSConfirmation();

    return res.status(http200).json({
      success: true,
      message: "successfully!",
      sendSMSConfirmation,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
