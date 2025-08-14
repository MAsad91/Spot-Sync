const { http200, http400 } = require("../../../../global/errors/httpCodes");
const Statistics = require("../../../../models/statistics");
const Place = require("../../../../models/places");
const Users = require("../../../../models/users");
const Jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const mongoose = require("mongoose");
const { getTimezoneName } = require("../../../../global/functions");

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

        // Get data for the last 12 months
        const data = [];
        const labels = [];
        
        // Generate data for each of the last 12 months
        for (let i = 11; i >= 0; i--) {
            const currentMonth = moment().subtract(i, 'months');
            labels.push(currentMonth.format('MMM')); // Month abbreviation
            
            let monthRevenue = 0;
            
            if (placeId === 'all' && isSuperAdmin) {
                // Get global statistics
                const globalStats = await Statistics.findOne({ isGlobal: true });
                if (globalStats && globalStats.data.length > 0) {
                    const monthData = globalStats.data.filter(dp => 
                        moment(dp.date).isSame(currentMonth, 'month')
                    );
                    monthRevenue = monthData.reduce((sum, dp) => sum + dp.revenue, 0);
                }
            } else {
                // Get statistics for specific places
                const statsDocs = await Statistics.find({ placeId: { $in: places } });
                
                for (const statsDoc of statsDocs) {
                    if (statsDoc.data.length > 0) {
                        const monthData = statsDoc.data.filter(dp => 
                            moment(dp.date).isSame(currentMonth, 'month')
                        );
                        monthRevenue += monthData.reduce((sum, dp) => sum + dp.revenue, 0);
                    }
                }
            }
            
            data.push(monthRevenue);
        }

        // Calculate percentage increase (current month vs previous month)
        let percentageIncrease = 0;
        
        if (placeId === 'all' && isSuperAdmin) {
            const globalStats = await Statistics.findOne({ isGlobal: true });
            if (globalStats && globalStats.data.length > 0) {
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
                    percentageIncrease = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(2);
                }
            }
        } else {
            const statsDocs = await Statistics.find({ placeId: { $in: places } });
            let currentMonthTotal = 0;
            let previousMonthTotal = 0;
            
            for (const statsDoc of statsDocs) {
                if (statsDoc.data.length > 0) {
                    const currentMonth = moment().startOf('month');
                    const previousMonth = moment().subtract(1, 'month').startOf('month');
                    
                    const currentMonthData = statsDoc.data.filter(dp => 
                        moment(dp.date).isSame(currentMonth, 'month')
                    );
                    const previousMonthData = statsDoc.data.filter(dp => 
                        moment(dp.date).isSame(previousMonth, 'month')
                    );
                    
                    currentMonthTotal += currentMonthData.reduce((sum, dp) => sum + dp.revenue, 0);
                    previousMonthTotal += previousMonthData.reduce((sum, dp) => sum + dp.revenue, 0);
                }
            }
            
            if (previousMonthTotal > 0) {
                percentageIncrease = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal * 100).toFixed(2);
            }
        }

        const timeZone = getTimezoneName();
        const lastUpdatedTime = moment().tz(timeZone).format('MMM Do YYYY, h:mm A') + ' (' + moment.tz(timeZone).format('z') + ')';

        const result = {
            labels,
            datasets: {
                label: "Revenue",
                data
            }
        };

        return res
            .status(http200)
            .json({ 
                success: true, 
                data: result, 
                percentage: percentageIncrease, 
                lastUpdatedTime, 
                message: "Statistics updated successfully" 
            });
    } catch (error) {
        return res.status(http400).json({
            success: false,
            message: error?.message ?? "Something went wrong!",
        });
    }
};
