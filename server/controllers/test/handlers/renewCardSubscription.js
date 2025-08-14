const { http200, http400 ,http403} = require("../../../global/errors/httpCodes");
const AutoRenewChargeCard = require("../../../crons/subscription/autoRenewSubscriptionCard");
const { isValidObjectId } = require("mongoose");

module.exports = async (req, res) => {
  try {
    const { placeId } = req.body;
    if (!placeId || !isValidObjectId(placeId)) {
      return res
        .status(http403)
        .json({ success: false, message: "Invalid Place Id" });
    }
    const renewCardSubscription = await AutoRenewChargeCard({ placeId });

    return res.status(http200).json({
      success: true,
      message: "successfully!",
      renewCardSubscription,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
