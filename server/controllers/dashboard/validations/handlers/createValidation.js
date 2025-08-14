const { isValidObjectId } = require("mongoose");
const {
  http401,
  http200,
  http400,
} = require("../../../../global/errors/httpCodes");
const Validation = require("../../../../models/validations");

module.exports = async (req, res) => {
  try {
    const { userId, body } = req;

    if (!userId || !isValidObjectId(userId))
      return res.status(http401).json({
        success: false,
        message: "Invalid Token",
      });

    let requiredFields = ["placeId", "rateId", "validFrom", "validUntil"];
    for (const field of requiredFields)
      if (!body?.[field])
        return res.status(http400).json({
          success: false,
          message: `${
            field?.charAt(0)?.toUpperCase() + field?.slice(1)
          } required!`,
        });

    const { placeId, rateId, validFrom, validUntil } = body;
     const existingValidations = await Validation.find({
       placeId,
       rateId,
       $or: [
         { validFrom: { $lte: validUntil }, validUntil: { $gte: validFrom } },
         { validFrom: { $gte: validFrom, $lte: validUntil } },
         { validUntil: { $gte: validFrom, $lte: validUntil } },
       ],
       status: 10
     });

     if (existingValidations.length > 0) {
       return res.status(http400).json({
         success: false,
         message: "Validation code already available for this duration!",
       });
     }
    body["validationCode"] = body?.validationCode.toLowerCase();
    const validation = await Validation.create(body);
    if (!validation)
      return res.status(http400).json({
        success: false,
        message: "Something went wrong!",
      });

    return res.status(http200).json({
      success: true,
      message: "Validation created successfully!",
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
