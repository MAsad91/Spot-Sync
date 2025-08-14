const AutomatedReportCollection = require("../../models/automatedReports");
const ReservationReportNew = require("../../services/APIServices/getReservationReportNew");
const SendAttachmentEmail = require("../../services/APIServices/sendAttachmentEmail");

const DailyReportSend = async () => {
  try {
    const records = await AutomatedReportCollection.find({
      isDaily: true,
      status: 10,
      $or: [{ isTransaction: true }, { isTransaction: { $exists: false } }],
    }).lean();

    const promises = records.map(async (item) => {
      const { toEmail, ccEmails, placeIds } = item;
      const report = await ReservationReportNew({
        placeIds,
        type: "daily",
      });
      const { success, result } = report;

      if (success) {
        await SendAttachmentEmail({
          toEmail,
          ccEmails,
          type: "dailyReservationReport",
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

module.exports = DailyReportSend;
