const Subscription = require("../../models/subscriptions");
const ReceiptCollection = require("../../models/receipts");

const SendEmailConfirmation = async () => {
  try {
    const query = {
      isAutoRenew: true,
      subscriptionStatus: "active",
      isEmailSend: false,
    };

    const records = await Subscription.find(query)
      .populate({
        path: "customerId paymentId placeId brandId",
      })
      .exec();

    if (records.length === 0) {
      return { success: true, message: "No subscriptions" };
    }

    let count = 0;
    const promises = records.map(async (subscription) => {
      const { receiptNumber, customerId } = subscription;

      if (!customerId) {
        console.warn(`No customerId for subscription ${subscription._id}`);
        return;
      }

      const receiptData = await ReceiptCollection.findOne({
        type: "receipt",
        serialNumber: receiptNumber,
      });

      if (receiptData) {
        if (customerId.isEmailPrimary) {
          const isEmailSend = true;
        
          if (isEmailSend) {
            subscription.isEmailSend = true;
            count++;
          }
        } else {
          subscription.isEmailSend = true;
          count++;
        }
      } else {
        console.warn(`No receipt data for serial number ${receiptNumber}`);
      }

      await subscription.save();
    });

    await Promise.all(promises);

    return {
      success: true,
      message: `Sent ${count} emails out of ${records.length}`,
    };
  } catch (error) {
    console.error("send email error:", error);
    return {
      success: false,
      message: error.message || "Something went wrong!",
    };
  }
};

module.exports = SendEmailConfirmation;
