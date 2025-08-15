const moment = require("moment");
const Reservation = require("../../models/reservations");
const Statistics = require("../../models/statistics");
const Place = require("../../models/places");

const calculateStatsForPeriod = async (startDate, endDate, placeId) => {
    const query = {
        createdAt: { $gte: startDate, $lte: endDate },
        status: "success"
    };
    
    if (placeId) {
        query.placeId = placeId;
    }

    const reservations = await Reservation.find(query);
    
    return reservations.reduce((acc, reservation) => {
        acc.bookings += 1;
        acc.revenue += reservation.totalAmount || 0;
        acc.tax += reservation.tax || 0;
        acc.serviceFee += reservation.serviceFee || 0;
        return acc;
    }, { bookings: 0, revenue: 0, tax: 0, serviceFee: 0 });
};

const updateStatistics = async () => {
    try {
        console.log('Starting statistics update...');
        
        // Define date range for today
        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();
        
        // Get all places
        const places = await Place.find().select('_id brandId');
        
        if (places.length > 0) {
            await Promise.all(places.map(async (place) => {
                const placeId = place._id;
                const brandId = place.brandId;
                
                // Get or create statistics document for this place
                let statsDoc = await Statistics.findOrCreateStats(placeId, brandId);
                
                // Calculate today's stats
                const todayStats = await calculateStatsForPeriod(todayStart, todayEnd, placeId);
                
                // Create data point for today
                const dataPoint = {
                    date: todayStart,
                    bookings: todayStats.bookings,
                    revenue: todayStats.revenue,
                    tax: todayStats.tax,
                    serviceFee: todayStats.serviceFee,
                    customers: 0 // Will be calculated separately if needed
                };
                
                // Add or update the data point
                statsDoc.addOrUpdateDataPoint(dataPoint);
                
                // Save the updated document
                await statsDoc.save();
                
                console.log(`Updated statistics for place: ${placeId}`);
            }));
        }
        
        // Also update global statistics (for super admin)
        const globalStats = await Statistics.findOrCreateStats(null, null, true);
        const globalTodayStats = await calculateStatsForPeriod(todayStart, todayEnd);
        
        const globalDataPoint = {
            date: todayStart,
            bookings: globalTodayStats.bookings,
            revenue: globalTodayStats.revenue,
            tax: globalTodayStats.tax,
            serviceFee: globalTodayStats.serviceFee,
            customers: 0
        };
        
        globalStats.addOrUpdateDataPoint(globalDataPoint);
        await globalStats.save();
        
        console.log('Statistics update completed successfully');
        
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
};

module.exports = updateStatistics;
