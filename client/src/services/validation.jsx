import parsePhoneNumberFromString, {
  parsePhoneNumber,
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
} from "libphonenumber-js";
import * as Yup from "yup";
import moment from "moment";
// const onlyCharactersRegx = /^[aA-zZ\s]+$/;
const specialCharactersNotAllowedRegx = /^[a-zA-Z0-9\s]+$/;
const onlyNumbersRegx = /^-?[0-9]*$/;
const onlyAlphabetRegx = /^[a-zA-Z\s]+$/;

const FLOW_TYPES = ["BOTCOPY", "SMS", "HYBRID"];

// Enhanced international phone number validation function
const validateInternationalPhone = (value) => {
  if (!value) return false;
  
  try {
    // Try to parse with auto-detection
    let number = parsePhoneNumberFromString(value);
    if (number && number.isValid()) {
      return true;
    }

    // Try with common countries if auto-detection fails
    const commonCountries = ["US", "CA", "GB", "AU", "IN", "DE", "FR", "IT", "ES", "BR", "MX", "JP", "KR", "CN"];
    for (const country of commonCountries) {
      number = parsePhoneNumberFromString(value, country);
      if (number && number.isValid()) {
        return true;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
};

// Get country name for display
const getCountryName = (countryCode) => {
  const countryNames = {
    "US": "United States",
    "CA": "Canada",
    "GB": "United Kingdom",
    "AU": "Australia",
    "IN": "India",
    "DE": "Germany",
    "FR": "France",
    "IT": "Italy",
    "ES": "Spain",
    "BR": "Brazil",
    "MX": "Mexico",
    "JP": "Japan",
    "KR": "South Korea",
    "CN": "China",
  };
  return countryNames[countryCode] || countryCode;
};

export const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter valid Email")
    .required("Email is required!"),
  password: Yup.string()
    .min(6, "Password min length 6 digits")
    .max(18, "Password is too long!")
    .required("Password is required!"),
});

export const createUserValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First Name is required!")
    .label("First Name"),
  lastName: Yup.string().required("Last Name is required!").label("Last Name"),
  email: Yup.string()
    .email("Please enter valid Email")
    .required("Email is required!"),
  mobile: Yup.string()
    .label("Mobile is required!")
    .required()
    .test("is-valid-phone", "Please enter a valid international phone number", (value) => {
      console.log("value", value);
      return validateInternationalPhone(value);
    }),
  roleId: Yup.string().required().label("Select Role"),
  locations: Yup.array().required().label("Locations"),
});

export const createBrandValidationSchema = Yup.object().shape({
  brandLogo: Yup.array()
    .min(1, "Brand Logo is Required")
    .max(1, "Can not upload more than 1 Brand Logo"),
  brandName: Yup.string().required("Brand Name is required"),
  brandAddress: Yup.string().required("Address is required"),
  shortBrandName: Yup.string().required("Short Name is required"),
  userType: Yup.string().oneOf(
    ["new", "existing"],
    "User type must be either new or existing"
  ),
  ownerName: Yup.string().when("userType", {
    is: (value) => value === "new",
    then: () => Yup.string().required("Owner Name is required"),
    otherwise: () => Yup.string().nullable(),
  }),
  ownerEmail: Yup.string()
    .email()
    .when("userType", {
      is: (value) => value === "new",
      then: () => Yup.string().email().required("Owner Email is required"),
      otherwise: () => Yup.string().nullable(),
    }),
  ownerMobileNumber: Yup.string().when("userType", {
    is: (value) => value === "new",
    then: () =>
      Yup.string()
        .required("Owner Mobile is required")
        .test("is-valid-phone", "Please enter a valid international phone number", (value) => {
          return validateInternationalPhone(value);
        }),
    otherwise: () => Yup.string().nullable(),
  }),
});

export const uploadImageValidationSchema = Yup.object().shape({
  brandLogo: Yup.array()
    .min(1, "Brand Logo is Required")
    .max(1, "can not upload more than 1 Brand Logo"),
});
export const createRolesValidationSchema = Yup.object().shape({
  title: Yup.string().required().label("Role Title"),
});

