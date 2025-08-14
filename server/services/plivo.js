const { get } = require("lodash");
const plivo = require("plivo");
const plivoSid = process.env.PLIVO_SID;
const plivoToken = process.env.PLIVO_TOKEN;
const defaultPlivoNumber = process.env.DEFAULT_PLIVO_NUMBER;
const formatMobile = (number) => {
  if (number.length > 10) {
    return number;
  }
  return `1${number}`;
};

const sendMessage = async (params) => {
  try {
    console.log("SMS params ===>", params);
    const accountSid = plivoSid;
    const authToken = plivoToken;
    const client = new plivo.Client(accountSid, authToken);
    const src = get(params, "from") || defaultPlivoNumber;
    const dst = formatMobile(params.to);
    const text = params.body;

    const message_created = await client.messages.create(src, dst, text);
    console.log("message_created ====>", message_created);
    return message_created;
  } catch (error) {
    console.log("error in sms ====>", error);
    return error;
  }
};

module.exports = { sendMessage };
