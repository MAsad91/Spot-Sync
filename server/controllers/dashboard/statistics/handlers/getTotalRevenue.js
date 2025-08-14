
const { http200, http400 } = require("../../../../global/errors/httpCodes");
const Statistics = require("../../../../models/statistics");
const Place = require("../../../../models/places");
const Users = require("../../../../models/users");
const mongoose = require("mongoose");
const Jwt = require("jsonwebtoken");
const moment = require("moment");

module.exports = async (req, res) => {
    try {
        const token = req.headers.token;
        let { placeId } = req.query
        const decode = Jwt.decode(token);
        const userId = mongoose.Types.ObjectId(decode.userId);

        const userRole = await Users.findOne({ _id: userId }).populate("roleId");
        const roleType = userRole?.roleId.level;
        const isSuperAdmin = roleType === 100 ? true : false
        const isBrandAdmin = roleType === 90 ? true : false
        let places = []
        
        if (placeId === 'all') {
            if (!isSuperAdmin && isBrandAdmin) {
                places = await Place.find({ userId }).select('_id');
                places = places.map(place => place._id)
            } else if (!isSuperAdmin && !isBrandAdmin) {
                places = await Users.find({ _id: userId }).select('locations');
                places = places.map(place => place.locations).flat()
            }
        } else {
            places = placeId
        }

        let totalRevenue = 0;
        let totalPercentageIncrease = 0;
        let statsCount = 0;

        if (placeId === 'all' && isSuperAdmin) {
            // Get global statistics
            const globalStats = await Statistics.findOne({ isGlobal: true });
            if (globalStats && globalStats.data.length > 0) {
                // Calculate total revenue from all data points
                totalRevenue = globalStats.data.reduce((sum, dataPoint) => sum + dataPoint.revenue, 0);
                
                // Calculate percentage increase (compare current month vs previous month)
                const currentMonth = moment().startOf('month');
                const previousMonth = moment().subtract(1, 'month').startOf('month');
                
                const currentMonthData = globalStats.data.filter(dp => 
                    moment(dp.date).isSame(currentMonth, 'month')
                );
                const previousMonthData = globalStats.data.filter(dp => 
                    moment(dp.date).isSame(previousMonth, 'month')
                );
                
                const currentMonthRevenue = currentMonthData.reduce((sum, dp) => sum + dp.revenue, 0);
                const previousMonthRevenue = previousMonthData.reduce((sum, dp) => sum + dp.revenue, 0);
                
                if (previousMonthRevenue > 0) {
                    totalPercentageIncrease = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(2);
                }
                statsCount = 1;
            }
        } else {
            // Get statistics for specific places
            const statsDocs = await Statistics.find({ placeId: { $in: places } });
            
            for (const statsDoc of statsDocs) {
                if (statsDoc.data.length > 0) {
                    // Calculate total revenue from all data points
                    const placeRevenue = statsDoc.data.reduce((sum, dataPoint) => sum + dataPoint.revenue, 0);
                    totalRevenue += placeRevenue;
                    
                    // Calculate percentage increase for this place
                    const currentMonth = moment().startOf('month');
                    const previousMonth = moment().subtract(1, 'month').startOf('month');
                    
                    const currentMonthData = statsDoc.data.filter(dp => 
                        moment(dp.date).isSame(currentMonth, 'month')
                    );
                    const previousMonthData = statsDoc.data.filter(dp => 
                        moment(dp.date).isSame(previousMonth, 'month')
                    );
                    
                    const currentMonthRevenue = currentMonthData.reduce((sum, dp) => sum + dp.revenue, 0);
                    const previousMonthRevenue = previousMonthData.reduce((sum, dp) => sum + dp.revenue, 0);
                    
                    if (previousMonthRevenue > 0) {
                        const placePercentageIncrease = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100);
                        totalPercentageIncrease += placePercentageIncrease;
                    }
                    statsCount++;
                }
            }
        }

        // Calculate average percentage increase
        const averagePercentage = statsCount > 0 ? (totalPercentageIncrease / statsCount).toFixed(2) : 0;

        return res.status(http200).json({
            success: true,
            data: {
                revenue: totalRevenue,
                percentageIncrease: averagePercentage,
            },
            message: "Statistics Retrieved successfully",
        });
    } catch (error) {
        return res.status(http400).json({
            success: false,
            message: error?.message ?? "Something went wrong!",
        });
    }
};
