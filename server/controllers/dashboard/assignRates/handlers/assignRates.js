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
const Rates = require("../../../../models/rates");
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

    if (!body?.startTime)
      return res.status(http400).json({
        success,
        message: "startTime required",
      });
    if (!body?.endTime)
      return res.status(http400).json({
        success,
        message: "endTime required",
      });
    if (!body?.days || body?.days?.length <= 0)
      return res.status(http400).json({
        success,
        message: "days required",
      });
    if (!body?.occupancy)
      return res.status(http400).json({
        success,
        message: "Occupancy required",
      });

    const {
      rateIds,
      startTime,
      endTime,
      days,
      placeId,
      isExtensionRate,
      isExtensionBasedRate,
      extendedFor,
      isHideFromSuggestions,
      occupancy
    } = body;
    console.log("Body ===>", body);

    const objectsToSave = [];
    const lowerCaseDays = [];
    if (days)
      for (const day of days)
        lowerCaseDays.push(lowerCaseWithOptionalReplacer(day)());

    const data = await Promise.all(
      rateIds.map(async (rateId) => {
        return await Rates.findOne({ _id: ObjectId(rateId) }).lean();
      })
    );
    const rateTypes = data.map((rate) => rate.rateType);
    const displayName = data.map((rate) => rate.displayName);
    const payNowValidationLaterFlow = data.map(
      (rate) => rate.payNowValidationLaterFlow
    );
    const rateType = rateTypes.find(
      (type) => type === "daily" || type === "hourly"
    );
    const oppositeRateType = rateType === "daily" ? "hourly" : "daily";

    let query = [
      {
        $match: {
          rateId:{$in:rateIds.map(rateId => ObjectId(rateId))},
          status: DOC_STATUS["ACTIVE"],
          placeId: ObjectId(placeId),
          day: { $in: lowerCaseDays },
          $or: CHECK_SLOT_BOOK({ startTime, endTime })["$or"],
          isExtensionRate,
          isHideFromSuggestions,
          occupancy: { $ne: 0 },

          ...(isExtensionBasedRate && {
            isExtensionBasedRate: true,
            extendedFor: ObjectId(extendedFor),
          }),

        },
      },
      {
        $lookup: {
          from: "rates",
          localField: "rateId",
          foreignField: "_id",
          as: "rateDetails",
          pipeline: [{ $project: { displayName: 1 } }],
        },
      },
      {
        $unwind: "$rateDetails",
      },
    ];

    // Additional conditions for custom rate types
    if (!rateTypes.includes("custom")) {
      query = [
        {
          $match: {
            rateId:{$in:rateIds.map(rateId => ObjectId(rateId))},
            status: DOC_STATUS["ACTIVE"],
            placeId: ObjectId(placeId),
            day: { $in: lowerCaseDays },
            $or: CHECK_SLOT_BOOK({ startTime, endTime })["$or"],
            isExtensionRate,
            isHideFromSuggestions,
            occupancy: { $ne: 0 },
            ...(isExtensionBasedRate && {
              isExtensionBasedRate: true,
              extendedFor: ObjectId(extendedFor),
            }),
          },
        },
        {
          $lookup: {
            from: "rates",
            localField: "rateId",
            foreignField: "_id",
            as: "rate",
          },
        },
        {
          $match: {
            "rate.rateType": { $in: rateTypes },
          },
        },
      ];
    }

    // Specific logic for hourly or daily rate types
    if (rateType === "hourly" || rateType === "daily") {
      query = [
        {
          $match: {
            rateId:{$in:rateIds.map(rateId => ObjectId(rateId))},
            status: DOC_STATUS["ACTIVE"],
            placeId: ObjectId(placeId),
            day: { $in: lowerCaseDays },
            $or: CHECK_SLOT_BOOK({ startTime, endTime })["$or"],
            isExtensionRate,
            isHideFromSuggestions,
            occupancy: { $ne: 0 },
            ...(isExtensionBasedRate && {
              isExtensionBasedRate: true,
              extendedFor: ObjectId(extendedFor),
            }),
          },
        },
        {
          $lookup: {
            from: "rates",
            localField: "rateId",
            foreignField: "_id",
            as: "rate",
          },
        },
        {
          $match: {
            $or: [
              { "rate.rateType": oppositeRateType },
              { "rate.displayName": { $in: displayName } },
              { "rate.payNowValidationLaterFlow": payNowValidationLaterFlow },
            ],
          },
        },
      ];
      if (rateType === "hourly") {
        query[2].$match.$or.push({ "rate.rateType": rateType });
      }
    }

    if (!rateTypes.includes("custom")) {
      query = [
        {
          $match: {
            rateId:{$in:rateIds.map(rateId => ObjectId(rateId))},
            status: DOC_STATUS["ACTIVE"],
            placeId: ObjectId(placeId),
            day: { $in: lowerCaseDays },
            $or: CHECK_SLOT_BOOK({ startTime, endTime })["$or"],
            isExtensionRate,
            isHideFromSuggestions,
            occupancy: { $ne: 0 },
            ...(isExtensionBasedRate && {
              isExtensionBasedRate: true,
              extendedFor: ObjectId(extendedFor),
            }),
          },
        },
        {
          $lookup: {
            from: "rates",
            localField: "rateId",
            foreignField: "_id",
            as: "rate",
          },
        },
        {
          $match: {
            "rate.rateType": { $in: rateTypes },
          },
        },
      ];
    }
    if (rateType === "hourly" || rateType === "daily") {
      query = [
        {
          $match: {
           // rateId:{$in:rateIds.map(rateId => ObjectId(rateId))},
            status: DOC_STATUS["ACTIVE"],
            placeId: ObjectId(placeId),
            day: { $in: lowerCaseDays },
            $or: CHECK_SLOT_BOOK({ startTime, endTime })["$or"],
            isExtensionRate,
            isHideFromSuggestions,
            occupancy: { $ne: 0 },
            ...(isExtensionBasedRate && {
              isExtensionBasedRate: true,
              extendedFor: ObjectId(extendedFor),
            }),
          },
        },
        {
          $lookup: {
            from: "rates",
            localField: "rateId",
            foreignField: "_id",
            as: "rate",
          },
        },
        {
          $match: {
            $or: [
              { "rate.rateType": oppositeRateType },
              { "rate.displayName": { $in: displayName } },
              { "rate.payNowValidationLaterFlow": payNowValidationLaterFlow },
            ],
          },
        },
      ];
      if (rateType === "hourly") {
        query[2].$match.$or.push({ "rate.rateType": rateType });
      }
    }
    console.log(query)
    const isRateConflicts = await AssignRates.aggregate(query);
