const moment = require("moment");
const Subscription = require("../../../models/subscriptions");
const { get, isEmpty } = require("lodash");
const { amountToShow } = require("../../../global/functions");
const { sendMessage } = require("../../../services/plivo");

const CustomSubscriptionSMSConfirmationSend = async () => {
  try {
    const query = {
      isMonthly: false,
      isCustomSUbscription: true,
      isAutoRenew: true,
      subscriptionStatus: "active",
      isSMSSend: false,
    };

    const records = await Subscription.find(query)
      .populate({
        path: "customerId paymentId placeId brandId",
      })
      .limit(20)
      .exec();

    if (records.length === 0) {
      return { success: true, message: "No subscriptions" };
    }

    let count = 0;

    const promises = records.map(async (subscription) => {
      const { customerId } = subscription;

      const licensePlateArray = subscription?.licensePlate
        .filter((obj) => obj.status === 10)
        .map((obj) => obj.licensePlateNumber);

      const mobileNumber = get(customerId, "mobile", "");

      if (mobileNumber) {
        const plivoNumber = get(subscription, "placeId.plivoNumber", "");

        const props = {
          from: plivoNumber,
          to: mobileNumber,
          body: `
            Your payment for your parking subscription with ${get(
              subscription,
              "brandId.brandName",
              ""
            )} at ${get(
            subscription,
            "placeId.google.formatted_address",
            ""
          )} has been processed.
            Parker Name: ${get(customerId, "firstName", "")} ${get(
            customerId,
            "lastName",
            ""
          )}
            Amount: ${amountToShow(subscription.totalAmount)}
            License Plate(s): ${licensePlateArray.join(", ")}
            Start Date: ${moment(subscription.startDate).format("MM/DD/YYYY")}
            End Date: ${moment(subscription.endDate).format("MM/DD/YYYY")}
            To access a receipt for this transaction, please click on the button below to access your parker dashboard.
            https://www.spot-sync.com/parker-login`,
        };

        try {
          await sendMessage(props);

          const props2 = {
            from: plivoNumber,
            to: mobileNumber,
            body: `
              To help you get acquainted with the Parker Dashboard, please click the link below for a step-by-step guide, containing useful tips and instructions on how to navigate your way through your dashboard.
              https://drive.google.com/file/d/1tOuAkESnRJ9LOhWX3sQU_577chpyUsU-/view?usp=drive_link
              `,
          };

          await sendMessage(props2);
          count++;

          subscription.isSMSSend = true;
          await subscription.save();
        } catch (smsError) {
          console.error(
            `Failed to send SMS for subscription ${subscription._id}:`,
            smsError
          );
        }
      } else {
        subscription.isSMSSend = true;
        await subscription.save();
      }
    });

    await Promise.all(promises);

    return {
      success: true,
      message: `Sent ${count} SMS out of ${records.length}`,
    };
  } catch (error) {
    console.error("send sms error:", error);
    return {
      success: false,
      message: error.message || "Something went wrong!",
    };
  }
};

module.exports = CustomSubscriptionSMSConfirmationSend;
