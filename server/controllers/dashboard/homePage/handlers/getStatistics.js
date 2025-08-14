const Subscription = require("../../../../models/subscriptions");
const Customer = require("../../../../models/customers");
const User = require("../../../../models/users");
const Brand = require("../../../../models/brands");
const Reservation = require("../../../../models/reservations");
const {
  http200,
  http403,
  http500,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { DOC_STATUS } = require("../../../../constants");
const { get } = require("lodash");

module.exports = async (req, res) => {
  try {
    const { userId } = req;
    let success = false;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });

    const userData = await User.findOne(
      { _id: ObjectId(userId) },
      { roleId: 1 }
    ).populate("roleId");

    const userRole = get(userData, "roleId.level", false);

    let query = {};
    if (userRole && userRole === 90) {
      const userBrand = await Brand.findOne(
        { userId: ObjectId(userId) },
        { _id: 1 }
      );
      const brandId = get(userBrand, "_id", false);
      if (brandId) {
        query.brandId = brandId;
      }
    }

    const bookingQuery = {
      subscriptionStatus: "active",
      ...query,
    };
    const customerQuery = {
      status: DOC_STATUS.ACTIVE,
      ...query,
    };
    const revenueQuery = {
      status: "success",
      ...query,
    };

    const [bookings, customers] = await Promise.all([
      Subscription.countDocuments(bookingQuery),
      Customer.countDocuments(customerQuery),
    ]);

    let revenue = 0;
    let totalFee = 0;
    const reservations = await Reservation.find(revenueQuery);
    reservations.forEach((reservation) => {
      const { totalAmount, serviceFee } = reservation;
      revenue += totalAmount || 0;
      totalFee += serviceFee || 0;
    });

    const statistics = {
      totalBookings: bookings || 0,
      totalCustomers: customers || 0,
      totalRevenue: revenue || 0,
      totalServiceFee: totalFee || 0,
    };

    return res.status(http200).json({
      success: true,
      message: "Success",
      statistics,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return res.status(http500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
