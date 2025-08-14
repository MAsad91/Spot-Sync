const axios = require("axios");
const errorLogs = require("../../models/errorLogs");
const { get } = require("lodash");

const SendAttachmentEmail = async ({
  type,
  toEmail,
  ccEmails,
  attachmentData,
}) => {
  try {
    const apiUrl = `${process.env.EMAIL_SERVICE}/email/sendEmail`;
    const headers = { apiKey: process.env.EMAIL_SERVICE_API_KEY };
    const requestBody = {
      emailType: type,
      attachmentData,
      toEmail,
      ccEmail: ccEmails || [],
    };
    const sendEmailResponse = await axios.post(apiUrl, requestBody, {
      headers,
    });
    console.log("sendEmailResponse ===>",sendEmailResponse)

    if (!sendEmailResponse?.data?.success) {
      await errorLogs.create({
        subscriptionNumber: attachmentData.subscriptionNumber,
        from: `SendAttachmentEmail Service Type: ${type}`,
        type: "service",
        errorMessage: sendEmailResponse?.data?.message,
        error: {},
      });
    }

    return get(sendEmailResponse, "data", { success: false });
  } catch (error) {
    console.log("Error in SendAttachmentEmail service  ==>", error);
    return {
      success: false,
      message: error?.message || "Something went wrong!",
    };
  }
};

module.exports = SendAttachmentEmail;
