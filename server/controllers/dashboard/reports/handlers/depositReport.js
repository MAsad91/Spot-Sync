const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { generateDepositReport } = require("../../../../services/stripe");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId, body } = req;
    if (!userId || !isValidObjectId(userId)) {
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    }

    const { startDate, endDate } = body;

    const result = await generateDepositReport(startDate, endDate);

    return res.status(http200).json(result);
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
