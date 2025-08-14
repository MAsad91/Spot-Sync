const Reservation = require("../../../../../models/reservations");
const Statistics = require("../../../../../models/statistics")
const calculatePercentageIncrease = (oldCount, newCount) => {
  if (oldCount === 0) {
    return newCount === 0 ? 0 : 100;
  }
  return (((newCount - oldCount) / oldCount) * 100).toFixed(2);
};

const calculateCustomDateStats = async (startDate, endDate, placeIds, isSuperAdmin) => {
  const query = { startDate: { $gte: startDate, $lte: endDate } };
  if (!isSuperAdmin || placeIds.length > 0) {
    query.placeId = { $in: placeIds };
  }
  let customDateStats
  customDateStats = await Reservation.find(query);
  const customDateStatsCount = customDateStats.reduce((acc, stat) => {
    acc.bookings += 1 || 0;
    acc.revenue += stat.totalAmount || 0;
    acc.tax += stat.tax || 0;
    acc.serviceFee += stat.serviceFee || 0;

    return acc;
  }, { bookings: 0, revenue: 0, tax: 0, serviceFee: 0 });

  return customDateStatsCount;
};

module.exports = {
  calculatePercentageIncrease,
  calculateCustomDateStats
};