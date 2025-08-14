const { http200, http400 } = require("../../../global/errors/httpCodes");
const phoneValidationService = require("../../../services/phoneValidation");

module.exports = async (req, res) => {
  try {
    const { phoneNumber, countryCode } = req.body;
    
    if (!phoneNumber) {
      return res.status(http400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    console.log("Testing phone validation...");
    console.log("Phone number:", phoneNumber);
    console.log("Country code:", countryCode || "auto-detect");

    // Test the phone validation service
    const validation = phoneValidationService.validatePhoneNumber(phoneNumber, countryCode);

    if (validation.isValid) {
      return res.status(http200).json({
        success: true,
        message: "Phone number is valid!",
        data: {
          originalNumber: phoneNumber,
          validatedNumber: validation.number,
          countryCode: validation.countryCode,
          countryName: validation.countryName,
          countryCallingCode: validation.countryCallingCode,
          internationalNumber: validation.internationalNumber,
          nationalNumberFormatted: validation.nationalNumberFormatted,
          type: validation.type,
          isMobile: validation.isMobile,
          isFixedLine: validation.isFixedLine,
          autoDetected: validation.autoDetected || false
        },
      });
    } else {
      return res.status(http400).json({
        success: false,
        message: "Phone number is invalid",
        data: {
          originalNumber: phoneNumber,
          error: validation.error,
          suggestions: validation.suggestions || []
        },
      });
    }
  } catch (error) {
    console.error("Phone validation test error:", error);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
}; 