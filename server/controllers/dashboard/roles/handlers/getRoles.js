const Users = require("../../../../models/users");
const Roles = require("../../../../models/roles");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const { isValidObjectId } = require("mongoose");
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

    const user = await Users.findOne({ _id: userId }).populate("roleId");
    const userRole = user?.roleId?.level || false;

    let query = {};
    if (userRole === 100) {
      query.status = { $ne: DOC_STATUS.DELETE };
    } else {
      query.userId = userId;
      query.status = { $ne: DOC_STATUS.DELETE };
      query.default = false;
    }
    const roles = await Roles.find(query).lean();

    return res.status(http200).json({
      success: true,
      message: "Success",
      roles,
      total: roles.length || 0,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
