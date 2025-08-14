const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Simple phone number parsing function
function getParsedPhoneNumberInfo(phoneNumber) {
  try {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    
    if (cleanedNumber.length === 11 && cleanedNumber.startsWith('1')) {
      return {
        isValid: true,
        number: cleanedNumber,
        countryCallingCode: "+1"
      };
    }
    
    if (cleanedNumber.length === 10) {
      return {
        isValid: true,
        number: `1${cleanedNumber}`,
        countryCallingCode: "+1"
      };
    }
    
    if (phoneNumber.startsWith('+') && cleanedNumber.length >= 10) {
      return {
        isValid: true,
        number: cleanedNumber,
        countryCallingCode: phoneNumber.substring(0, phoneNumber.indexOf(cleanedNumber))
      };
    }
    
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

const CustomerSchema = new Schema(
  {
    stripeCustomerId: { type: String },
    paymentMethodId: { type: String },
    email: { type: String },
    mobile: { type: String },
    secondaryMobile: { type: String },
    password: { type: String },
    status: { type: Number, default: 10 },
    otp: { type: Number },
    otpExpiryTime: { type: Date },
    isEmailPrimary: { type: Boolean, default: false },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    companyName: { type: String, default: "" },
    placeId: { type: Schema.Types.ObjectId, ref: "places" },
    brandId: { type: Schema.Types.ObjectId, ref: "brands" },
    connectAccountCustomerIds: { type: Object },
    stripeCustomerIds: { type: Object },
    authorizenetCustomerIds: { type: Object },
  },
  { timestamps: true }
);

CustomerSchema.statics.findOneAndUpdateCustomer = async function (
  filter,
  update,
  options,
  callback = null
) {
  let { mobile, ...newFilter } = filter;

  if (mobile) {
    const parsedPhoneNumber = getParsedPhoneNumberInfo(mobile);

    if (parsedPhoneNumber.isValid) {
      update.mobile = parsedPhoneNumber.number;

      newFilter = {
        $and: [
          { $or: [{ mobile }, { mobile: parsedPhoneNumber.number }] },
          { ...newFilter },
        ],
      };
    } else {
      newFilter.mobile = mobile;
    }
  }

  return await this.findOneAndUpdate(newFilter, update, options, callback);
};

CustomerSchema.statics.findOneByMobile = async function (mobile) {
  const parsedPhoneNumber = getParsedPhoneNumberInfo(mobile);

  if (parsedPhoneNumber.isValid) {
    return await this.findOne({
      status: 10,
      $or: [
        { $or: [{ mobile }, { mobile: parsedPhoneNumber.number }] },
        {
          $or: [
            { secondaryMobile: mobile },
            { secondaryMobile: parsedPhoneNumber.number },
          ],
        },
      ],
    });
  }

  return await this.findOne({ mobile });
};

module.exports = User = mongoose.model("customers", CustomerSchema);
