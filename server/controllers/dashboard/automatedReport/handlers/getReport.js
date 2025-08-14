const {
  isValidObjectId,
  Types: { ObjectId },
} = require("mongoose");
const { http400, http200 } = require("../../../../global/errors/httpCodes");
const AutomatedReports = require("../../../../models/automatedReports");
const { DOC_STATUS } = require("../../../../constants");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { userId } = req;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(http400).json({
        success,
        message: "invalid token",
      });
    }

    const report = await AutomatedReports.find({
      userId: ObjectId(userId),
      status: { $ne: DOC_STATUS.DELETE },
    })
      .populate("placeIds") // Populate the placeIds field
      .lean();

    return res.status(http200).json({
      success: true,
      message: "success",
      report,
      total: report?.length || 0,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "something went wrong",
    });
  }
};
