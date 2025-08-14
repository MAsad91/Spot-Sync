const CustomSubscriptionRenewalReminderEmail = require("../../../../crons/subscription/customSubscription/sendRenewalReminderEmail");
const RenewalReminderEmailSend = require("../../../../crons/subscription/newUpcomingSubscriptionRenewalReminder");
const { http200, http400 } = require("../../../../global/errors/httpCodes");

module.exports = async (req, res) => {
  try {
    const SendUpcomingRenewalEmail = await CustomSubscriptionRenewalReminderEmail();

    return res.status(http200).json({
      success: true,
      message: "successfully!",
      SendUpcomingRenewalEmail,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
