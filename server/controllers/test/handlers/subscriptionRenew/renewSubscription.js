const RenewAllCustomSubscriptions = require("../../../../crons/subscription/customSubscription/renewSubscription");
const { http200, http400 } = require("../../../../global/errors/httpCodes");

module.exports = async (req, res) => {
  try {
    const renewSubscription = await RenewAllCustomSubscriptions();

    return res.status(http200).json({
      success: true,
      message: "successfully!",
      renewSubscription,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
