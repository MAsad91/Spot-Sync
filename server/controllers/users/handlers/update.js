const Users = require("../../../models/users");
const Roles = require("../../../models/roles");
const {
  http200,
  http400,
  http403,
} = require("../../../global/errors/httpCodes");

const { ObjectId } = require("mongoose").Types;
const isValidObjectId = require("mongoose").isValidObjectId;

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });

    const payload = req.body;
    const { _id } = ObjectId(payload.userId);

    let update = new Object();
    update = payload;

    const updateUser = await Users.findByIdAndUpdate(_id, update);

    if (updateUser) {
      return res.status(http200).json({
        success: true,
        message: "Updated successfully",
      });
    }
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};