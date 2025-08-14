const { http200, http400 } = require("../../../../global/errors/httpCodes");
const Statistics = require("../../../../models/statistics");
const Place = require("../../../../models/places");
const moment = require("moment");

const generateRandomStats = (baseValue, variance = 0.3) => {
    const min = baseValue * (1 - variance);
    const max = baseValue * (1 + variance);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = async (req, res) => {
    try {
        console.log('Starting statistics data population via API...');
        
        // Get all places
        const places = await Place.find().select('_id brandId');
        console.log(`Found ${places.length} places`);
        
        if (places.length === 0) {
            return res.status(http400).json({
                success: false,
                message: "No places found. Please create places first.",
            });
        }
        
        // Generate 12 months of data for each place
        for (const place of places) {
            console.log(`Processing place: ${place._id}`);
            
            // Get or create statistics document for this place
            let statsDoc = await Statistics.findOrCreateStats(place._id, place.brandId);
            
            // Clear existing data
            statsDoc.data = [];
            
            // Generate data for the last 12 months
            const endDate = moment().endOf('month');
            const startDate = moment().subtract(11, 'months').startOf('month');
            
            let currentDate = moment(startDate);
            
            while (currentDate.isSameOrBefore(endDate)) {
                // Generate monthly data
                const monthStart = currentDate.clone().startOf('month');
                const monthEnd = currentDate.clone().endOf('month');
                
                // Base values for the month (random but realistic)
                const baseBookings = generateRandomStats(150, 0.4); // 90-210 bookings per month
                const baseRevenue = generateRandomStats(15000, 0.4); // $9,000-$21,000 per month
                const baseTax = Math.floor(baseRevenue * 0.08); // 8% tax
                const baseServiceFee = Math.floor(baseRevenue * 0.05); // 5% service fee
                
                // Generate daily data for the month
                let dayDate = monthStart.clone();
                
                while (dayDate.isSameOrBefore(monthEnd)) {
                    // Daily variation (weekends have more bookings)
                    const dayOfWeek = dayDate.day();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const dailyMultiplier = isWeekend ? 1.3 : 1.0;
                    
                    // Generate daily stats
                    const dailyBookings = Math.floor(generateRandomStats(baseBookings / 30, 0.5) * dailyMultiplier);
                    const dailyRevenue = Math.floor(generateRandomStats(baseRevenue / 30, 0.5) * dailyMultiplier);
                    const dailyTax = Math.floor(dailyRevenue * 0.08);
                    const dailyServiceFee = Math.floor(dailyRevenue * 0.05);
                    
                    // Create data point
                    const dataPoint = {
                        date: dayDate.toDate(),
                        bookings: dailyBookings,
                        revenue: dailyRevenue,
                        tax: dailyTax,
                        serviceFee: dailyServiceFee,
                        customers: Math.floor(dailyBookings * 0.8) // 80% of bookings are unique customers
                    };
                    
                    statsDoc.data.push(dataPoint);
                    
                    dayDate.add(1, 'day');
                }
                
                currentDate.add(1, 'month');
            }
            
            // Sort data by date (newest first)
            statsDoc.data.sort((a, b) => b.date - a.date);
            
            // Update metadata
            statsDoc.lastUpdated = new Date();
            statsDoc.lastCalculationDate = new Date();
            
            // Save the document
            await statsDoc.save();
            
            console.log(`Completed data population for place: ${place._id}`);
        }
        
        // Also create global statistics (for super admin)
        console.log('Creating global statistics...');
        const globalStats = await Statistics.findOrCreateStats(null, null, true);
        
        // Aggregate data from all places for global stats
        const allStats = await Statistics.find({ isGlobal: false }).populate('data');
        
        // Create a map of dates to aggregate data
        const globalDataMap = new Map();
        
        for (const placeStats of allStats) {
            for (const dataPoint of placeStats.data) {
                const dateKey = moment(dataPoint.date).format('YYYY-MM-DD');
                
                if (!globalDataMap.has(dateKey)) {
                    globalDataMap.set(dateKey, {
                        date: dataPoint.date,
                        bookings: 0,
                        revenue: 0,
                        tax: 0,
                        serviceFee: 0,
                        customers: 0
                    });
                }
                
                const globalData = globalDataMap.get(dateKey);
                globalData.bookings += dataPoint.bookings;
                globalData.revenue += dataPoint.revenue;
                globalData.tax += dataPoint.tax;
                globalData.serviceFee += dataPoint.serviceFee;
                globalData.customers += dataPoint.customers;
            }
        }
        
        // Convert map to array and sort
        globalStats.data = Array.from(globalDataMap.values()).sort((a, b) => b.date - a.date);
        globalStats.lastUpdated = new Date();
        globalStats.lastCalculationDate = new Date();
        
        await globalStats.save();
        
        console.log('Statistics data population completed successfully!');
        
        return res.status(http200).json({
            success: true,
            message: `Statistics data populated successfully for ${places.length} places and global statistics`,
            data: {
                placesProcessed: places.length,
                totalDataPoints: places.length * 365, // Approximately 365 days per place
                globalDataPoints: globalDataMap.size
            }
        });
        
    } catch (error) {
        console.error('Error populating statistics data:', error);
        return res.status(http400).json({
            success: false,
            message: error?.message ?? "Something went wrong while populating statistics data!",
        });
    }
}; 