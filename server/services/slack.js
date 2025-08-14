const axios = require("axios");
const {
  Types: { ObjectId },
} = require("mongoose");
const { isEmpty } = require("lodash");
const Slack = require("../models/slacks");

const sendSlack = async ({ purpose, placeId, message }) => {
  try {
    const slackResponse = await Slack.findOne({
      purpose,
      placeId: ObjectId(placeId),
    });

    await axios.post(
      slackResponse?.webhookURL ||
        "https://hooks.slack.com/services/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",
      {
        text: message,
        username: "SpotsyncParking",
      }
    );
    return { success: true };
  } catch (error) {
    console.log("error in slack ====>", error);
    return error;
  }
};

const sendSlackNotification = async ({ slackChannel, message }) => {
  try {
    if (isEmpty(slackChannel) || isEmpty(message)) {
      return false;
    }

    console.log(
      "\n\nTrying to send validation code this slack webhook",
      slackChannel,
      message
    );
    console.log("\n");

    await axios.post(slackChannel, {
      text: message,
              username: "SpotsyncParking",
    });

    console.log("\n\nValidation code sent", slackChannel, message);
    console.log("\n");

    return true;
  } catch (error) {
    console.log(
      "\n\nCould not send validation code message to the slack channel",
      slackChannel,
      message,
      error.message
    );
    console.log("\n");
    return false;
  }
};

module.exports = { sendSlack, sendSlackNotification };
