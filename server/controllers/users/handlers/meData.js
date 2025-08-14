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

module.exports = {
  async getMeInfo(req, res) {
    let success = false;
    try {
      const { userId } = req;
      if (!userId || !isValidObjectId(userId))
        return res.status(http403).json({
          success,
          message: "Invalid Token",
        });
      const user = await Users.findOne({ _id: ObjectId(userId) }).populate(
        "roleId"
      );
      return res.status(http200).json({
        success: true,
        message: "Success",
        data: {
          _id: user?._id,
          fullName: `${user?.firstName.concat(" ", user?.lastName)}`,
          email: user?.email,
          mobile: user?.mobile,
          userId: user?._id,
          roleId: user?.roleId,
          roleTitle: user?.roleId?.title,
          roleLevel: user?.roleId?.level,
          roleModules: user?.roleId?.modules,
        },
      });
    } catch (error) {
      return res.status(http400).json({
        success,
        message: error?.message || "Something went wrong!",
      });
    }
  },
};
