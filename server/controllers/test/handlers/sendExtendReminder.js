const SendExtendReminder = require("../../../crons/parking/SendExtendReminder");
const { http200, http400 } = require("../../../global/errors/httpCodes");
// const SendExtendReminder = require("../../../crons/subscription/SendExtendReminder");

module.exports = async (req, res) => {
  try {
    const sendReminder = await SendExtendReminder();

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
