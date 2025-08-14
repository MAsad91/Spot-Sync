const {
  Types: { ObjectId },
} = require("mongoose");
const { http200, http400 } = require("../../../../global/errors/httpCodes");
const Permits = require("../../../../models/permits");
const Places = require("../../../../models/places")
const moment = require("moment");

const { get } = require("lodash");
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
const { permitApprovalEmail } = require("../../../../services/email");

module.exports = async (req, res) => {
  try {
    const { userId, body } = req;

    const parsedMobileNumber = getParsedPhoneNumberInfo(body.phoneNo);

    if (parsedMobileNumber !== null) {
      body.phoneNo = parsedMobileNumber.number;
    }

    body.licensePlate = body.licensePlate.map((plate) => plate.toUpperCase());
    const {
      placeId,
      id,
      startDate,
      endDate,
      licensePlate
    } = body;
    body.updatedAt = new Date()
    if (!userId || !ObjectId.isValid(userId)) throw new Error("Invalid Token");
    if (!placeId || !ObjectId.isValid(placeId)) throw new Error("Invalid place Id");
    const place = await Places.findOne({
      status: DOC_STATUS.ACTIVE,
      _id: placeId
    }).populate("brandId");

    const permitStart = moment(startDate).startOf('day')
    const permitEnd = moment(endDate).startOf('day')
    const existingPermits = await Permits.find({
      status: { $ne: "deleted" },
      placeId: ObjectId(placeId),
      licensePlate: { $in: licensePlate },
      _id: { $ne: ObjectId(id) }, // exclude the current permit being updated
      startDate: { $lte: permitEnd },
      endDate: { $gte: permitStart },
    });

    if (existingPermits.length > 0) {
      return res.status(http200).json({
        success: false,
        message: "Permit already exists for the same dates and license plate !!!",
      });
    }
    const beforeUpdatePermit = await Permits.findById(id);
    const permit = await Permits.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (permit && beforeUpdatePermit.status === "requested" && permit.email !== "" ) {
      const emailProps = {
        licensePlate: permit.licensePlate.toString(),
        status: permit.status,
        placeAddress: place.google.formatted_address,
        permitNumber: permit.permitNumber,
        internalId: permit.internalId,
        assignedName: permit.assignedName,
        email: permit.email,
        phoneNo: permit.phoneNo,
        startDate: moment(permit.startDate).format("MM-DD-YYYY"),
        endDate: moment(permit.endDate).format("MM-DD-YYYY"),
        vehicleMake: permit.vehicleMake,
        vehicleModel: permit.vehicleModel,
        vehicleState: permit.vehicleState,
        permitType: permit.permitType,
        rateId: permit.rateId,
        brandName: place.brandId.brandName,
        brandLogo: place.brandId.brandLogo
      };
      await permitApprovalEmail({
        toEmail: permit.email,
        dynamicTemplateData: emailProps,
      });
    }


    return res
      .status(http200)
      .json({ success: true, message: "Permit updated successfully" });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message ?? "Something went wrong!",
    });
  }
};
