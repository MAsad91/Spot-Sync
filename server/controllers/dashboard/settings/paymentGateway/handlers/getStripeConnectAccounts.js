const ConnectAccounts = require("../../../../../models/connectAccounts");
const {
  http200,
  http400,
  http403,
} = require("../../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { connectAccountsList } = require("../../../../../services/stripe");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });

    const connectAccounts = await connectAccountsList();
    if (connectAccounts.success) {
      return res.status(http200).json({
        success: true,
        message: "Success",
        connectAccounts: connectAccounts.accounts,
        total: connectAccounts.total,
      });
    }
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
