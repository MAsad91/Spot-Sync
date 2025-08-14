const UpdateSlack = require("../../../../crons/subscription/customSubscription/updateSlack");
const { http200, http400 } = require("../../../../global/errors/httpCodes");

module.exports = async (req, res) => {
  try {
    const updateSlack = await UpdateSlack();

    return res.status(http200).json({
      success: true,
      message: "successfully!",
      updateSlack,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
