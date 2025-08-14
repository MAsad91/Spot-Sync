const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const Places = require("../../../../models/places");
const Brands = require("../../../../models/brands");
const Rates = require("../../../../models/rates");
const event = require("../../../../services/emitter");
const {
  http401,
  http200,
  http400,
} = require("../../../../global/errors/httpCodes");
const {
  lowerCaseWithOptionalReplacer,
  generateDisplayNameForRate,
} = require("../../../../global/functions");

const { createNotification } = require("../../../../services/notifications/notificationsService");

module.exports = async (req, res) => {
  try {
    const { userId, body } = req;

    if (!userId || !isValidObjectId(userId))
      return res.status(http401).json({
        success: false,
        message: "Invalid Token",
      });
    console.log("body ------->", body);
    let requiredFields = ["placeId", "rateType", "title"];
    const lowercaseRateType = lowerCaseWithOptionalReplacer(body.rateType)();
    const isPass = body.isPass || body.isPass === "true";

    if (lowercaseRateType === "daily") requiredFields.push("hours");
    else if (["overnight"].includes(lowercaseRateType))
      requiredFields.push("endDay");
    if (!body.timeType === "Hour Based") {
      requiredFields.push("endDay");
    }

    if (isPass) {
      requiredFields.push("startTime", "startDay");
    }

    for (const field of requiredFields)
      if (!body?.[field])
        return res.status(http400).json({
          success: false,
          message: `${
            field?.charAt(0)?.toUpperCase() + field?.slice(1)
          } required!`,
        });

    body.rateType = lowercaseRateType;
    if (["overnight"].includes(lowercaseRateType))
      body["endDay"] = lowerCaseWithOptionalReplacer(body["endDay"])();
    body["userId"] = userId;

    let triggerName = "";
    switch (body.rateType) {
      case "daily":
        triggerName = `${body.hours} hrs @ $${body.amount}`;
        break;
      default:
        triggerName = body.rateType;
        break;
    }
    body["triggerName"] = triggerName;
    body["amount"] = body?.isFreeRate ? 0 : body?.amount;
    body["isRateOption"] = body?.isFreeRate ? false : body?.isRateOption;
    body["isValidationCodeRequired"] = body?.isFreeRate
      ? false
      : body?.isValidationCodeRequired;
    body["secondStepValidation"] = body?.isFreeRate
      ? false
      : body?.secondStepValidation;

    if (body.rateType !== "custom") {
      body["displayName"] = generateDisplayNameForRate({
        rateType: body?.rateType,
        amount: body?.amount,
        hours: body?.hours,
        endTime: body?.endTime,
        endDay: body?.endDay,
      });
    }

    const rate = await Rates.create(body);
    if (!rate)
      return res.status(http400).json({
        success: false,
        message: "Something went wrong!",
      });



    const placeData = await Places.findOne({ _id: body?.placeId });
    const brandData = await Brands.findOne({
      userId: ObjectId(placeData.userId),
    });

    createNotification({
      title: "Rates Created!",
      content: `${
        brandData?.brandName ? brandData?.brandName : "Super Admin"
      } create rates, rate name ${body?.displayName} on place ${
        placeData?.google?.name
      }`,
      type: "info",
      placeId: body?.placeId,
      userId,
      notificationObject: "Rate"
    })

    event.emit("notification", {
      userId: userId,
      title: "Rates Created!",
      message: `${
        brandData?.brandName ? brandData?.brandName : "Super Admin"
      } create rates, rate name ${body?.displayName} on place ${
        placeData?.google?.name
      }`,
      placeId: body?.placeId,
      brandName: brandData?.shortBrandName,
      brandLogo: brandData?.brandLogo,
    });

    return res.status(http200).json({
      success: true,
      message: "Rate created successfully!",
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
