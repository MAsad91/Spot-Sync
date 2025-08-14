const sgMail = require("@sendgrid/mail");
const { EMAIL, FROM_EMAIL } = require("../config");
const { sendSlackNotification } = require("./slack");
const { sendDiscordNotification } = require("./discord");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  sendEmail: function ({ to, cc, subject }) {
    return function (templateId = EMAIL.SUBSCRIPTION_PAYMENT_LINK_TEMPLATE) {
      return async function (dynamicTemplateData) {
        try {
          const msg = {
            to,
            from: FROM_EMAIL.SPOTSYNC_EMAIL,
            subject: "Subscription Payment Link Email",
            templateId,
            dynamicTemplateData,
          };

          if (to && to !== "") {
            await sgMail.send(msg);
          }
          return true;
        } catch (error) {
          console.error("Error sending email:", error?.response?.body);
          return false;
        }
      };
    };
  },

  welcomeEmail: function (to) {
    return function (templateId = EMAIL.WELCOME_TEMPLATE_BRAND) {
      return async function (dynamicTemplateData) {
        try {
          const msg = {
            to,
            subject: "Welcome to the SpotSync family!",
            from: FROM_EMAIL.SPOTSYNC_EMAIL,
            templateId,
            dynamicTemplateData,
          };

          await sgMail.send(msg);
          console.log("Email sent successfully");
          return true;
        } catch (error) {
          console.error("Error sending email:", error?.response?.body);
          return false;
        }
      };
    };
  },
  welcomeEmailUser: function (to) {
    return function (templateId = EMAIL.WELCOME_TEMPLATE_BRAND) {
      return async function (dynamicTemplateData) {
        try {
          const msg = {
            to,
            subject: "Welcome to the SpotSync family!",
            from: FROM_EMAIL.SPOTSYNC_EMAIL,
            templateId,
            dynamicTemplateData,
          };

          await sgMail.send(msg);
          console.log("Email sent successfully");
          return true;
        } catch (error) {
          console.error("Error sending email:", error?.response?.body);
          return false;
        }
      };
    };
  },

  customerOtpVerification: function (to) {
    console.log("enter email service ===");
    return function (templateId = EMAIL.CUSTOMER_OTP_VERIFY_TEMPLATE) {
      return async function (dynamicTemplateData) {
        try {
          const msg = {
            to,
            from: FROM_EMAIL.SPOTSYNC_EMAIL,
            templateId,
            dynamicTemplateData,
          };

          console.log("msg ====>", msg);
          const email = await sgMail.send(msg);
          console.log("Email sent successfully", email);
          return true;
        } catch (error) {
          console.error("Error sending email:", error?.response?.body);
          return false;
        }
      };
    };
  },

  paymentConfirmEmail: function (toEmail, pdfBuffer, dynamicTemplateData) {
    return async function () {
      try {
        const msg = {
          to: [toEmail],
          from: FROM_EMAIL.SPOTSYNC_EMAIL,
          subject: "Payment Confirmation",
          templateId: EMAIL.PAYMENT_CONFIRMATION_TEMPLATE,
          dynamicTemplateData,
          attachments: [
            {
              content: pdfBuffer.toString("base64"),
              filename: "receipt.pdf",
              type: "application/pdf",
              disposition: "attachment",
            },
          ],
        };

        await sgMail.send(msg);
        console.log("Payment confirmation email sent successfully");
        return true;
      } catch (error) {
        console.error("Error sending payment confirmation email:", error);
        return false;
      }
    };
  },
  reminderEmail: async function (toEmail, pdfBuffer, dynamicTemplateData) {
    try {
      const msg = {
        to: toEmail,
        from: FROM_EMAIL.SPOTSYNC_EMAIL,
        subject: "Subscription Expire reminder!",
        templateId: EMAIL.RENEWAL_REMINDER_TEMPLATE,
        dynamicTemplateData,
        attachments: [
          {
            content: pdfBuffer.toString("base64"),
            filename: "invoice.pdf",
            type: "application/pdf",
            disposition: "attachment",
          },
        ],
      };

      await sgMail.send(msg);
      console.log("Reminder email sent successfully");
      return true;
    } catch (error) {
      console.error("Error sending reminder email:", error);
      return false;
    }
  },
  cancelSubscriptionEmail: function (to) {
    console.log("enter email service ===");
    return function (templateId = EMAIL.CANCEL_SUBSCRIPTION_TEMPLATE) {
      return async function (dynamicTemplateData) {
        try {
          const msg = {
            to,
            from: FROM_EMAIL.SPOTSYNC_EMAIL,
            templateId,
            dynamicTemplateData,
          };

          console.log("msg ====>", msg);
          const email = await sgMail.send(msg);
          console.log("Email sent successfully", email);
          return true;
        } catch (error) {
          console.error("Error sending email:", error?.response?.body);
          return false;
        }
      };
    };
  },

  sendAutomationEmail: function ({ to, cc, subject }) {
    return function (templateId = EMAIL.AUTOMATED_CODE_TEMPLATE) {
      return async function (dynamicTemplateData) {
        try {
          const msg = {
            to,
            cc,
            from: FROM_EMAIL.SPOTSYNC_EMAIL,
            subject,
            templateId,
            dynamicTemplateData,
          };

          if (to && to !== "") {
            await sgMail.send(msg);
          }
          return true;
        } catch (error) {
          console.error("Error sending email:", error?.response?.body);
          return false;
        }
      };
    };
  },

  sendAutomaticValidationSlackMessage: async function ({
    message,
    slackChannel,
  }) {
    await sendSlackNotification({ message, slackChannel });
  },

  sendAutomaticValidationDiscordMessage: async function ({
    message,
    discordChannel,
  }) {
    await sendDiscordNotification({ message, discordChannel });
  },

  dailyReservationReportEmail: async function ({
    toEmail,
    ccEmails,
    pdfBuffers,
    dynamicTemplateData,
  }) {
    try {
      const attachments = pdfBuffers.map(({ buffer, filename }) => ({
        content: buffer.toString("base64"),
        filename: filename,
        type: "application/pdf",
        disposition: "attachment",
      }));

      const msg = {
        to: toEmail,
        cc: ccEmails,
        from: FROM_EMAIL.SPOTSYNC_EMAIL,
        subject: "Reservation Daily Report!",
        templateId: EMAIL.DAILY_RESERVATION_REPORT_TEMPLATE,
        dynamicTemplateData,
        attachments,
      };

      await sgMail.send(msg);
      console.log("Report email sent successfully");
      return true;
    } catch (error) {
      console.error("Error sending report email:", error);
      return false;
    }
  },

  reservationConfirmationEmail: async function ({
    toEmail,
    dynamicTemplateData,
  }) {
    try {
      console.log("enter email service ===");
      const msg = {
        to: toEmail,
        from: FROM_EMAIL.SPOTSYNC_EMAIL,
        subject: "Reservation Confirmation Email!",
        templateId: EMAIL.RESERVATION_CONFIRMATION_TEMPLATE,
        dynamicTemplateData,
      };

      console.log("msg ====>", msg);
      const email = await sgMail.send(msg);
      console.log("Email sent successfully", email);
      return true;
    } catch (error) {
      console.error("Error sending email:", error?.response?.body);
      return false;
    }
  },

  permitApprovalEmail: async function ({
    toEmail,
    dynamicTemplateData,
  }) {
    console.log("enter email service ===");
    const msg = {
      to: toEmail,
      from: FROM_EMAIL.SPOTSYNC_EMAIL,
      subject: "Permit Approval Email!",
      templateId: EMAIL.PERMIT_APPROVAL_TEMPLATE,
      dynamicTemplateData,
    };

    try {
      console.log("msg ====>", msg);
      const email = await sgMail.send(msg);
      console.log("Email sent successfully", email);
      return true;
    } catch (error) {
      console.error("Error sending email:", error?.response?.body);
      return false;
    }
  },

  permitRequestEmail: async function ({
    toEmail,
    ccEmails,
    dynamicTemplateData,
  }) {
    console.log("enter email service ===");
    const msg = {
      to: toEmail,
      cc: ccEmails,
      from: FROM_EMAIL.SPOTSYNC_EMAIL,
      subject: "Permit Request Email!",
      templateId: EMAIL.PERMIT_REQUEST_TEMPLATE,
      dynamicTemplateData,
    };

    try {
      console.log("msg ====>", msg);
      const email = await sgMail.send(msg);
      console.log("Email sent successfully", email);
      return true;
    } catch (error) {
      console.error("Error sending email:", error?.response?.body);
      return false;
    }
  },
};
