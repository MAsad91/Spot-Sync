const Enforcements = require("../../../../models/enforcement");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const moment = require("moment");

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      userId,
      body: {
        placeId,
        search,
        startDate,
        endDate,
        status,
        pageNo,
        limit = 25,
        tz,
      },
    } = req;
    console.log("body ====>", req.body);
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({ success, message: "Invalid Token" });

    if (!placeId || !isValidObjectId(placeId))
      return res.status(http403).json({ success, message: "Invalid request" });

    let matchQuery = {
      placeId: ObjectId(placeId),
    };

    console.log("status ====>", status);

    if (status !== "all") {
      matchQuery.status = status;
    }

    if (search && search !== "") {
      const upperSearch = search.toUpperCase();
      console.log("upperSearch ===>", upperSearch);
      matchQuery.$or = [
        { referenceId: { $regex: upperSearch, $options: "i" } },
        { referenceNum: { $regex: upperSearch, $options: "i" } },
        {
          licensePlate: { $regex: upperSearch, $options: "i" },
        },
        // { "customerId.mobile": { $regex: search, $options: "i" } },
      ];
    }

    if (startDate && endDate) {
      const start = moment.tz(startDate, tz).startOf("day");
      const end = moment.tz(endDate, tz).endOf("day");
      matchQuery.date_created = {
        $gte: start,
        $lte: end,
      };
    }
    console.log("matchQuery ====>", matchQuery);
    const totalEnforcements = await Enforcements.countDocuments(matchQuery);
    const enforcements = await Enforcements.find(matchQuery)
      .populate("placeId")
      .sort({ _id: -1 })
      .skip((pageNo) * limit)
      .limit(limit);

    return res.status(http200).json({
      success: true,
      message: "Success",
      enforcements,
      total: totalEnforcements,
      currentPage: pageNo,
      totalPages: Math.ceil(totalEnforcements / limit),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(http400)
      .json({ success, message: error?.message || "Something went wrong!" });
  }
};
