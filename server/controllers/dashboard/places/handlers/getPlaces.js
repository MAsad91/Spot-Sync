const Places = require("../../../../models/places");
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
  try {
    const { userId } = req;
    if (!userId || !isValidObjectId(userId)) {
      return res.status(http403).json({
        success: false,
        message: "Invalid Token",
      });
    }

    const user = await Users.findById(userId)
      .populate("roleId", "level locations")
      .lean();
    if (!user || !user.roleId) {
      return res.status(http403).json({
        success: false,
        message: "User not found or invalid role",
      });
    }
    
    const { level: roleLevel } = user.roleId;
    const { locations = [] } = user
    const activeStatusCondition = { status: { $ne: DOC_STATUS.DELETE } };
    let query;

    if (roleLevel === 100) {
      query = { ...activeStatusCondition };
    } else if (roleLevel === 90) {
      query = {
        userId: ObjectId(userId),
        default: true,
        ...activeStatusCondition,
      };
    } else {
      query = {
        _id: { $in: locations },
        default: true,
        ...activeStatusCondition,
      };
    }
    const places = await Places.find(query).populate("brandId").lean();

    return res.status(http200).json({
      success: true,
      message: "Success",
      places,
      total: places.length || 0,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