export const paymentGatewayValidationSchema = Yup.object().shape({
  // paymentGateway: Yup.string()
  //   .required("Payment Gateway is required")
  //   .label("paymentGateway"),
});

export const plivoNumberValidationSchema = Yup.object().shape({
  plivoNumber: Yup.number().required().label("plivoNumber"),
});

export const createPlaceValidationSchema = Yup.object().shape({
  brandId: Yup.string().required().label("Brand"),
  google: Yup.object().required().label("Address"),
  parkingCode: Yup.string()
    .matches(
      specialCharactersNotAllowedRegx,
      "Please enter a valid Parking Code"
    )
    .required()
    .label("Parking Code"),
  lotName: Yup.string()
    .matches(specialCharactersNotAllowedRegx, "Please enter a valid Lot Name")
    .required()
    .label("Lot Name"),
  statementDescriptor: Yup.string()
    .max(20)
    .required()
    .label("Statement Descriptor"),
  spaces: Yup.number()
    .required()
    .label("Number of Spaces"),

});

export const createRateValidation = Yup.object().shape({
  rateType: Yup.string().required().label("Rate Type"),
  title: Yup.string().required().label("Title"),
  displayName: Yup.string()
    .when("rateType", {
      is: "Custom",
      then: () =>
        Yup.string()
          .required("Display Name is required when rateType is custom")
          .max(25, "Display name should be maximum 25 characters"),
    })
    .label("Display Name"),
  isFreeRate: Yup.boolean().required(),
  isPass: Yup.boolean().required(),
  amount: Yup.number()
    .when(["isFreeRate", "secondStepValidation", "isRateOption", "isPermit"], {
      is: (isFreeRate, secondStepValidation, isRateOption, isPermit) =>
        !isFreeRate && !secondStepValidation && !isRateOption && !isPermit,
      then: () =>
        Yup.number()
          .positive("Amount must be a positive value")
          .required("Amount is required"),
      otherwise: () => Yup.number().required("Amount is required"),
    })
    .label("Amount"),
  // payNowValidationLaterFlow: Yup.boolean().required(),
  gracePeriod: Yup.number()
    .when(["payNowValidationLaterFlow"], {
      is: true,
      then: () =>
        Yup.number()
          .positive("Grace Period must be a positive value")
          .required(
            "Grace Period is required when Pay Now Validate Later Flow is enabled"
          ),
    })
    .label("Grace Period"),
  endTime: Yup.string()
  .when("timeType", {
    is: (timeType) => timeType === "Fixed End Time",
    otherwise: () => Yup.string().nullable(),
  })
  .test("is-valid-time", "end time must be a valid time, please select from dropdown", (value) => {
    return value ? moment(value, "HH:mm", true).isValid() : false;
  }),
  customStartDate: Yup.string()
  .when("timeType", {
    is: (timeType) => timeType === "Custom Duration",
    otherwise: () => Yup.string().nullable(),
  })
  .test("is-valid-time", "end time must be a valid time, please select from dropdown", (value) => {
    return value !== null;
  }),
  startDay: Yup.string()
    .when("isPass", {
      is: true,
      then: () =>
        Yup.string()
          .required("Start Day is required"),
      otherwise: () => Yup.string().nullable(),
    }),
  startTime: Yup.string()
    .when("isPass", {
      is: true,
      then: () =>
        Yup.string()
          .required("Start Time is required"),
      otherwise: () => Yup.string().nullable(),
    }),
});

export const createAssignRateValidation = Yup.object().shape({
  rateType: Yup.string().required().label("Rate Type"),
  startTime: Yup.string().required().label("Start Time"),
  endTime: Yup.number().required().label("End Time"),
  days: Yup.array().required().label("Days"),
});

export const createSlackValidation = Yup.object().shape({
  purpose: Yup.string().required().label("Select Purpose"),
  channelName: Yup.string().required().label("Channel Name"),
  workSpace: Yup.string().required().label("Work Space"),
  webhookURL: Yup.string().required().label("Webhook URL"),
});

