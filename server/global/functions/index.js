const { DEFAULT_COUNTRY_CODE } = require("../../constants");
const moment = require("moment-timezone");
const increaseCounter = require("../../services/APIServices/increaseCounter");
// Simple phone number parsing function to replace chatbot dependency
function getParsedPhoneNumberInfo(phoneNumber) {
  try {
    // Remove all non-digit characters
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 1 and has 11 digits, it's a US number
    if (cleanedNumber.length === 11 && cleanedNumber.startsWith('1')) {
      return {
        isValid: true,
        number: cleanedNumber,
        countryCallingCode: "+1"
      };
    }
    
    // If it has 10 digits, assume it's a US number
    if (cleanedNumber.length === 10) {
      return {
        isValid: true,
        number: `1${cleanedNumber}`,
        countryCallingCode: "+1"
      };
    }
    
    // If it starts with + and has more than 10 digits, it's international
    if (phoneNumber.startsWith('+') && cleanedNumber.length >= 10) {
      return {
        isValid: true,
        number: cleanedNumber,
        countryCallingCode: phoneNumber.substring(0, phoneNumber.indexOf(cleanedNumber))
      };
    }
    
    // Default fallback
    return {
      isValid: false,
      number: phoneNumber,
      countryCallingCode: "+1"
    };
  } catch (error) {
    return {
      isValid: false,
      number: phoneNumber,
      countryCallingCode: "+1"
    };
  }
}

function convertFieldsToLowerCase(fields, data) {
  fields.forEach((field) => {
    if (data[field] && typeof data[field] === "string") {
      data[field] = data[field].toLowerCase();
    }
  });
  return data;
}

function extractCountryCode(number) {
  let mobileNumber = number;
  let countryCode = DEFAULT_COUNTRY_CODE;

  console.log("\n\nExtracting Country Code For this mobile number", mobileNumber, "\n");

  const parsedPhoneNumberInfo = getParsedPhoneNumberInfo(mobileNumber);

  console.log("\n\nParsed Phone Number", parsedPhoneNumberInfo, "\n");

  mobileNumber = parsedPhoneNumberInfo.number;
  countryCode = parsedPhoneNumberInfo.countryCallingCode;

  return { countryCode, mobileNumber };
}

function generateLotName(addressData) {
  let lotName = "";

  // Check if individual components are available
  const postalCode = addressData?.address_components?.find((component) =>
    component?.types?.includes("postal_code")
  );
  const streetNumber = addressData?.address_components?.find((component) =>
    component?.types?.includes("street_number")
  );
  const streetName = addressData?.address_components?.find((component) =>
    component?.types?.includes("route")
  );

  // Create a custom lot name based on available components
  if (postalCode && streetName && streetNumber) {
    lotName = `${streetNumber?.long_name || ""} ${
      streetName?.long_name || ""
    }, ${postalCode?.long_name || ""}`;
  } else if (streetName && streetNumber) {
    lotName = `${streetNumber?.long_name || ""} ${streetName?.long_name || ""}`;
  } else if (postalCode && streetName) {
    lotName = `${streetName?.long_name || ""}, ${postalCode?.long_name || ""}`;
  } else if (streetName) {
    lotName = `${streetName?.long_name || ""}`;
  }

  // If above fields are not present, use other available address details
  if (!lotName && addressData?.formatted_address) {
    lotName = addressData.formatted_address;
  } else if (!lotName && addressData?.name) {
    lotName = addressData.name;
  }

  return lotName || addressData?.formatted_address;
}

function generateAddress(addressData) {
  let address = {
    city: "",
    state: "",
    country: "",
    postalCode: "",
  };
  addressData?.address_components?.forEach((component) => {
    if (component.types.includes("locality")) {
      address.city = component.long_name;
    } else if (component.types.includes("administrative_area_level_1")) {
      address.state = component.long_name;
    } else if (component.types.includes("country")) {
      address.country = component.long_name;
    } else if (component.types.includes("postal_code")) {
      address.postalCode = component.long_name;
    }
  });
  return address;
}

function dollarsToCents(dollarAmount) {
  console.log("dollar amount ===>", dollarAmount);
  const res =
    typeof dollarAmount === "number" && !isNaN(dollarAmount)
      ? dollarAmount * 100
      : 0;
  console.log("cent value ===>", res);
  return res;
}

function lowerCaseWithOptionalReplacer(str) {
  return function ({ lowercase = true, replacement = "_" } = {}) {
    let transformedStr = String(str);
    if (lowercase) {
      transformedStr = transformedStr.toLowerCase();
    }
    if (replacement && typeof replacement === "string") {
      transformedStr = transformedStr.replace(/\s+/g, replacement);
    }
    return transformedStr;
  };
}

function capitalizeFirstLetter(str) {
  if (typeof str !== "string" || str.length === 0) {
    return str;
  }
  return str?.charAt(0)?.toUpperCase() + str?.slice(1);
}

function generateUniqueShortLink(length = 8) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const timestamp = new Date().getTime().toString(36); // Convert timestamp to base36
  const uniqueIdentifier = Math.random().toString(36).substr(2, length);

  const shortLink = timestamp + uniqueIdentifier;

  return shortLink;
}

function getCurrentWeekDates() {
  const startOfWeek = moment().startOf("week");
  const endOfWeek = moment().endOf("week");

  const days = [];
  let currentDay = startOfWeek;

  while (currentDay <= endOfWeek) {
    days.push({
      day: currentDay.format("dddd").toLowerCase(),
      date: currentDay.format("YYYY-MM-DD"),
    });
    currentDay = currentDay.clone().add(1, "day");
  }

  return days;
}

