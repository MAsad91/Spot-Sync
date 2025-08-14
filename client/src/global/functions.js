import moment from "moment-timezone";
import { ceil, get } from "lodash";
import { parsePhoneNumberWithError, formatIncompletePhoneNumber  } from "libphonenumber-js";
// import shortid from "shortid";
// Function to add id field to each object in the array
export function addIdField(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i].id = arr[i]._id;
  }
  return arr;
}

export function calculatePercentageWithCondition(obj, condition) {
  const totalItems = Object.keys(obj).length;
  const filteredItems = Object.values(obj).filter(
    (value) => value === condition
  );
  const percentage = (filteredItems.length / totalItems) * 100;
  return percentage;
}

export function getRandomEmoji() {
  const randomEmoji = ["🚀", "💫", "🤞🏻", "💕", "💥", "🔥"];
  const randomIndex = Math.floor(Math.random() * randomEmoji.length);
  return randomEmoji[randomIndex];
}

export function getStatusInfo(status, key) {
  const statusMap = {
    10: {
      text: "Active",
      color: "success",
    },
    1: {
      text: "Inactive",
      color: "warning",
    },
    0: {
      text: "Deleted",
      color: "error",
    },
  };

  if (
    statusMap.hasOwnProperty(status) &&
    statusMap[status]?.hasOwnProperty(key)
  ) {
    return statusMap[status][key];
  } else {
    return "N/A";
  }
}
export function centsToUSD(centsAmount) {
  const dollars = (centsAmount / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
  return dollars;
}

export function centsToDollars(centsAmount) {
  const dollars = ceil(centsAmount / 100, 2);
  return dollars;

}

export function capitalizeFirstLetter(str) {
  if (typeof str !== "string" || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeAndReplace(str) {
  return function ({ replacement = " " } = {}) {
    let transformedStr = String(str);

    transformedStr =
      transformedStr?.charAt(0)?.toUpperCase() + transformedStr?.slice(1);

    if (replacement && typeof replacement === "string") {
      transformedStr = transformedStr.replace(
        new RegExp(replacement, "g"),
        " "
      );
    }
    return transformedStr === "Null" || transformedStr === "Undefined"
      ? null
      : transformedStr;
  };
}

export function formatMobileNumberWithCountryCode(mobileNumber, countryCode) {
  try {
    if (!mobileNumber || !countryCode) {
      return mobileNumber;
    }

    return parsePhoneNumberWithError(countryCode + mobileNumber).formatInternational();
  } catch (error) {
    console.log(error);
    return mobileNumber;
  }
}

export function mobileNumberMasking(number) {
  return formatIncompletePhoneNumber(number, "US") || number;
}

export function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

export function toCamelCase(str) {
  return str
    ?.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word?.toLowerCase() : word?.toUpperCase();
    })
    ?.replace(/\s+/g, "");
}

export function dateToShow(date) {
  const parsedDate = moment(date);
  const formattedDate = parsedDate.format("MM/DD/YYYY hh:mm A");
  return formattedDate;
}

export function formatDateWithTimezone(date, tz) {
  const parsedDate = moment.tz(date, tz);
  const formattedDate = parsedDate.format("MM/DD/YYYY hh:mm A");
  return formattedDate;
}

export function getSubscriptionDuration({
  startDate,
  endDate,
  tz,
  isReservation,
}) {
  // Directly create moments in the specified timezone
  const utcStart = moment.tz(startDate, tz);
  const utcEnd = moment.tz(endDate, tz);

  // Now, you can safely use startOf and endOf
  const startOfDate = utcStart
    // .startOf("day")
    .format(`MM/DD/YYYY ${isReservation ? "hh:mm A" : ""}`);
  const endOfDate = utcEnd
    // .endOf("day")
    .format(`MM/DD/YYYY ${isReservation ? "hh:mm A" : ""}`);

  const formattedDate = `${startOfDate} - ${endOfDate}`;
  return formattedDate;
}

export function getDatesFromDuration({ duration }) {
  const [startDateString, endDateString] = duration.split(" - ");
  const startDate = startDateString.trim();
  const endDate = endDateString.trim();
  const nextRenewalDate = moment(endDate).add(1, "days").format("MM/DD/YYYY");
  return {
    startDate,
    endDate,
    nextRenewalDate,
  };
}

export function percentToAmount(percent, totalAmount) {
  const amount = (percent / 100) * totalAmount;
  return amount;
}

export const stringToColor = (string) => {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};
export const SHORTLINK_TYPES = {
  REDIRECT: "/qrCode/redirect/",
};

export const generateShortlyId = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};

