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

        // Get data for the last 7 days
        const endDate = moment().endOf('day');
        const startDate = moment().subtract(6, 'days').startOf('day');
        
        const data = [];
        const labels = [];
        
        // Generate data for each of the last 7 days
        for (let i = 0; i < 7; i++) {
            const currentDate = moment().subtract(6 - i, 'days');
            labels.push(currentDate.format('ddd')[0]); // First letter of day name
            
            let dayRevenue = 0;
            
            if (placeId === 'all' && isSuperAdmin) {
                // Get global statistics
                const globalStats = await Statistics.findOne({ isGlobal: true });
                if (globalStats && globalStats.data.length > 0) {
                    const dayData = globalStats.data.find(dp => 
                        moment(dp.date).isSame(currentDate, 'day')
                    );
                    dayRevenue = dayData ? dayData.revenue : 0;
                }
            } else {
                // Get statistics for specific places
                const statsDocs = await Statistics.find({ placeId: { $in: places } });
                
                for (const statsDoc of statsDocs) {
                    if (statsDoc.data.length > 0) {
                        const dayData = statsDoc.data.find(dp => 
                            moment(dp.date).isSame(currentDate, 'day')
                        );
                        if (dayData) {
                            dayRevenue += dayData.revenue;
                        }
                    }
                }
            }
            
            data.push(dayRevenue);
        }

        // Calculate percentage increase (current week vs previous week)
        let percentageIncrease = 0;
        
        if (placeId === 'all' && isSuperAdmin) {
            const globalStats = await Statistics.findOne({ isGlobal: true });
            if (globalStats && globalStats.data.length > 0) {
                const currentWeekData = globalStats.data.filter(dp => 
                    moment(dp.date).isBetween(startDate, endDate, 'day', '[]')
                );
                const previousWeekData = globalStats.data.filter(dp => 
                    moment(dp.date).isBetween(
                        moment(startDate).subtract(7, 'days'), 
                        moment(startDate).subtract(1, 'day'), 
                        'day', '[]'
                    )
                );
                
                const currentWeekRevenue = currentWeekData.reduce((sum, dp) => sum + dp.revenue, 0);
                const previousWeekRevenue = previousWeekData.reduce((sum, dp) => sum + dp.revenue, 0);
                
                if (previousWeekRevenue > 0) {
                    percentageIncrease = ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue * 100).toFixed(2);
                }
            }
        } else {
            const statsDocs = await Statistics.find({ placeId: { $in: places } });
            let currentWeekTotal = 0;
            let previousWeekTotal = 0;
            
            for (const statsDoc of statsDocs) {
                if (statsDoc.data.length > 0) {
                    const currentWeekData = statsDoc.data.filter(dp => 
                        moment(dp.date).isBetween(startDate, endDate, 'day', '[]')
                    );
                    const previousWeekData = statsDoc.data.filter(dp => 
                        moment(dp.date).isBetween(
                            moment(startDate).subtract(7, 'days'), 
                            moment(startDate).subtract(1, 'day'), 
                            'day', '[]'
                        )
                    );
                    
                    currentWeekTotal += currentWeekData.reduce((sum, dp) => sum + dp.revenue, 0);
                    previousWeekTotal += previousWeekData.reduce((sum, dp) => sum + dp.revenue, 0);
                }
            }
            
            if (previousWeekTotal > 0) {
                percentageIncrease = ((currentWeekTotal - previousWeekTotal) / previousWeekTotal * 100).toFixed(2);
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