export const updatePaymentFeeValidation = Yup.object().shape({
  // Pakistani Tax Validation
  gst: Yup.number()
    .typeError("GST must be a number")
    .required()
    .label("GST")
    .max(100, "GST should be maximum 100 %"),
  federalExciseDuty: Yup.number()
    .typeError("Federal Excise Duty must be a number")
    .required()
    .label("Federal Excise Duty")
    .max(100, "Federal Excise Duty should be maximum 100 %"),
  provincialTax: Yup.number()
    .typeError("Provincial Tax must be a number")
    .required()
    .label("Provincial Tax")
    .max(100, "Provincial Tax should be maximum 100 %"),
  withholdingTax: Yup.number()
    .typeError("Withholding Tax must be a number")
    .required()
    .label("Withholding Tax")
    .max(100, "Withholding Tax should be maximum 100 %"),
  
  // Legacy tax validation (for backward compatibility)
  tax: Yup.number()
    .typeError("Tax must be a number")
    .required()
    .label("Tax")
    .max(100, "Tax should be maximum 100 %"),
});

export const EditLicensePlateValidationSchema = Yup.object().shape({
  licensePlateNumber: Yup.string().required("License Plate Number is required"),
  price: Yup.number()
    // .positive("Price must be positive")
    .required("Price is required"),
});

const licensePlateSchema = Yup.object().shape({
  licensePlateNumber: Yup.string().required("License Plate Number is required"),
  price: Yup.number()
    // .positive("Price must be positive")
    .required("Price is required"),
});
const addLicensePlateSchema = Yup.object().shape({
  licensePlateNumber: Yup.string().required("License Plate Number is required"),
});

export const CreateSubscriptionValidationSchema = Yup.lazy((values) =>
  Yup.object()
    .shape({
      startDate: Yup.date().required("Start Date is required"),
      endDate: Yup.date()
        .min(Yup.ref("startDate"), "End Date can't be before Start Date")
        .required("End Date is required"),
      email: Yup.string().email("Please enter a valid Email"),
      mobile: Yup.string()
        .test("is-valid-phone", "Please enter a valid international phone number", (value) => {
          if (!value) return true; // Allow empty if email is provided
          return validateInternationalPhone(value);
        }),
      firstName: Yup.string().required("First Name is required"),
      lastName: Yup.string().required("Last Name is required"),
      licensePlate: Yup.array()
        .of(licensePlateSchema)
        .min(1, "Please add at least one License Plate Number")
        .required("License Plate is required"),
    })
    .test(
      "email-or-mobile",
      "Either Email or Mobile is required",
      (value) => value.email || value.mobile
    )
);

export const AddLicensePlateValidationSchema = Yup.lazy((values) =>
  Yup.object().shape({
    licensePlate: Yup.array()
      .of(addLicensePlateSchema)
      .min(1, "Please add at least one License Plate Number")
      .required("License Plate is required"),
  })
);
export const UpdateLicensePlateValidationSchema = Yup.lazy((values) =>
  Yup.object().shape({
    licensePlate: Yup.array()
      .of(licensePlateSchema)
      .min(1, "Please add at least one License Plate Number")
      .required("License Plate is required"),
  })
);

export const createPricingTierValidation = (isDefault) =>
  Yup.object().shape({
    ...(isDefault
      ? {
          serviceFee: Yup.number().required().label("Service Fee"),
          condition_on: Yup.string().required().label("Condition On"),
          condition_operator: Yup.string().required().label("Operator"),
          condition_value: Yup.number().required().label("Amount"),
        }
      : {
          serviceFee: Yup.number().required().label("Service Fee"),
          subscriptionServiceFee: Yup.number()
            .required()
            .label("Subscription Service Fee"),
        }),
  });

export const createPricingTierUpdateValidation = (isDefault) =>
  Yup.object().shape({
    ...(isDefault
      ? {
          serviceFee: Yup.number().required().label("Service Fee"),
          subscriptionServiceFee: Yup.number()
            .required()
            .label("Subscription Service Fee"),
        }
      : {
          serviceFee: Yup.number().required().label("Service Fee"),
          condition_on: Yup.string().required().label("Condition On"),
          condition_operator: Yup.string().required().label("Operator"),
          condition_value: Yup.number().required().label("Amount"),
        }),
  });

