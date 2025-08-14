const axios = require("axios");
const {
  Types: { ObjectId },
} = require("mongoose");
const { isEmpty } = require("lodash");
const Discord = require("../models/discord");

const sendDiscord = async ({ purpose, placeId, message }) => {
  const discordResponse = await Discord.findOne({
    purpose,
    placeId: ObjectId(placeId),
  });
  try {
    if (isEmpty(discordResponse) || isEmpty(discordResponse.webhookURL) || discordResponse.status !== 10) {
      return { success: false }
    }

    const response = await axios.post(
      discordResponse?.webhookURL,
      {
        content: message,
        username: "SpotSync",
      }
    );
    return { success: true };
  } catch (error) {
    console.log("error in discord ====>", error);
    return error;
  }
};

const sendDiscordNotification = async ({ discordChannel, message }) => {
  try {
    if (isEmpty(discordChannel) || isEmpty(message)) {
      return false;
    }

    console.log(
      "\n\nTrying to send validation code this Discord webhook",
      discordChannel,
      message
    );
    console.log("\n");

    await axios.post(discordChannel, {
      content: message,
      username: "SpotSync",
    });

    console.log("\n\nValidation code sent", discordChannel, message);
    console.log("\n");

    return true;
  } catch (error) {
    console.log(
      "\n\nCould not send validation code message to the discord channel",
      discordChannel,
      message,
      error.message
    );
    console.log("\n");
    return false;
  }
};

module.exports = { sendDiscord, sendDiscordNotification };
