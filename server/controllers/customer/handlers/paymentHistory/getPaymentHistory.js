const Payment = require("../../../../models/payments");
const {
  http200,
  http403,
  http500,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

module.exports = async (req, res) => {
  try {
    const { userId } = req;
    const { customerId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
      return res.status(http403).json({
        success: false,
        message: "Invalid Token",
      });
    }

    if (!customerId || !isValidObjectId(customerId)) {
      return res.status(http403).json({
        success: false,
        message: "Invalid Customer",
      });
    }

    const payments = await Payment.find({
      customerId: ObjectId(customerId),
      paymentStatus: { $ne: "initialize" },
    })
      .populate("subscriptionId customerId placeId")
      .sort({ createdAt: -1, updatedAt: -1 })
      .lean();
    return res.status(http200).json({
      success: true,
      message: "Success",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching subscription statistics:", error);
    return res.status(http500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
