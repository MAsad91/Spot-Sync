const ValidationSession = require("../../models/validationSession");
const { get } = require("lodash");
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

const SendValidationReminder = async () => {
  try {
    const now = new Date();
    const fiveMinutesFromNow = new Date(
      now.getTime() + 1000 * 60 * 5
    ).toISOString();
    const currentDateTime = now.toISOString();

    console.log("currentDateTime >>>>>> ", currentDateTime);
    console.log("fiveMinutesFromNow >>>>>> ", fiveMinutesFromNow);

    const query = {
      reminderSend: false,
      status: 10,
      triggerDate: {
        $gte: new Date(currentDateTime),
        $lte: new Date(fiveMinutesFromNow),
      },
    };

    const validations = await ValidationSession.find(query).lean();
    if (validations.length === 0) {
      return { success: true, message: "No validation to remind." };
    }

    let count = 0;
    const failedToRemind = [];
    const Promises = await validations.map(async (validation) => {
      try {
        const { place, brand, validationLink, toNumber, fromNumber } =
          validation;
        let responseMessages = ["Default message!"];
        const { textMessage } = await messageBotCopy({
          placeId: ObjectId(place._id),
          purpose: "Validation Reminder SMS",
        });
        if (textMessage) {
          responseMessages = dynamicVariableReplacer([textMessage], {
            brandName: get(brand, "brandName", ""),
            placeAddress: get(place, "google.formatted_address", ""),
            lotName: get(place, "lotName", ""),
            validationLink: validationLink,
          });
        }
        const props = {
          from: fromNumber,
          to: toNumber,
          body: Array.isArray(responseMessages)
            ? responseMessages[0]
            : responseMessages,
        };
        await sendMessage(props);
        await ValidationSession.findOneAndUpdate(
          { _id: ObjectId(validation._id) },
          {
            reminderSend: true,
          }
        );

        count++;
      } catch (error) {
        failedToRemind.push(validation._id);
        await errorLogs.create({
          validationId: validation._id,
          from: "validationReminderSend",
          type: "cron",
          errorMessage: error.message,
          error,
        });
      }
    });

    await Promise.all(Promises);

    return {
      success: true,
      message: `Reminder sent to ${count} customers out of ${validations.length}`,
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

module.exports = SendValidationReminder;
