const Permits = require("../../../../models/permits");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const moment = require("moment")

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      userId,
      body: {
        placeId,
        startDate,
        endDate,
        status,
        search,
        pageNo,
        limit = 25,
        tz,
      },
    } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    if (!placeId || !isValidObjectId(placeId))
      return res.status(http403).json({
        success,
        message: "Invalid request",
      });

    let query = {
      status: { $ne: "deleted" },
      placeId: ObjectId(placeId),
    }

    if (status !== "all" && status !== "expired") {
      query.status = status
      if (status !== "requested") {
        query.endDate = { $gte: moment().startOf('day') }
      }
    } else if (status === "expired") {
      query.endDate = { $lte: moment().add(-1, 'day').startOf('day') }
    }

    if (search && search !== "") {
      const upperSearch = search.toUpperCase();
      query.$or = [
        { permitNumber: { $regex: search, $options: "i" } },
        { internalId: { $regex: search, $options: "i" } },
        { assignedName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNo: { $regex: search.replace(/\$/g, '\\$'), $options: "i" } },
        {
          licensePlate: {
            $elemMatch: { $regex: upperSearch, $options: "i" },
          },
        },
      ]
    }
    
    if (startDate && endDate) {
      const start = moment.tz(startDate, tz).startOf("day").utc();
      const end = moment.tz(endDate, tz).endOf("day").utc();
      query.$and = [
        { startDate: { $gte: start } },
        { startDate: { $lte: end } },
      ];
    }

    const permits = await Permits.find(query)
      .sort({ _id: -1 })
      .skip(pageNo * limit)
      .limit(limit)
      .populate("rateId")

    const totalPermits = await Permits.countDocuments(query)

    return res.status(http200).json({
      success: true,
      message: "Success",
      Permits: permits,
      totalPermits: totalPermits || 0,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
