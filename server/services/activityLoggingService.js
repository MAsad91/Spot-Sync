const { get } = require("lodash");
const Customer = require("../models/customers");
const ActivityLog = require("../models/activityLogs");
const CustomerActivityLog = require("../models/customerActivityLogs");
// Simple replacements for chatbot functions
const checkPlace = async (parkingCode) => ({ success: false, place: null });
const getSession = async () => ({});
const getContextParameters = async () => ({ formValues: {} });

const encodeKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(encodeKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const encodedKey = key.replace(/\./g, '_'); // Replace dot with underscore
      acc[encodedKey] = encodeKeys(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

const createActivityLog = async ({ body, intentName, botcopyRefValue, fingerprint, response }) => {
  // console.log("going to create the activity log");
  // console.log("body", body);
  // console.log("response", response);

  const place = await getPlace(botcopyRefValue);
  if (!place) {
    console.log("Error saving logging: Could not get place against botcopyRefValue");
    return;
  }

  // Save the activity log
  ActivityLog.create({
    fingerprint,
    placeId: place._id,
    intentName,
    inputContext: get(body, "queryResult.queryText"),
    outputContext: response["fulfillmentMessages"][0]["payload"]["botcopy"],
    requestBody: encodeKeys(body),
  });

  if (intentName === "Capture Licenseplate" || intentName === "Monthly Form") {
    await linkCustomerToActivityLog(fingerprint, place._id, body);
  }
};

const linkCustomerToActivityLog = async (fingerprint, placeId, body) => {
  const customer = await getCustomer(fingerprint, placeId, body);
  if (!customer) {
    console.log("Error saving logging: Could not get customer against fingerprint");
    return;
  }

  CustomerActivityLog.create({
    customerId: customer._id,
    placeId,
    fingerprint,
  });
}

const getCustomer = async (fingerprint, placeId, body) => {
  const session = await getSession({
    fingerprint,
    placeId,
  });
  const {
    isExtension,
    isFromSMS,
  } = session;

  const { formValues } = await getContextParameters(body);

  const phoneNumber =
    isExtension || isFromSMS
      ? session.phoneNumber
      : formValues?.phoneNumber ?? session.phoneNumber;
  let customer = await Customer.findOneByMobile(phoneNumber);

  if (!customer && formValues?.email && formValues?.email !== "") {
    customer = await Customer.findOne({
      email: formValues.email,
    });
  }

  return customer;
}

const getPlace = async (botcopyRefValue) => {
  if (!botcopyRefValue)
    return null;

  const stringArray = botcopyRefValue.split("_");
  const parkingCode = stringArray[0];

  const { success, place } = await checkPlace(parkingCode);
  if (!success) {
    return null;
  }
  return place;
}

module.exports = {
  createActivityLog,
}
