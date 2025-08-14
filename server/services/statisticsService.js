const moment = require("moment");
const Statistics = require("../models/statistics");
const Reservation = require("../models/reservations");
const Subscription = require("../models/subscriptions");
const Customer = require("../models/customers");
const Payment = require("../models/payments");
const Place = require("../models/places");

/**
 * Enhanced Statistics Service for Historical Data
 * Generates 12 months of historical data for beautiful graph displays
 */
class StatisticsService {
  constructor() {
    this.currentYear = moment().year();
    this.currentMonth = moment().format('MMMM');
  }

  /**
   * Generate historical statistics for a specific data type
   * @param {string} dataType - revenue, bookings, customers, tax, serviceFee
   * @param {Array} placeIds - Array of place IDs
   * @param {string} title - Statistics title
   * @returns {Promise<Object>} Historical data with chart format
   */
  async generateHistoricalStatistics(dataType, placeIds, title) {
    try {
      const currentDate = moment();
      const labels = [];
      const data = [];
      const historicalData = [];

      // Generate 12 months of data (current + 11 previous)
      for (let i = 11; i >= 0; i--) {
        const targetDate = moment().subtract(i, 'months');
        const monthName = targetDate.format('MMMM');
        const year = targetDate.year();
        
        labels.push(targetDate.format('MMM'));

        // Get or create statistics for this month
        const monthStats = await this.getOrCreateMonthStatistics(
          dataType, 
          placeIds, 
          title, 
          monthName, 
          year
        );

        data.push(monthStats.value);
        historicalData.push({
          month: monthName,
          year: year,
          value: monthStats.value,
          previousValue: monthStats.previousValue,
          changeAmount: monthStats.changeAmount,
          changePercentage: monthStats.changePercentage,
          trend: monthStats.trend
        });
      }

      // Calculate overall percentage change
      const currentValue = data[data.length - 1];
      const previousValue = data[data.length - 2] || 0;
      const percentageChange = previousValue > 0 
        ? ((currentValue - previousValue) / previousValue * 100).toFixed(2)
        : 0;

      return {
        labels,
        datasets: {
          label: title,
          data: data.map(value => Number((value / 100).toFixed(2))) // Convert cents to dollars
        },
        historicalData,
        percentageChange: parseFloat(percentageChange),
        currentValue,
        previousValue
      };
    } catch (error) {
      console.error(`Error generating historical statistics for ${dataType}:`, error);
      throw error;
    }
  }

  /**
   * Get or create statistics for a specific month
   * @param {string} dataType - Type of data
   * @param {Array} placeIds - Place IDs
   * @param {string} title - Statistics title
   * @param {string} month - Month name
   * @param {number} year - Year
   * @returns {Promise<Object>} Statistics data
   */
  async getOrCreateMonthStatistics(dataType, placeIds, title, month, year) {
    try {
      // Try to find existing statistics
      let stats = await Statistics.findOne({
        title,
        month,
        year,
        dataType,
        placeId: { $in: placeIds }
      });

      if (!stats) {
        // Generate statistics for this month
        const monthData = await this.calculateMonthData(dataType, placeIds, month, year);
        
        // Get previous month's data for comparison
        const previousMonth = moment(`${month} ${year}`, 'MMMM YYYY').subtract(1, 'month');
        const previousMonthName = previousMonth.format('MMMM');
        const previousYear = previousMonth.year();
        
        const previousStats = await Statistics.findOne({
          title,
          month: previousMonthName,
          year: previousYear,
          dataType,
          placeId: { $in: placeIds }
        });

        const previousValue = previousStats ? previousStats.value : 0;
        const changeAmount = monthData.value - previousValue;
        const changePercentage = previousValue > 0 
          ? (changeAmount / previousValue * 100)
          : 0;
        
        const trend = changeAmount > 0 ? 'up' : changeAmount < 0 ? 'down' : 'stable';

        // Create new statistics
        stats = await Statistics.create({
          title,
          value: monthData.value,
          placeId: placeIds[0], // Store for first place, query by placeIds
          month,
          year,
          dataType,
          period: 'monthly',
          previousValue,
          changeAmount,
          changePercentage,
          trend,
          percentageIncrease: changePercentage.toFixed(2)
        });
      }

      return stats;
    } catch (error) {
      console.error(`Error getting/creating month statistics:`, error);
      throw error;
    }
  }

  /**
   * Calculate actual data for a specific month
   * @param {string} dataType - Type of data to calculate
   * @param {Array} placeIds - Place IDs
   * @param {string} month - Month name
   * @param {number} year - Year
   * @returns {Promise<Object>} Calculated data
   */
  async calculateMonthData(dataType, placeIds, month, year) {
    try {
      const startDate = moment(`${month} ${year}`, 'MMMM YYYY').startOf('month');
      const endDate = moment(`${month} ${year}`, 'MMMM YYYY').endOf('month');

      let value = 0;

      switch (dataType) {
        case 'revenue':
          value = await this.calculateMonthlyRevenue(placeIds, startDate, endDate);
          break;
        case 'bookings':
          value = await this.calculateMonthlyBookings(placeIds, startDate, endDate);
          break;
        case 'customers':
          value = await this.calculateMonthlyCustomers(placeIds, startDate, endDate);
          break;
        case 'tax':
          value = await this.calculateMonthlyTax(placeIds, startDate, endDate);
          break;
        case 'serviceFee':
          value = await this.calculateMonthlyServiceFee(placeIds, startDate, endDate);
          break;
        default:
          value = 0;
      }

      return { value };
    } catch (error) {
      console.error(`Error calculating month data for ${dataType}:`, error);
      return { value: 0 };
    }
  }