export const createAutomatedReportValidation = Yup.object()
  .shape({
    toEmail: Yup.string()
      .email("Please enter a valid Email")
      .required("Email is required!"),
    ccEmails: Yup.array()
      .of(Yup.string().email("Please enter valid Email"))
      .optional(),
    placeIds: Yup.array()
      .of(Yup.string().required("Place ID is required"))
      .min(1, "At least one place is required"),
    isDaily: Yup.boolean(),
    isMonthly: Yup.boolean(),
    isWeekly: Yup.boolean(),
    isTransaction: Yup.boolean(),
    isRefund: Yup.boolean(),
  })
  .test(
    "is-daily-or-monthly-required",
    'Either "Daily",  "Weekly" or "Monthly setting must be selected',
    function (values) {
      const { isDaily, isMonthly, isWeekly } = values;
      if (!isDaily && !isMonthly && !isWeekly) {
        return this.createError({
          path: "email_setting",
          message: this.message,
        });
      }
      return true;
    }
  )
  .test(
    "at-least-one-transaction-or-refund-required",
    'At least one of "Transaction" or "Refund" setting must be selected',
    function (values) {
      const { isTransaction, isRefund } = values;
      if (!isTransaction && !isRefund) {
        return this.createError({
          path: "transaction_or_refund",
          message: this.message,
        });
      }
      return true;
    }
  );;

export const CreatePermitSchema = Yup.object().shape({
  email: Yup.string().email("Please enter a valid Email").required("Email is required"),
  phoneNo: Yup.string().nullable().test(
    "is-valid-phone",
    "Please enter a valid international phone number",
    (value) => {
      console.log("value", value);

      if (!value || value === '+') {
        return true;
      }
      return validateInternationalPhone(value);
    }
  ).required("Phone no is required"),
  internalId: Yup.string()
  .when("selectedPermitOption", {
    is: (selectedPermitOption) => selectedPermitOption?.displayUnitNumber,
    then: () =>
      Yup.string()
        .required("Unit number is required"),
    otherwise: () => Yup.string().nullable(),
  }),
  licensePlate: Yup.array()
    .of(Yup.string().required("License Plate is required"))
    .min(1, "Please add at least one License Plate Number")
    .required("License Plate is required"),
  vehicleMake: Yup.string().required("Vehicle Make is required"),
  vehicleModel: Yup.string().required("Vehicle Model is required"),
  vehicleState: Yup.string().required("Vehicle State is required"),
});

export const updateBrandDefaultSettingsValidationSchema = Yup.object().shape({
  subscriptionStateTax: Yup.number()
    .min(0, "Tax must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("Tax is required!"),
  subscriptionCityTax: Yup.number()
    .min(0, "City Tax must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("City Tax is required!"),
  subscriptionCountyTax: Yup.number()
    .min(0, "County Tax must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("County Tax is required!"),
  transientStateTax: Yup.number()
    .min(0, "Tax must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("Tax is required!"),
  transientCityTax: Yup.number()
    .min(0, "City Tax must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("City Tax is required!"),
  transientCountyTax: Yup.number()
    .min(0, "County Tax must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("County Tax is required!"),
  paymentGatewayFeePercentage: Yup.number()
    .min(0, "Percentage must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("Percentage is required!"),
  paymentGatewayFeeFixedCents: Yup.number()
    .min(0, "Fixed Cents must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("Fixed Cents is required!"),
  isbpRevenue: Yup.number()
    .min(0, "ISBParking Revenue must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("ISBParking Revenue is required!"),
  subscriptionIsbpRevenue: Yup.number()
    .min(0, "Subscription ISBParking Revenue must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("Subscription ISBParking Revenue is required!"),
  serviceFee: Yup.number()
    .min(0, "Service Fee must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("Service Fee is required!"),
  subscriptionServiceFee: Yup.number()
    .min(0, "Subscription Service Fee must be at least 0")
    .max(100, "Please enter value under 100!")
    .required("Subscription Service Fee is required!"),
});
