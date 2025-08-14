const CapturePaymentForValidationLaterFLow = require("../../../crons/parking/capturePaymentPayNowValidationFlow");
const SendValidationReminder = require("../../../crons/parking/sendValidationReminder");
const { http200, http400 } = require("../../../global/errors/httpCodes");

module.exports = async (req, res) => {
  try {
    // const sendReminder = await SendValidationReminder();
    const sendReminder = await CapturePaymentForValidationLaterFLow();

    return res.status(http200).json({
      success: true,
      message: "successfully!",
      sendReminder,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
