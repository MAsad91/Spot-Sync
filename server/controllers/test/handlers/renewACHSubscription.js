const { http200, http400 } = require("../../../global/errors/httpCodes");
const AutoRenewChargeACH = require("../../../crons/subscription/autoRenewSubscriptionACH");

module.exports = async (req, res) => {
  try {
    const renewACHSubscription = await AutoRenewChargeACH();

    return res.status(http200).json({
      success: true,
      message: "successfully!",
      renewACHSubscription,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
