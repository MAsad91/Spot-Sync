const { isValidObjectId } = require("mongoose");
const { http400, http200 } = require("../../../../global/errors/httpCodes");
const AutomatedValidations = require("../../../../models/automatedValidations");

module.exports = async (req, res) => {
  try {
    const { body, userId } = req;
    const {
      rateId,
      validFrom,
      validUntil,
      validationCodes,
      presetCodes,
      discount,
      quantity,
      toEmail,
      duration,
      ccEmails,
      placeId,
      slackChannel = ""
    } = body;

    // console.log("body=====>",body)
    if (!userId || !isValidObjectId(userId)) {
      return res.status(http400).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (!placeId || !isValidObjectId(placeId))
      return res
        .status(http400)
        .json({ success: false, message: "Invalid place Id" });

    if (!toEmail || toEmail?.trim().length <= 0) {
      return res.status(http400).json({
        success: false,
        message: "Invalid email",
      });
    }

    const payload = {
      userId,
      presetCodes,
      validationCodes,
      validUntil,
      validFrom,
      rateId,
      toEmail,
      ccEmails,
      placeId,
      isDaily: duration === "daily",
      isWeekly: duration === "weekly",
      isMonthly: duration === "monthly",
      isYearly: duration === "yearly",
      discount,
      quantity,
      slackChannel
    };

    const validation = await AutomatedValidations.create(payload);

    if (!validation) {
      return res.status(http400).json({
        success: false,
        message: "Something went wrong",
      });
    }

    return res.status(http200).json({
      success: true,
      message: "Validation created successfully",
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong",
    });
  }
};