export function generateShortLink(withBackendUrl, type) {
  return withBackendUrl
    ? process.env.REACT_APP_API_END_POINT +
    SHORTLINK_TYPES[type] +
    generateShortlyId()
    : generateShortlyId();
}

export function getTotalAmount({
  amount,
  serviceFee,
  taxPercentage,
  isApplyTax,
  isApplyServiceFee,
  isApplyTaxOnServiceFee,
  paymentGatewayFeePayBy,
}) {
  let totalAmount = amount;
  if (isApplyServiceFee) {
    totalAmount += serviceFee;
  }

  if (isApplyTax) {
    if (isApplyTaxOnServiceFee && isApplyServiceFee) {
      const serviceFeeTax = ((amount + serviceFee) * taxPercentage) / 100;
      totalAmount += serviceFeeTax;
    } else {
      const tax = (amount * taxPercentage) / 100;
      totalAmount += tax;
    }
  }

  if (paymentGatewayFeePayBy === "customer") {
    const paymentGatewayFee = calculateProcessingFee({
      amount: totalAmount,
      paymentGatewayFeePayBy,
    });
    console.log("paymentGatewayFee in totalAmount ===>", paymentGatewayFee);
    totalAmount += paymentGatewayFee;
  }

  return totalAmount;
}

export function getTaxValue({
  amount,
  serviceFee,
  taxPercentage,
  isApplyTax,
  isApplyServiceFee,
  isApplyTaxOnServiceFee,
}) {
  let tax = 0;

  if (isApplyTax) {
    if (isApplyTaxOnServiceFee && isApplyServiceFee) {
      tax = ((amount + serviceFee) * taxPercentage) / 100;
    } else {
      tax = (amount * taxPercentage) / 100;
    }
  }

  return tax;
}

export function calculateProcessingFee({ amount, paymentGatewayFeePayBy, placeData }) {
  const percentageFee = get(placeData, 'merchantFee.percentage', 2.9) / 100; //0.029;
  const fixedFee = get(placeData, 'merchantFee.fixedCents', 30); //30;
  let fee = amount * percentageFee + fixedFee;
  if (paymentGatewayFeePayBy === "customer") {
    fee *= (1 + percentageFee);
  }
  return fee;
}

export function calculateTotalAmountWithTaxAndFee({
  amount,
  serviceFee,
  taxPercentage,
  cityTaxPercentage,
  countyTaxPercentage,
  isApplyTax,
  isApplyServiceFee,
  isApplyTaxOnServiceFee,
  paymentGatewayFeePayBy,
  placeData,
}) {
  let totalAmount = amount;
  let tax = 0;
  let cityTax = 0;
  let countyTax = 0;
  let paymentGatewayFee = 0;

  function roundUp(value) {
    return Math.ceil(value);
  }

  // Calculate tax
  if (isApplyTax) {
    if (isApplyTaxOnServiceFee && isApplyServiceFee) {
      tax = roundUp(((amount + serviceFee) * taxPercentage) / 100);
      cityTax = roundUp(((amount + serviceFee) * cityTaxPercentage) / 100);
      countyTax = roundUp(((amount + serviceFee) * countyTaxPercentage) / 100);
    } else {
      tax = roundUp((amount * taxPercentage) / 100);
      cityTax = roundUp((amount * cityTaxPercentage) / 100);
      countyTax = roundUp((amount * countyTaxPercentage) / 100);
    }
    // Add tax to total amount
    totalAmount = roundUp(totalAmount + tax + cityTax + countyTax);
  }

  // Add service fee
  if (isApplyServiceFee) {
    totalAmount = roundUp(totalAmount + serviceFee);
  }

  // Calculate payment gateway fee
  if (paymentGatewayFeePayBy === "customer") {
    paymentGatewayFee = roundUp(
      calculateProcessingFee({
        amount: totalAmount,
        paymentGatewayFeePayBy,
        placeData,
      })
    );
    // Add payment gateway fee to total amount
    totalAmount = roundUp(totalAmount + paymentGatewayFee);
  }

  return {
    totalAmount: roundUp(totalAmount),
    tax,
    cityTax,
    countyTax,
    paymentGatewayFee,
  };
}

