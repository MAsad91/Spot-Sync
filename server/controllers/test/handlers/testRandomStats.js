const { http200, http400 } = require("../../../global/errors/httpCodes");
const Statistics = require("../../../models/statistics");
const Place = require("../../../models/places");
const moment = require("moment");

module.exports = async (req, res) => {
  try {
    console.log("Testing random statistics...");

    // Get all active places
    const places = await Place.find({ status: 10 }).select('_id lotName brandId');
    console.log(`Found ${places.length} active places`);

    if (places.length === 0) {
      return res.status(http400).json({
        success: false,
        message: "No active places found. Please create places with status 10 first.",
      });
    }

    // Get statistics for the first place
    const placeId = places[0]._id;
    const stats = await Statistics.find({ placeId }).sort({ createdAt: -1 }).limit(20);

    console.log(`Found ${stats.length} statistics records for place: ${places[0].lotName}`);

    // Group statistics by data type
    const groupedStats = {};
    const dataTypes = ['revenue', 'bookings', 'customers', 'tax', 'serviceFee'];

    dataTypes.forEach(dataType => {
      const typeStats = stats.filter(stat => stat.dataType === dataType);
      groupedStats[dataType] = {
        count: typeStats.length,
        totalValue: typeStats.reduce((sum, stat) => sum + stat.value, 0),
        averageValue: typeStats.length > 0 ? Math.round(typeStats.reduce((sum, stat) => sum + stat.value, 0) / typeStats.length) : 0,
        recentRecords: typeStats.slice(0, 5).map(stat => ({
          title: stat.title,
          value: stat.value,
          createdAt: stat.createdAt,
          dataType: stat.dataType
        }))
      };
    });

    // Get super admin stats (without placeId)
    const superAdminStats = await Statistics.find({ 
      placeId: { $exists: false },
      brandId: { $exists: false }
    }).sort({ createdAt: -1 }).limit(10);

    // Calculate summary
    const totalRecords = stats.length;
    const totalValue = stats.reduce((sum, stat) => sum + stat.value, 0);
    const averageValue = totalRecords > 0 ? Math.round(totalValue / totalRecords) : 0;

    return res.status(http200).json({
      success: true,
      message: "Random statistics test successful!",
      data: {
        places: places.map(place => ({
          id: place._id,
          name: place.lotName,
          brandId: place.brandId
        })),
        summary: {
          totalRecords,
          totalValue,
          averageValue,
          placeCount: places.length,
          superAdminRecords: superAdminStats.length
        },
        statistics: groupedStats,
        superAdminStats: superAdminStats.map(stat => ({
          title: stat.title,
          value: stat.value,
          dataType: stat.dataType,
          createdAt: stat.createdAt
        })),
        sampleData: stats.slice(0, 10).map(stat => ({
          title: stat.title,
          value: stat.value,
          dataType: stat.dataType,
          createdAt: stat.createdAt,
          placeId: stat.placeId
        }))
      },
    });
  } catch (error) {
    console.error("Random statistics test error:", error);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
}; 