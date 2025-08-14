const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema for individual data points
const DataPointSchema = new Schema({
    date: { type: Date, required: true }, // Date of the data point
    bookings: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    customers: { type: Number, default: 0 }
}, { timestamps: true });

// Main statistics schema
const StatisticSchema = new Schema({
    placeId: { 
        type: Schema.Types.ObjectId, 
        ref: "places", 
        required: function() { return !this.isGlobal; } // Only required if not global
    },
    brandId: { 
        type: Schema.Types.ObjectId, 
        ref: "brands", 
        required: function() { return !this.isGlobal; } // Only required if not global
    },
    
    // Historical data points
    data: [DataPointSchema],
    
    // Metadata
    lastUpdated: { type: Date, default: new Date() },
    lastCalculationDate: { type: Date, default: new Date() },
    
    // For super admin (no placeId)
    isGlobal: { type: Boolean, default: false },
    
    createdAt: { type: Date, default: new Date() },
    updatedAt: { type: Date, default: new Date() }
});

// Indexes for efficient queries
StatisticSchema.index({ placeId: 1, "data.date": -1 });
StatisticSchema.index({ brandId: 1, "data.date": -1 });
StatisticSchema.index({ isGlobal: 1, "data.date": -1 });

// Method to add or update data point
StatisticSchema.methods.addOrUpdateDataPoint = function(dataPoint) {
    // Find existing data point for the same date
    const existingIndex = this.data.findIndex(dp => 
        dp.date.toDateString() === dataPoint.date.toDateString()
    );
    
    if (existingIndex !== -1) {
        // Update existing data point
        this.data[existingIndex] = dataPoint;
    } else {
        // Add new data point
        this.data.push(dataPoint);
    }
    
    // Sort by date (newest first)
    this.data.sort((a, b) => b.date - a.date);
    
    this.lastUpdated = new Date();
    this.lastCalculationDate = new Date();
};

// Method to get data for specific date range
StatisticSchema.methods.getDataForDateRange = function(startDate, endDate) {
    return this.data.filter(dp => 
        dp.date >= startDate && dp.date <= endDate
    ).sort((a, b) => a.date - b.date);
};

// Method to get latest data point
StatisticSchema.methods.getLatestData = function() {
    return this.data[0];
};

// Method to get data for last N days
StatisticSchema.methods.getDataForLastNDays = function(days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.data.filter(dp => dp.date >= cutoffDate)
        .sort((a, b) => a.date - b.date);
};

// Static method to find or create statistics document
StatisticSchema.statics.findOrCreateStats = async function(placeId, brandId, isGlobal = false) {
    let stats = await this.findOne({ 
        placeId: isGlobal ? null : placeId, 
        brandId: isGlobal ? null : brandId,
        isGlobal: isGlobal 
    });
    
    if (!stats) {
        stats = new this({
            placeId: isGlobal ? null : placeId,
            brandId: isGlobal ? null : brandId,
            isGlobal: isGlobal,
            data: []
        });
        await stats.save();
    }
    
    return stats;
};

module.exports = Statistics = mongoose.model("Statistics", StatisticSchema);