export function getDateInfo(date) {
  const daysInMonth = date.daysInMonth();
  const currentDayOfMonth = date.date(); // Get the current day of the month
  const daysLeftInMonth = daysInMonth - currentDayOfMonth + 1; // Calculate the days left in the month
  return {
    daysInMonth,
    daysLeftInMonth,
  };
}

export function amountToShow(amount) {
  const formattedAmount = amount / 100;
  return `${formattedAmount.toFixed(2)}`;
}


export function floorAmountToShow(amount) {
  // const formattedAmount = amount / 100;
  return `${Math.floor(amount) / 100}`;
}

export function licensePlateArrayToString(licensePlateArray) {
  const licensePlateString = licensePlateArray
    .filter((plate) => plate.status === 10)
    .map((lp) => lp.licensePlateNumber)
    .join(", ");
  return licensePlateString;
}

export function getTimezoneName() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formateValue(str) {
  let words = str.split(/(?=[A-Z])/);
  // Capitalize the first character of the first word
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  // Join the words back together
  let result = words.join(" ");

  return result;
}

export function formattedDateWithTime(dateWithTime) {
  const createAt = moment(dateWithTime);
  const now = moment();
  const diff = now.diff(createAt, "minutes");
  const formattedDate = createAt.format("DD-MM-YYYY hh:mm A");

  let timeAgo;
  if (diff < 1) {
    timeAgo = "just now";
  } else if (diff < 60) {
    timeAgo = `${diff} minute${diff > 1 ? "s" : ""} ago`;
  } else if (diff < 1440) {
    const hours = Math.floor(diff / 60);
    timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (diff < 10080) {
    const days = Math.floor(diff / 1440);
    timeAgo = `${days} day${days > 1 ? "s" : ""} ago`;
  } else {
    timeAgo = formattedDate;
  }
  return timeAgo;
}

export function getHours({ startDate, endDate }) {
  const startDateA = moment(startDate);
  const endDateA = moment(endDate);

  const diffInMinutes = endDateA.diff(startDateA, "minutes");

  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  let result = "";
  if (hours > 0) {
    result += `${hours} Hour${hours !== 1 ? "s" : ""}`;
  }
  if (minutes > 0) {
    if (hours > 0) result += " ";
    result += `${minutes} Minute${minutes !== 1 ? "s" : ""}`;
  }

  return result || "0 minutes"; // Handle the case when both hours and minutes are 0
}

export function formatTime24to12(time24) {
  const [hour, minute] = time24.split(':');
  let period = 'AM';
  let hour12 = parseInt(hour, 10);

  if (hour12 >= 12) {
    period = 'PM';
    if (hour12 > 12) hour12 -= 12;
  } else if (hour12 === 0) {
    hour12 = 12;
  }

  return `${hour12}:${minute} ${period}`;
}

export function generateDisplayNameForRate({
  rateType = "Hourly",
  amount = 0,
  hours = 0,
  endTime = "N/A",
  endDay = "N/A",
} = {}) {
  let displayName = "";

  // Ensure values are not undefined or NaN
  const validAmount = !isNaN(amount) ? amount : 0;
  const validHours = !isNaN(hours) ? hours : 0;
  const formattedEndTime = endTime !== "N/A" ? formatTime24to12(endTime) : "N/A";

  switch (rateType) {
    case "Daily":
      displayName = `${validHours} hr${validHours !== 1 ? "s" : ""} @ $${validAmount}`;
      break;
    case "Hourly":
      displayName = `$${validAmount} / hour`;
      break;
    case "All Day":
      displayName = `All day @ $${validAmount} (Good until ${formattedEndTime})`;
      break;
    case "Overnight":
      displayName = `Overnight @ $${validAmount} (Good until ${formattedEndTime} ${endDay === "Same day" ? "Today" : "Next Day"})`;
      break;
    default:
      displayName = "Invalid rate type";
      break;
  }

  return displayName;
}

export function getStripePublicKey(place) {
  let PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

  if (!place) {
    return PUBLISHABLE_KEY;
  }

  switch (get(place, "stripeConfiguration.name", "")) {
    case "umair-test":
      PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY_UMAIR_TEST;
      break;
    case "pmc":
      PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY_PMC;
      break;
  }

  return PUBLISHABLE_KEY;
}

export function getStripeCustomerId(customer, place) {
  const stripeConfiguration = get(place, "stripeConfiguration.name", "default")

  return get(customer, `stripeCustomerIds.${stripeConfiguration}.customerId`, null);
}
