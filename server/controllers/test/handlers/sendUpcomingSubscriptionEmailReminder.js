const { http200, http400 } = require("../../../global/errors/httpCodes");
const UpcomingSubscriptionEmailSend = require("../../../crons/subscription/upcomingSubscriptionReminderEmail");

module.exports = async (req, res) => {
  try {
    const sendEmail = await UpcomingSubscriptionEmailSend();

    return res.status(http200).json({ 
      success: true,
      message: "successfully!",
      sendEmail,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};

