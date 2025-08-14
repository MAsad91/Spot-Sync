const { isValidObjectId } = require("mongoose");
const {
  http401,
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  lowerCaseWithOptionalReplacer,
} = require("../../../../global/functions");
const pricingTiers = require("../../../../models/pricingTiers");
const Places = require("../../../../models/places");
const Brands = require("../../../../models/brands");

// const createNotification = require("../../../../services/APIServices/createNotification");
// const { NOTIFICATION_PURPOSE } = require("../../../../constants");
// const Emitter = require("../../../../services/emitter");
const event = require("../../../../services/emitter");

// const io = require("socket.io")(server);
// const EventEmitter = require("events");
// const Emitter = new EventEmitter();

module.exports = async (req, res) => {
  try {
    const { userId, body } = req;

    if (!userId || !isValidObjectId(userId))
      return res.status(http401).json({
        success: false,
        message: "Invalid Token",
      });

    if (!body.placeId || !isValidObjectId(body.placeId))
      return res.status(http403).json({
        success: false,
        message: "Invalid place Id",
      });

    if (body?.isbp_revenue_type === "Percentage" && !body?.isbp_revenue_percent_of) {
      return res.status(http400).json({
        success: false,
        message: "Percentage OF is Required!",
      });
    }
    const pricing = await pricingTiers.create({ creatorId: userId, ...body });
    if (!pricing)
      return res.status(http400).json({
        success: false,
        message: "Something went wrong!",
      });
    // const notificationObject = {
    //   placeId: body.placeId,
    //   linkOut: "http://localhost:3003/pricing_tier",
    //   title: "New Pricing Tier Created!",
    //   message: "New Pricing Tier Created!",
    //   purpose: NOTIFICATION_PURPOSE.CREATE,
    //   type: "success",
    //   onlyForSuperAdmin: true,
    // };

    // const notification = await createNotification(notificationObject);
    // console.log("notification >>>>>>>>>>>>>>>>>>>>>>> ", notification)
    // if (!notification.success) {
    //   return res.status(http400).json({
    //     success: false,
    //     message: "Something went wrong!",
    //   });
    // }

    const placeData = await Places.findOne({ _id: body.placeId });
    const brandData = await Brands.findOne({
      userId: userId,
    });

    event.emit("notification", {
      userId: userId,
      title: "New Pricing Tier Created!",
      message: `${
        brandData?.brandName ? brandData?.brandName : "Super Admin"
      } create new pricing tier on ${placeData?.google?.name} `,
      placeId: placeData?._id,
      brandName: brandData?.shortBrandName,
      brandLogo: brandData?.brandLogo,
    });

    return res.status(http200).json({
      success: true,
      message: "Pricing Tier created successfully!",
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
