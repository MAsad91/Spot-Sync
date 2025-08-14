const QRCodes = require("../../../../models/qrCodes");
const Users = require("../../../../models/users")
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    const userRole = await Users.findOne({ _id: ObjectId(userId) }).populate("roleId");
    const myUsers = await Users.find({ creatorId: ObjectId(userId) }).select("_id")
    const myUserIds = myUsers.map(user => ObjectId(user._id));
    myUserIds.push(userId)
    const roleType = userRole?.roleId.level;
    let query
    if (roleType === 100) {
      query = {
        status: { $ne: 0 },
      }
    } else if (roleType === 90) {
      query = {
        status: { $ne: 0 },
        creatorId: { $in: myUserIds }
      }
    } else {
      query = {
        status: { $ne: 0 },
        creatorId: userId
      }
    }
    const qrCodes = await QRCodes.find(query).lean();
    return res.status(http200).json({
      success: true,
      message: "Success",
      qrCodes,
      total: qrCodes?.length || 0,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
