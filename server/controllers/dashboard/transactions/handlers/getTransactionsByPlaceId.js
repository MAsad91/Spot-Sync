const Payments = require("../../../../models/payments");
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

    if (status !== "all") {
      matchQuery.paymentStatus = status;
    }
    let pipeline
    if (search && search !== "") {
      const upperSearch = search.toUpperCase();
      console.log("upperSearch ===>", upperSearch);
      pipeline = [
        {
          $match: matchQuery,
        },
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customerId",
          },
        },
        {
          $unwind: "$customerId",
        },
        {
          $match: {
            $or: [
              { transientNumber: { $regex: upperSearch, $options: "i" } },
              { subscriptionNumber: { $regex: upperSearch, $options: "i" } },
              {
                licensePlate: {
                  $elemMatch: {
                    licensePlateNumber: { $regex: upperSearch, $options: "i" },
                  },
                },
              },
              { "paymentInfo.id": { $regex: search, $options: "i" } },
              {
                "customerId.mobile": { $regex: search, $options: "i" },
              },
              {
                "customerId.secondaryMobile": { $regex: search, $options: "i" },
              }, 
            ],
          },
        },
        {
          $sort: { _id: -1 },
        },
        {
          $skip: (pageNo * limit),
        },
        {
          $limit: limit,
        },
      ];
    }

    if (startDate && endDate) {
      const start = moment.tz(startDate, tz).startOf("day");
      const end = moment.tz(endDate, tz).endOf("day");
      matchQuery.transactionDate = {
        $gte: start,
        $lte: end,
      };
    }
    console.log("matchQuery ====>", matchQuery);
    let totalTransactions;
    let transactions;
    if (search && search !== "") {
      transactions = await Payments.aggregate(pipeline)
      totalTransactions = transactions.length
    } else {
      totalTransactions = await Payments.countDocuments(matchQuery);
      transactions = await Payments.find(matchQuery)
        .populate("customerId placeId")
        .sort({ _id: -1 })
        .skip((pageNo) * limit)
        .limit(limit);
    }

    return res.status(http200).json({
      success: true,
      message: "Success",
      transactions,
      total: totalTransactions,
      currentPage: pageNo,
      totalPages: Math.ceil(totalTransactions / limit),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(http400)
      .json({ success, message: error?.message || "Something went wrong!" });
  }
};
