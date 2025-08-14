const Users = require("../../../models/users");
const Roles = require("../../../models/roles");
const AUTH = require("../../../services/auth");
const {
  http400,
  http200,
  http403,
} = require("../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { DOC_STATUS } = require("../../../constants");

module.exports = {
  async getUsers(req, res) {
    let success = false;
    try {
      const { userId } = req;
      if (!userId || !isValidObjectId(userId))
        return res.status(http403).json({
          success,
          message: "Invalid Token",
        });

      const users = await Users.find(
        { status: { $ne: DOC_STATUS.DELETE }, creatorId: ObjectId(userId) },
        { password: 0 }
      )
        .populate({
          path: "locations",
          match: { status: 10 }, // Only Active locations
          options: {
            projection: { parkingCode: 1 }, // Replace key1, key2, key3 with the keys you want to project
          },
        })
        .populate({
          path: "roleId",
          match: { level: { $nin: [100] } }, // Exclude roles with level 100 and 80
        })
        .exec();
      const filteredUsers = users.filter((u) => u.roleId !== null);

      return res.status(http200).json({
        success: true,
        message: "Success",
        users: filteredUsers,
      });
    } catch (error) {
      return res.status(http400).json({
        success,
        message: error?.message || "Something went wrong!",
      });
    }
  },
};
