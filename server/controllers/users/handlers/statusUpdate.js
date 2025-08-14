const Users = require("../../../models/users");
const {
  http200,
  http400,
  http403,
} = require("../../../global/errors/httpCodes");
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
    let update = {};
    const payload = req.body;
    const filter = { _id: ObjectId(payload.userId) };
    update["$set"] = { status: payload.status };
    const updateUser = await Users.updateOne(filter, update);
    console.log("updateUser ===>", updateUser);
    return res.status(http200).json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
