const AutomatedReportCollection = require("../../models/automatedReports");
const ReservationRefundReport = require("../../services/APIServices/getReservationRefundReport");
const SendAttachmentEmail = require("../../services/APIServices/sendAttachmentEmail");

const DailyRefundReportSend = async () => {
  try {
    const records = await AutomatedReportCollection.find({
      isDaily: true,
      status: 10,
      isRefund: true,
    }).lean();

    const promises = records.map(async (item) => {
      const { toEmail, ccEmails, placeIds } = item;
      const report = await ReservationRefundReport({
        placeIds,
        type: "daily",
      });
      const { success, result } = report;

      if (success) {
        await SendAttachmentEmail({
          toEmail,
          ccEmails,
          type: "dailyRefundReport",
          attachmentData: result,
        });
      }
    });
    await Promise.all(promises);
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Something went wrong!",
    };
  }
};

module.exports = DailyRefundReportSend;
