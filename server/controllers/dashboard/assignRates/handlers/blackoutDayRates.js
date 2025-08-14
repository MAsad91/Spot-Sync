const {
  isValidObjectId,
  Types: { ObjectId },
} = require("mongoose");
const {
  http200,
  http400,
  http401,
} = require("../../../../global/errors/httpCodes");
const AssignRates = require("../../../../models/assignRates");
const Places = require("../../../../models/places");
const Brands = require("../../../../models/brands");
const { CHECK_SLOT_BOOK } = require("../../../../global/queries");
const { DOC_STATUS } = require("../../../../constants");
const event = require("../../../../services/emitter");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId, body } = req;
    // console.log("body ---->", body);
    if (!userId || !isValidObjectId(userId))
      return res.status(http401).json({
        success,
        message: "Invalid Token",
      });
    if (!body?.placeId || !isValidObjectId(body?.placeId))
      return res.status(http400).json({
        success,
        message: "Invalid place Id",
      });

    if (!body?.startDate)
      return res.status(http400).json({
        success,
        message: "Start Date required",
      });
    if (!body?.endDate)
      return res.status(http400).json({
        success,
        message: "End Date required",
      });
    if (!body?.message)
      return res.status(http400).json({
        success,
        message: "Message required",
      });

    const { startDate, endDate, placeId } = body;

    const query = {
      status: DOC_STATUS["ACTIVE"],
      placeId: ObjectId(placeId),
      isBlackout: true,
      $or: [
        { 
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ],
    };

    const isRateConflicts = await AssignRates.findOne(query).lean();
    if (isRateConflicts)
      return res.status(http400).json({
        success,
        message: "Slot already assigned",
      });

    await AssignRates.create(body);
    const placeData = await Places.findOne({ _id: placeId });
    const brandData = await Brands.findOne({
      userId: ObjectId(placeData.userId),
    });
    event.emit("notification", {
      userId: userId,
      title: "BlackOut Day Event Created!",
      message: `${
        brandData?.brandName ? brandData?.brandName : "Super Admin"
        } create Blackout Day event on place ${placeData?.google?.name}`,
      placeId: placeData?._id,
      brandName: brandData?.shortBrandName,
      brandLogo: brandData?.brandLogo,
    });

    return res.status(http200).json({
      success: true,
      message: "Assign rates successfully",
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message ?? "Something went wrong!",
    });
  }
};
