const Customer = require("../../../../models/customers");
const {
  http400,
  http200,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const AUTH = require("../../../../services/auth");

module.exports = async (req, res) => {
  try {
    const { customerId } = req.body;
    if (!customerId)
      return res.status(http400).json({ message: "customerId is required!" });
    const user = await Customer.findOne({ _id: ObjectId(customerId) });
    if (!user) {
      return res.status(http400).json({ message: "Customer not found!" });
    }
    const jwt = await AUTH.createJWT({
      userId: user._id,
      roleId: user.roleId,
    });
    return res.json({
      success: true,
      token: jwt.token,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: err?.message || "Something went wrong!",
    });
  }
};
