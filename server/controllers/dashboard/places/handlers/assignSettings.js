const Places = require("../../../../models/places");
const {
  http200,
  http400,
  http401,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { PAYMENT_GATEWAY } = require("../../../../config");

module.exports = async (req, res) => {
  let success = false;
  const fields = ["plivoNumber", "plivoId"];
  try {
    const {
      userId,
      params: { placeId },
      body,
    } = req;
    // console.log("Body ====>", body);
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    if (!placeId || !isValidObjectId(placeId))
      return res.status(http403).json({
        success,
        message: "Invalid place Id",
      });

    const filter = { _id: ObjectId(placeId) };
    const update = {};
    let keysFound = false;

    if (body?.paymentGateway) {
      const uppercasePaymentGateway = body.paymentGateway.toUpperCase();
      if (!PAYMENT_GATEWAY.hasOwnProperty(uppercasePaymentGateway))
        return res.status(http400).json({
          success,
          message: "Invalid payment gateway",
        });
      let paymentGatewayObj = {
        paymentGateway: uppercasePaymentGateway,
      };
      if (uppercasePaymentGateway === "STRIPE") {
        if (!body?.connectAccountId) {
          return res.status(http400).json({
            success,
            message: "Connect Account is required!",
          });
        }
        paymentGatewayObj.connectAccountId = body?.connectAccountId;
      }
      update["$set"] = paymentGatewayObj;
      keysFound = true;
    }

    if (body?.stripeConfiguration) {
      update["$set"] = {
        ...update["$set"],
        stripeConfiguration: body.stripeConfiguration,
      };
      keysFound = true;
    }



    if (body.extensionExpireLimit) {
      const extensionObject = {
        extensionExpireLimit: body.extensionExpireLimit,
        isExtensionEnable: body.isExtensionEnable,
      };
      update["$set"] = extensionObject;
      keysFound = true;
    }

    fields.forEach((key) => {
      if (body[key]) {
        update["$set"] = { ...update.$set, [key]: body[key] };
        keysFound = true;
      }
    });

    if (!keysFound)
      return res.status(http400).json({
        success,
        message:
          "At least one of 'plivoNumber' or 'paymentGateway' is required!",
      });

    const updatedPlace = await Places.updateOne(filter, update);

    if (updatedPlace.nModified === 0)
      return res.status(http200).json({
        success,
        message: "Place already updated!",
      });

    return res.status(http200).json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
