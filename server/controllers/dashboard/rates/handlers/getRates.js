const Rates = require("../../../../models/rates");
const Users = require("../../../../models/users");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { DOC_STATUS } = require("../../../../constants");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });

    const userRole = await Users.findOne({ _id: ObjectId(userId) }).populate(
      "roleId"
    );
    const roleType = userRole?.roleId.level;
    const locations = userRole?.locations

    let findQuery = {
      status: { $ne: DOC_STATUS.DELETE },
    };
    if (roleType === 90) {
      findQuery.userId = ObjectId(userId);
    } else if (roleType < 90) {
      findQuery.placeId = { $in : locations.map(location => ObjectId(location))};
    }

    const rates = await Rates.find(findQuery).sort({ createdAt: -1 }).lean();
    return res.status(http200).json({
      success: true,
      message: "Success",
      rates,
      total: rates?.length || 0,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
