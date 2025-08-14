const { http200, http400 } = require("../../../global/errors/httpCodes");
const Statistics = require("../../../models/statistics");
const Place = require("../../../models/places");

module.exports = async (req, res) => {
  try {
    console.log("Testing historical statistics...");

    // Get all places
    const places = await Place.find().select('_id lotName');
    console.log(`Found ${places.length} places`);

    if (places.length === 0) {
      return res.status(http400).json({
        success: false,
        message: "No places found. Please create places first.",
      });
    }

    // Get statistics for the first place
    const placeId = places[0]._id;
    const stats = await Statistics.find({ placeId }).sort({ year: 1, month: 1 });

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
        records: typeStats.map(stat => ({
          month: stat.month,
          year: stat.year,
          value: stat.value,
          changePercentage: stat.changePercentage,
          trend: stat.trend
        }))
      };
    });

    // Calculate summary
    const totalRecords = stats.length;
    const totalValue = stats.reduce((sum, stat) => sum + stat.value, 0);
    const averageValue = totalRecords > 0 ? Math.round(totalValue / totalRecords) : 0;

    return res.status(http200).json({
      success: true,
      message: "Historical statistics test successful!",
      data: {
        places: places.map(place => ({
          id: place._id,
          name: place.lotName
        })),
        summary: {
          totalRecords,
          totalValue,
          averageValue,
          placeCount: places.length
        },
        statistics: groupedStats,
        sampleData: stats.slice(0, 5).map(stat => ({
          title: stat.title,
          month: stat.month,
          year: stat.year,
          value: stat.value,
          dataType: stat.dataType,
          changePercentage: stat.changePercentage,
          trend: stat.trend
        }))
      },
    });
  } catch (error) {
    console.error("Statistics test error:", error);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
}; 