const router = require("express").Router();
const dailyStatistics = require("./handlers/dailyStatistics")
const getTotalBookings = require("./handlers/getTotalBooking")
const getTotalCustomer = require("./handlers/getTotalCustomer")
const getTotalRevenue = require("./handlers/getTotalRevenue")
const getTotalServiceFee = require("./handlers/getTotalServiceFee")
const getTotalTax = require("./handlers/getTotalTax")
const getWeeklyBookings = require("./handlers/getWeeklyBookingStats")
const getWeeklyRevenue = require("./handlers/getWeeklyRevenueStats")
const getMonthlyBookings = require("./handlers/getMonthlyBookingStats")
const getMonthlyRevenue = require("./handlers/getMonthlyRevenueStats")
const returningUser = require("./handlers/returningUsers")
const topSellingRates = require("./handlers/topSellingRates")
const populateStatisticsData = require("./handlers/populateStatisticsData")

router.post("/dailyStatistics", dailyStatistics);
router.post("/populateStatisticsData", populateStatisticsData);
router.get("/getTotalBooking", getTotalBookings);
router.get("/getTotalCustomer", getTotalCustomer);
router.get("/getTotalRevenue", getTotalRevenue);
router.get("/getTotalServiceFee", getTotalServiceFee);
router.get("/getTotalTax", getTotalTax);
router.get("/getWeeklyBookingstats", getWeeklyBookings)
router.get("/getWeeklyRevenuestats", getWeeklyRevenue)
router.get("/getMonthlyBookingstats", getMonthlyBookings)
router.get("/getMonthlyRevenuestats", getMonthlyRevenue)
router.get("/returningUser", returningUser)
router.get("/topSellingRates", topSellingRates)

module.exports = router;
