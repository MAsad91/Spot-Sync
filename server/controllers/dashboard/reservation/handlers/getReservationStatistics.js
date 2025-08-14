const {
  http200,
  http400,
  http403,
  http500,
} = require("../../../../global/errors/httpCodes");
const moment = require("moment");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const Reservations = require("../../../../models/reservations");

module.exports = async (req, res) => {
  try {
    const { userId } = req;
    const { placeId } = req.params;
    let success = false;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    if (!placeId || !isValidObjectId(placeId))
      return res.status(http403).json({
        success,
        message: "Invalid request",
      });

    const reservation = await Reservations.find({
      placeId: ObjectId(placeId),
      status: "success",
      purpose:"PARKING"
    }).lean();
    
    let totalRevenue = 0;
    let totalTax = 0;
    let totalServiceFee = 0;
    let totalNetRevenue = 0;
    let totalOwnerPayout = 0;

    reservation.forEach((reservation) => {
      const { totalAmount, isbpRevenue, serviceFee, tax, ownerPayout } = reservation;
      totalNetRevenue += isbpRevenue;
      totalTax += tax;
      totalServiceFee += serviceFee;
      totalRevenue += totalAmount;
      totalOwnerPayout += ownerPayout;
    });

    const statistics = {
      totalNetRevenue,
      totalTax,
      totalServiceFee,
      totalRevenue,
      totalOwnerPayout
    };

    return res.status(http200).json({
      success: true,
      message: "success",
      statistics,
    });
  } catch (error) {
    console.error("Error fetching reservation statistics:", error);
    return res.status(http500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
