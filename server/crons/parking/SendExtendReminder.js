const Reservations = require("../../models/reservations");
const Shortly = require("../../models/shortly");
const { get, isEmpty } = require("lodash");
const {
  Types: { ObjectId },
} = require("mongoose");
const errorLogs = require("../../models/errorLogs");
const { sendMessage } = require("../../services/plivo");
// Simple replacements for chatbot functions
const messageBotCopy = async () => ({ success: false, textMessage: "" });
const dynamicVariableReplacer = (messages, variables) => {
  if (!Array.isArray(messages)) return [messages];
  return messages.map(message => {
    let result = message;
    Object.keys(variables).forEach(key => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), variables[key] || '');
    });
    return result;
  });
};
const moment = require("moment-timezone");

const SendExtendReminder = async () => {
  try {
    const currentTime = new Date();
    const fifteenMinutesLater = new Date(
      currentTime.getTime() + 1000 * 60 * 15
    );

    const query = {
      isExtendReminderSend: false,
      status: "success",
      purpose: "PARKING",
      endDate: {
        $gte: currentTime, // Greater than or equal to current time
        $lte: fifteenMinutesLater, // Less than or equal to 15 minutes from now
      },
    };
    const reservations = await Reservations.find(query)
      .populate("customerId placeId brandId")
      .lean();

    console.log("reservations.length ====>", reservations.length);
    // return { success: true, message: "No reservations to extend." };

    if (reservations.length === 0) {
      return { success: true, message: "No reservations to extend." };
    }

    let count = 0;
    const failedToRemind = [];
    const Promises = reservations.map(async (reservation) => {
      try {
        let extensionURL = "";
        const currentDate = moment().utc();
        const { customerId, placeId, brandId, shortlyId } = reservation;
        const {
          isExtensionEnable,
          extensionExpireLimit = 30,
          plivoNumber,
          lotName,
          google,
        } = placeId;

        if (isExtensionEnable) {
          let responseMessages = ["Default message!"];
          const { textMessage } = await messageBotCopy({
            placeId: ObjectId(placeId._id),
            purpose: "Extension Reminder",
          });
          extensionURL = `${process.env.DASHBOARD_DOMAIN}/parking/extension?ref=${shortlyId}_ext`;
          const extensionExpireOn = moment(currentDate)
            .add(extensionExpireLimit, "minutes")
            .utc()
            .format();

          if (textMessage) {
            responseMessages = dynamicVariableReplacer([textMessage], {
              brandName: get(brandId, "brandName", ""),
              placeAddress: get(google, "formatted_address", ""),
              lotName,
              extensionLink: extensionURL,
            });
          }
          const mobileNumber = get(customerId, "mobile", false);
          if (mobileNumber && !isEmpty(mobileNumber)) {
            const props = {
              from: plivoNumber,
              to: mobileNumber,
              body: Array.isArray(responseMessages)
                ? responseMessages[0]
                : responseMessages,
            };
            await sendMessage(props);
          }
          await Shortly.findOneAndUpdate({ shortlyId }, { extensionExpireOn });
          await Reservations.findOneAndUpdate(
            { _id: ObjectId(reservation._id) },
            {
              isExtendReminderSend: true,
            }
          );

          count++;
        }
      } catch (error) {
        console.log("Error in Extension reminder ===>", message);
        failedToRemind.push(reservation._id);
        await errorLogs.create({
          reservationId: reservation._id,
          from: "extendReminderSend",
          type: "cron",
          errorMessage: error.message,
          error,
        });
      }
    });

    await Promise.all(Promises);

    return {
      success: true,
      message: `Reminder sent to ${count} customers out of ${reservations.length}`,
      failedToRemind: failedToRemind,
    };
  } catch (error) {
    console.error("Error in ExtendReminderSend:", error);
    return {
      success: false,
      message: error.message || "Something went wrong!",
    };
  }
};

module.exports = SendExtendReminder;
