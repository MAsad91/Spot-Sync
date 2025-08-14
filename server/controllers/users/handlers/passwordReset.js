const {
    Types: { ObjectId },
    isValidObjectId,
  } = require("mongoose");
const Users = require("../../../models/users");
const AUTH = require("../../../services/auth");
const {
  http400,
  http200,
  http403,
} = require("../../../global/errors/httpCodes");

module.exports = {
  async passwordReset(req, res) {
    try {
      const { userId } = req;
      if (!userId || !isValidObjectId(userId))
        return res.status(http403).json({
          success,
          message: "Invalid Token",
        });
      let payload = req.body;
      payload.password = await AUTH.encryptPassword(payload.password);
      const user = await Users.updateOne(
        { _id: ObjectId(userId) },
        { $set: { password: payload.password } }
      );
      if (!user)
        return res.status(http400).json({ message: "Something went wrong!" });
      return res.status(http200).json({
        success: true,
        message: "Successfully updated!",
      });
    } catch (err) {
      throw err;
    }
  },
};
