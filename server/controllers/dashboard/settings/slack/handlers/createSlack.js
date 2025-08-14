const Slacks = require("../../../../../models/slacks");
const {
  http200,
  http400,
  http401,
} = require("../../../../../global/errors/httpCodes");
const { isValidObjectId } = require("mongoose");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { body, userId } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http401).json({
        success,
        message: "Invalid Token",
      });
    const payload = body;
    const slack = await Slacks.create(payload);
    if (!slack)
      return res.status(http400).json({
        success,
        message: "Something went wrong!",
      });
    return res.status(http200).json({
      success: true,
      message: "Slack created successfully!",
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