function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789-";
  let randomString = "";

  for (let i = 0; i < 16; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

function generateShortlyId() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}
function generateExternalKey() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}
function generateRandomPassword() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomPassword = "";

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomPassword += characters.charAt(randomIndex);
  }

  return randomPassword;
}

async function generateSerialNumber({ type }) {
  try {
    const originalNumber = "000000";
    const counterResult = await increaseCounter({ type });
    if (!counterResult || !counterResult.success) {
      throw new Error("Failed to increment counter or invalid type.");
    }
    const incrementedNumber = counterResult.counter
      .toString()
      .padStart(originalNumber.length, "0");

    const prefixes = {
      invoice: "INV",
      receipt: "PR",
      subscription: "S",
      transient: "R",
      permit: "P",
    };

    const prefix = prefixes[type] || "NAN";
    return `${prefix}${incrementedNumber}`;
  } catch (error) {
    return {
      status: false,
      message:
        error.message ||
        "An error occurred while generating the serial number.",
    };
  }
}

function padNumber(number, length) {
  let strNumber = String(number); // Convert number to string
  while (strNumber.length < length) {
    strNumber = "0" + strNumber; // Add leading zeros
  }
  return strNumber;
}

function centsToDollars(centsAmount) {
  const dollars = centsAmount / 100;
  return dollars.toFixed(2);
}

function generateDemoEmail(domain = "example.com", prefix = "user") {
  const randomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const randomString = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const randomPart = randomString(randomNumber(5, 10));
  const numberPart = randomNumber(100, 999);
  const email = `${prefix}${randomPart}${numberPart}@${domain}`;

  return email;
}

function licensePlateArrayToString(licensePlateArray) {
  const licensePlateString = licensePlateArray
    .map((lp) => lp.licensePlateNumber)
    .join(", ");
  return licensePlateString;
}

function getSubscriptionDuration({ startDate, endDate, timezone }) {
  console.log("timeZone ===>", timezone);
  const formattedStartDate = moment
    .tz(startDate, timezone)
    .format("MM/DD/YYYY");
  const formattedEndDate = moment.tz(endDate, timezone).format("MM/DD/YYYY");

  const formattedDate = `${formattedStartDate} - ${formattedEndDate}`;
  return formattedDate;
}
function getTimezoneName() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
function getDatesFromDuration({ duration }) {
  const [startDateString, endDateString] = duration.split(" - ");

  const startDate = startDateString.trim();
  const endDate = endDateString.trim();
  const nextRenewalDate = moment(endDate, "MM/DD/YYYY")
    .add(1, "days")
    .format("MM/DD/YYYY");

  return {
    startDate,
    endDate,
    nextRenewalDate,
  };
}

function amountToShow(amount) {
  const formattedAmount = amount / 100;
  return `${formattedAmount.toFixed(2)}`;
}

function formatTime24to12(time24) {
  const [hour, minute] = time24.split(":");
  let period = "AM";
  let hour12 = parseInt(hour, 10);

  if (hour12 >= 12) {
    period = "PM";
    if (hour12 > 12) hour12 -= 12;
  } else if (hour12 === 0) {
    hour12 = 12;
  }

  return `${hour12}:${minute} ${period}`;
}

function generateDisplayNameForRate({
  rateType = "hourly",
  amount = 0,
  hours = 0,
  endTime = "N/A",
  endDay = "N/A",
} = {}) {
  console.log("RateType ----->", rateType);
  let displayName = "";
  const validAmount = !isNaN(amount) ? amount : 0;
  const validHours = !isNaN(hours) ? hours : 0;
  const formattedEndTime =
    endTime && endTime !== "N/A" ? formatTime24to12(endTime) : "N/A";

  switch (rateType) {
    case "daily":
      displayName = `${validHours} hr${
        validHours !== 1 ? "s" : ""
      } @ $${validAmount}`;
      break;
    case "hourly":
      displayName = `$${validAmount} / hour`;
      break;
    case "all_day":
      displayName = `All day @ $${validAmount} (Good until ${formattedEndTime})`;
      break;
    case "overnight":
      displayName =
        endDay === "same_day"
          ? `Overnight @ $${validAmount} (Good until ${formattedEndTime})`
          : `Overnight @ $${validAmount} (Good until ${formattedEndTime} Next Day)`;
      break;
    case "monthly":
      displayName = `Monthly @ $${validAmount}`;
      break;
    default:
      displayName = "Invalid rate type";
      break;
  }

  return displayName;
}

function getDateInfo(date) {
  const daysInMonth = date.daysInMonth();
  const currentDayOfMonth = date.date(); // Get the current day of the month
  const daysLeftInMonth = daysInMonth - currentDayOfMonth + 1; // Calculate the days left in the month
  return {
    daysInMonth,
    daysLeftInMonth,
  };
}

module.exports = {
  formatTime24to12,
  generateDisplayNameForRate,
  convertFieldsToLowerCase,
  extractCountryCode,
  generateLotName,
  generateAddress,
  dollarsToCents,
  centsToDollars,
  lowerCaseWithOptionalReplacer,
  getCurrentWeekDates,
  capitalizeFirstLetter,
  generateUniqueShortLink,
  generateRandomString,
  generateShortlyId,
  generateSerialNumber,
  getSubscriptionDuration,
  generateDemoEmail,
  licensePlateArrayToString,
  getDatesFromDuration,
  amountToShow,
  getTimezoneName,
  generateRandomPassword,
  getDateInfo,
  generateExternalKey,
};