console.log("isRateConflicts ===>",isRateConflicts)
    const conflictedRateDisplayName =
      isRateConflicts?.[0]?.rateDetails?.displayName;

    if (isRateConflicts.length > 0)
      return res.status(http400).json({
        success,
        message: !!conflictedRateDisplayName
          ? `This slot is already assigned to ${conflictedRateDisplayName}`
          : "Slot already assigned",
      });

    lowerCaseDays?.forEach((dayItem) => {
      rateIds?.forEach((rateIdItem) => {
        const newObject = new AssignRates({
          userId,
          placeId,
          rateId: rateIdItem,
          startTime,
          endTime,
          day: dayItem,
          isExtensionRate,
          isHideFromSuggestions,
          occupancy,
          isExtensionBasedRate,
          extendedFor,
        });
        console.log("newObject ====>", newObject);
        objectsToSave.push(newObject);
      });
    });
    console.log("objectsToSave ====>", objectsToSave);
    await AssignRates.insertMany(objectsToSave);
    const placeData = await Places.findOne({ _id: placeId });
    const brandData = await Brands.findOne({
      userId: ObjectId(placeData.userId),
    });
    event.emit("notification", {
      userId: userId,
      title: "Assign Rates Created!",
      message: `${brandData?.brandName ? brandData?.brandName : "Super Admin"
        } create Assign Rates on place ${placeData?.google?.name}`,
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
