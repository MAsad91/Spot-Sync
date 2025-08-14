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
const {
  lowerCaseWithOptionalReplacer,
} = require("../../../../global/functions");
const { CHECK_SLOT_BOOK } = require("../../../../global/queries");
const { DOC_STATUS } = require("../../../../constants");
const event = require("../../../../services/emitter");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId, body } = req;
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
    if (!body?.rateIds || body?.rateIds?.length <= 0)
      return res.status(http400).json({
        success,
        message: "rateIds required",
      });

    if (!body?.startDate)
      return res.status(http400).json({
        success,
        message: "startDate required",
      });
    if (!body?.endDate)
      return res.status(http400).json({
        success,
        message: "endDate required",
      });
    if (!body?.occupancy)
      return res.status(http400).json({
        success,
        message: "Occupancy required",
      });

    const {
      rateIds,
      startDate,
      endDate,
      placeId,
      isSpecialEvent,
      isExtensionRate,
      isHideFromSuggestions,
      occupancy
    } = body;
    const objectsToSave = [];

    console.log("body ====>", body);

    const query = {
      status: 10,
      placeId: ObjectId(placeId),
      rateId: { $in: rateIds.map((rateId) => ObjectId(rateId)) },
      isSpecialEvent: true,
      isExtensionRate,
      isHideFromSuggestions,
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ],
      occupancy: { $ne: 0 },
    };

    console.log("query ===>", query);

    const isRateConflicts = await AssignRates.findOne(query).lean().populate({
      path: "rateId",
      select: "displayName",
    });

    const conflictedRateDisplayName = isRateConflicts?.rateId?.displayName;

    if (isRateConflicts)
      return res.status(http400).json({
        success,
        message: !!conflictedRateDisplayName ? `This slot is already assigned to ${conflictedRateDisplayName}` : "Slot already assigned",

      });

    rateIds?.forEach((rateIdItem) => {
      const newObject = new AssignRates({
        placeId,
        rateId: rateIdItem,
        startDate,
        endDate,
        isSpecialEvent,
        isExtensionRate,
        isHideFromSuggestions,
        occupancy
      });
      objectsToSave.push(newObject);
    });

    await AssignRates.insertMany(objectsToSave);
    const placeData = await Places.findOne({ _id: placeId });
    const brandData = await Brands.findOne({
      userId: ObjectId(placeData.userId),
    });
    event.emit("notification", {
      userId: userId,
      title: "Special Event Created!",
      message: `${brandData?.brandName ? brandData?.brandName : "Super Admin"
        } create special event on place ${placeData?.google?.name}`,
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