  /**
   * Calculate monthly revenue
   */
  async calculateMonthlyRevenue(placeIds, startDate, endDate) {
    try {
      const reservations = await Reservation.find({
        placeId: { $in: placeIds },
        status: "success",
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
      });

      return reservations.reduce((total, reservation) => {
        return total + (reservation.totalAmount || 0);
      }, 0);
    } catch (error) {
      console.error('Error calculating monthly revenue:', error);
      return 0;
    }
  }

  /**
   * Calculate monthly bookings
   */
  async calculateMonthlyBookings(placeIds, startDate, endDate) {
    try {
      const count = await Reservation.countDocuments({
        placeId: { $in: placeIds },
        status: "success",
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
      });

      return count;
    } catch (error) {
      console.error('Error calculating monthly bookings:', error);
      return 0;
    }
  }

  /**
   * Calculate monthly customers
   */
  async calculateMonthlyCustomers(placeIds, startDate, endDate) {
    try {
      const count = await Customer.countDocuments({
        placeId: { $in: placeIds },
        status: 10,
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
      });

      return count;
    } catch (error) {
      console.error('Error calculating monthly customers:', error);
      return 0;
    }
  }

  /**
   * Calculate monthly tax
   */
  async calculateMonthlyTax(placeIds, startDate, endDate) {
    try {
      const reservations = await Reservation.find({
        placeId: { $in: placeIds },
        status: "success",
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
      });

      return reservations.reduce((total, reservation) => {
        return total + (reservation.tax || 0);
      }, 0);
    } catch (error) {
      console.error('Error calculating monthly tax:', error);
      return 0;
    }
  }

  /**
   * Calculate monthly service fee
   */
  async calculateMonthlyServiceFee(placeIds, startDate, endDate) {
    try {
      const reservations = await Reservation.find({
        placeId: { $in: placeIds },
        status: "success",
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() }
      });

      return reservations.reduce((total, reservation) => {
        return total + (reservation.serviceFee || 0);
      }, 0);
    } catch (error) {
      console.error('Error calculating monthly service fee:', error);
      return 0;
    }
  }

  /**
   * Generate all historical statistics for dashboard
   * @param {Array} placeIds - Place IDs
   * @returns {Promise<Object>} All dashboard statistics
   */
  async generateDashboardStatistics(placeIds) {
    try {
      const [
        revenueStats,
        bookingsStats,
        customersStats,
        taxStats,
        serviceFeeStats
      ] = await Promise.all([
        this.generateHistoricalStatistics('revenue', placeIds, 'Monthly Revenue'),
        this.generateHistoricalStatistics('bookings', placeIds, 'Monthly Bookings'),
        this.generateHistoricalStatistics('customers', placeIds, 'Monthly Customers'),
        this.generateHistoricalStatistics('tax', placeIds, 'Monthly Tax'),
        this.generateHistoricalStatistics('serviceFee', placeIds, 'Monthly Service Fee')
      ]);

      return {
        revenue: revenueStats,
        bookings: bookingsStats,
        customers: customersStats,
        tax: taxStats,
        serviceFee: serviceFeeStats
      };
    } catch (error) {
      console.error('Error generating dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Update all statistics for current month
   * @param {Array} placeIds - Place IDs
   * @returns {Promise<Object>} Updated statistics
   */
  async updateCurrentMonthStatistics(placeIds) {
    try {
      const currentMonth = moment().format('MMMM');
      const currentYear = moment().year();

      const dataTypes = ['revenue', 'bookings', 'customers', 'tax', 'serviceFee'];
      const titles = ['Monthly Revenue', 'Monthly Bookings', 'Monthly Customers', 'Monthly Tax', 'Monthly Service Fee'];

      const updates = [];

      for (let i = 0; i < dataTypes.length; i++) {
        const monthData = await this.calculateMonthData(
          dataTypes[i], 
          placeIds, 
          currentMonth, 
          currentYear
        );

        // Get previous month for comparison
        const previousMonth = moment().subtract(1, 'month');
        const previousMonthName = previousMonth.format('MMMM');
        const previousYear = previousMonth.year();

        const previousStats = await Statistics.findOne({
          title: titles[i],
          month: previousMonthName,
          year: previousYear,
          dataType: dataTypes[i],
          placeId: { $in: placeIds }
        });

        const previousValue = previousStats ? previousStats.value : 0;
        const changeAmount = monthData.value - previousValue;
        const changePercentage = previousValue > 0 
          ? (changeAmount / previousValue * 100)
          : 0;
        
        const trend = changeAmount > 0 ? 'up' : changeAmount < 0 ? 'down' : 'stable';

        // Update or create current month statistics
        const update = await Statistics.findOneAndUpdate(
          {
            title: titles[i],
            month: currentMonth,
            year: currentYear,
            dataType: dataTypes[i],
            placeId: { $in: placeIds }
          },
          {
            value: monthData.value,
            previousValue,
            changeAmount,
            changePercentage,
            trend,
            percentageIncrease: changePercentage.toFixed(2),
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );

        updates.push(update);
      }

      return updates;
    } catch (error) {
      console.error('Error updating current month statistics:', error);
      throw error;
    }
  }
}

// Create singleton instance
const statisticsService = new StatisticsService();

module.exports = statisticsService; 