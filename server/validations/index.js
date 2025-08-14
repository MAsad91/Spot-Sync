const Joi = require("joi");
const validDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.tokenSchema = Joi.object({
  email: Joi.string().email().required(),
});

exports.assignRatesSchema = Joi.object({
  placeId: Joi.string().required(),
  rateIds: Joi.array().items(Joi.string()).min(1).required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  days: Joi.array()
    .items(Joi.string().valid(...validDays))
    .min(1)
    .required(),
  isExtensionRate: Joi.boolean().required(),
  isExtensionBasedRate: Joi.boolean().required(),
  extendedFor: Joi.string().optional().allow(""),
  isHideFromSuggestions: Joi.boolean().required(),
  occupancy: Joi.number().required(),
});

exports.specialEventsSchema = Joi.object({
  placeId: Joi.string().required(),
  rateIds: Joi.array().items(Joi.string()).min(1).required(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
  isExtensionRate: Joi.boolean().required(),
  isSpecialEvent: Joi.boolean().required(),
  isHideFromSuggestions: Joi.boolean().required(),
  occupancy: Joi.number().required(),
});

exports.blackoutDaysSchema = Joi.object({
  placeId: Joi.string().required(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
  isBlackout: Joi.boolean().required(),
  message: Joi.string().optional().allow(""),
});

exports.getByPlaceIdSchema = Joi.object({
  placeId: Joi.string().required(),
});

exports.automatedReportSchema = Joi.object({
  toEmail: Joi.string().required(),
  ccEmails: Joi.array().items(Joi.string()).optional(),
  placeIds: Joi.array().items(Joi.string()).min(1).required(),
  isDaily: Joi.boolean().required(),
  isWeekly: Joi.boolean().required(),
  isMonthly: Joi.boolean().required(),
  isTransaction: Joi.boolean().required(),
  isRefund: Joi.boolean().required(),
  isPermit: Joi.boolean().required(),
});

exports.automatedValidationSchema = Joi.object({
  placeId: Joi.string().required(),
  presetCodes: Joi.boolean().required(),
  validationCodes: Joi.array().items(Joi.string()).min(1).required(),
  rateId: Joi.array().items(Joi.string()).min(1).required(),
  duration: Joi.string().required(),
  validFrom: Joi.string().required(),
  validUntil: Joi.string().required(),
  toEmail: Joi.string().required(),
  ccEmails: Joi.array().items(Joi.string()).required(),
  discount: Joi.string().required(),
  quantity: Joi.string().required(),
  slackChannel: Joi.string().required(),
});

exports.brandSchema = Joi.object({
  brandName: Joi.string().required(),
  shortBrandName: Joi.string().required(),
  ownerName: Joi.string().required(),
  ownerEmail: Joi.string().required(),
  ownerMobileNumber: Joi.string().required(),
});

exports.placeSchema = Joi.object({
  brandId: Joi.string().required(),
  parkingCode: Joi.string().required(),
  lotName: Joi.string().required(),
  spaces: Joi.number().required(),
  google: Joi.object().required(),
  statementDescriptor: Joi.string().optional().allow(""),
});
