const {
  Types: { ObjectId },
} = require("mongoose");
const { http200, http400 } = require("../../../../global/errors/httpCodes");
const Permits = require("../../../../models/permits");
const Places = require("../../../../models/places")
const moment = require("moment");
const {
  generateSerialNumber,
} = require("../../../../global/functions");

const { get } = require("lodash")
const { DOC_STATUS } = require("../../../../constants");

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

module.exports = async (req, res) => {
  try {
    const { userId, body } = req;
    body.licensePlate = body.licensePlate.map((plate) => plate.toUpperCase());

    const parsedMobileNumber = getParsedPhoneNumberInfo(body.phoneNo);

    if (parsedMobileNumber !== null) {
      body.phoneNo = parsedMobileNumber.number;
    }

    const {
      placeId,
      licensePlate,
      startDate,
      endDate
    } = body;
    const [permitNo] = await Promise.all([generateSerialNumber({ type: "permit" })]);
    body.permitNumber = permitNo;
    const permitStart = moment(startDate).startOf('day')
    const permitEnd = moment(endDate).startOf('day')
    // console.log("body ====>", body);
    if (!userId || !ObjectId.isValid(userId)) throw new Error("Invalid Token");
    if (!placeId || !ObjectId.isValid(placeId))
      throw new Error("Invalid place Id");
    if (startDate === 'Invalid date')
      return res.status(http400).json({
        success: false,
        message: "Permit Start Date required",
      });
    if (endDate === 'Invalid date')
      return res.status(http400).json({
        success: false,
        message: "Permit Expiration Date required",
      });
    const place = await Places.findOne({ _id: placeId })
    const existingPermits = await Permits.find({
      status: { $ne: 'deleted' },
      placeId: ObjectId(placeId),
      licensePlate: { $in: licensePlate },
      startDate: { $lte: permitEnd },
      endDate: { $gte: permitStart }
    });
    if (existingPermits.length > 0) {
      return res.status(http200).json({
        success: false,
        message: "Permit already exists !!!",
      });
    }
    const permit = await Permits.create(body);
    if (permit) {

    } 
    return res
      .status(http200)
      .json({ success: true, message: "Permit created successfully" });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message ?? "Something went wrong!",
    });
  }
};
