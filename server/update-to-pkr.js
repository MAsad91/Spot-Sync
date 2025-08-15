require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config');

// Import models
const Rates = require('./models/rates');
const Places = require('./models/places');
const Reservations = require('./models/reservations');
const Subscriptions = require('./models/subscriptions');
const Transactions = require('./models/transaction');
const Receipts = require('./models/receipts');

/**
 * Convert cents to PKR (whole rupees)
 * @param {number} cents - Amount in cents
 * @returns {number} - Amount in PKR (whole rupees)
 */
function centsToPKR(cents) {
  if (!cents || isNaN(cents)) return 0;
  return Math.round(cents / 100);
}

/**
 * Update all rates to use PKR instead of cents
 */
async function updateRates() {
  console.log('🔄 Updating rates to PKR...');
  
  try {
    const rates = await Rates.find({});
    let updatedCount = 0;
    
    for (const rate of rates) {
      const oldAmount = rate.amount;
      const oldMinimumAmount = rate.minimumAmount;
      
      // Convert cents to PKR
      rate.amount = centsToPKR(oldAmount);
      rate.minimumAmount = centsToPKR(oldMinimumAmount);
      
      // Update nested rates array
      if (rate.rates && rate.rates.length > 0) {
        rate.rates.forEach(nestedRate => {
          if (nestedRate.amount) {
            nestedRate.amount = centsToPKR(nestedRate.amount);
          }
        });
      }
      
      await rate.save();
      updatedCount++;
      
      console.log(`  Updated rate: ${rate.displayName} - Amount: ${oldAmount} cents → ${rate.amount} PKR`);
    }
    
    console.log(`✅ Updated ${updatedCount} rates to PKR`);
  } catch (error) {
    console.error('❌ Error updating rates:', error);
  }
}

/**
 * Update all reservations to use PKR instead of cents
 */
async function updateReservations() {
  console.log('🔄 Updating reservations to PKR...');
  
  try {
    const reservations = await Reservations.find({});
    let updatedCount = 0;
    
    for (const reservation of reservations) {
      const oldBaseRate = reservation.baseRate;
      const oldTotalAmount = reservation.totalAmount;
      const oldTax = reservation.tax;
      const oldCityTax = reservation.cityTax;
      const oldCountyTax = reservation.countyTax;
      const oldServiceFee = reservation.serviceFee;
      const oldPaymentGatewayFee = reservation.paymentGatewayFee;
      
      // Convert cents to PKR
      reservation.baseRate = centsToPKR(oldBaseRate);
      reservation.totalAmount = centsToPKR(oldTotalAmount);
      reservation.tax = centsToPKR(oldTax);
      reservation.cityTax = centsToPKR(oldCityTax);
      reservation.countyTax = centsToPKR(oldCountyTax);
      reservation.serviceFee = centsToPKR(oldServiceFee);
      reservation.paymentGatewayFee = centsToPKR(oldPaymentGatewayFee);
      
      await reservation.save();
      updatedCount++;
      
      console.log(`  Updated reservation: ${reservation._id} - Total: ${oldTotalAmount} cents → ${reservation.totalAmount} PKR`);
    }
    
    console.log(`✅ Updated ${updatedCount} reservations to PKR`);
  } catch (error) {
    console.error('❌ Error updating reservations:', error);
  }
}

/**
 * Update all subscriptions to use PKR instead of cents
 */
async function updateSubscriptions() {
  console.log('🔄 Updating subscriptions to PKR...');
  
  try {
    const subscriptions = await Subscriptions.find({});
    let updatedCount = 0;
    
    for (const subscription of subscriptions) {
      const oldTotalAmount = subscription.totalAmount;
      const oldFirstMonthTotalAmount = subscription.firstMonthTotalAmount;
      const oldServiceFee = subscription.serviceFee;
      
      // Convert cents to PKR
      subscription.totalAmount = centsToPKR(oldTotalAmount);
      subscription.firstMonthTotalAmount = centsToPKR(oldFirstMonthTotalAmount);
      subscription.serviceFee = centsToPKR(oldServiceFee);
      
      await subscription.save();
      updatedCount++;
      
      console.log(`  Updated subscription: ${subscription._id} - Total: ${oldTotalAmount} cents → ${subscription.totalAmount} PKR`);
    }
    
    console.log(`✅ Updated ${updatedCount} subscriptions to PKR`);
  } catch (error) {
    console.error('❌ Error updating subscriptions:', error);
  }
}

/**
 * Update all transactions to use PKR instead of cents
 */
async function updateTransactions() {
  console.log('🔄 Updating transactions to PKR...');
  
  try {
    const transactions = await Transactions.find({});
    let updatedCount = 0;
    
    for (const transaction of transactions) {
      const oldAmount = transaction.amount;
      const oldBaseRate = transaction.baseRate;
      const oldTax = transaction.tax;
      const oldCityTax = transaction.cityTax;
      const oldCountyTax = transaction.countyTax;
      const oldServiceFee = transaction.serviceFee;
      const oldPaymentGatewayFee = transaction.paymentGatewayFee;
      
      // Convert cents to PKR
      transaction.amount = centsToPKR(oldAmount);
      transaction.baseRate = centsToPKR(oldBaseRate);
      transaction.tax = centsToPKR(oldTax);
      transaction.cityTax = centsToPKR(oldCityTax);
      transaction.countyTax = centsToPKR(oldCountyTax);
      transaction.serviceFee = centsToPKR(oldServiceFee);
      transaction.paymentGatewayFee = centsToPKR(oldPaymentGatewayFee);
      
      await transaction.save();
      updatedCount++;
      
      console.log(`  Updated transaction: ${transaction._id} - Amount: ${oldAmount} cents → ${transaction.amount} PKR`);
    }
    
    console.log(`✅ Updated ${updatedCount} transactions to PKR`);
  } catch (error) {
    console.error('❌ Error updating transactions:', error);
  }
}

/**
 * Update all receipts to use PKR instead of cents
 */
async function updateReceipts() {
  console.log('🔄 Updating receipts to PKR...');
  
  try {
    const receipts = await Receipts.find({});
    let updatedCount = 0;
    
    for (const receipt of receipts) {
      const oldTotal = receipt.total;
      const oldBaseRate = receipt.baseRate;
      const oldTax = receipt.tax;
      const oldCityTax = receipt.cityTax;
      const oldCountyTax = receipt.countyTax;
      const oldServiceFee = receipt.serviceFee;
      const oldPaymentGatewayFee = receipt.paymentGatewayFee;
      
      // Convert cents to PKR
      receipt.total = centsToPKR(oldTotal);
      receipt.baseRate = centsToPKR(oldBaseRate);
      receipt.tax = centsToPKR(oldTax);
      receipt.cityTax = centsToPKR(oldCityTax);
      receipt.countyTax = centsToPKR(oldCountyTax);
      receipt.serviceFee = centsToPKR(oldServiceFee);
      receipt.paymentGatewayFee = centsToPKR(oldPaymentGatewayFee);
      
      await receipt.save();
      updatedCount++;
      
      console.log(`  Updated receipt: ${receipt._id} - Total: ${oldTotal} cents → ${receipt.total} PKR`);
    }
    
    console.log(`✅ Updated ${updatedCount} receipts to PKR`);
  } catch (error) {
    console.error('❌ Error updating receipts:', error);
  }
}

/**
 * Main function to update all data to PKR
 */
async function updateAllToPKR() {
  console.log('🚀 Starting PKR conversion...');
  console.log('⚠️  This will convert all monetary values from cents to PKR (whole rupees)');
  console.log('⚠️  Make sure you have a backup before running this script!');
  
  try {
    // Connect to database
    const mongoUri = process.env.DATABASE_INFO || config.MONGO_URI;
    if (!mongoUri) {
      throw new Error('DATABASE_INFO environment variable is not set');
    }
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log('✅ Connected to database');
    
    // Update all collections
    await updateRates();
    await updateReservations();
    await updateSubscriptions();
    await updateTransactions();
    await updateReceipts();
    
    console.log('🎉 PKR conversion completed successfully!');
    console.log('📝 All monetary values are now stored as whole PKR amounts');
    
  } catch (error) {
    console.error('❌ Error during PKR conversion:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script if called directly
if (require.main === module) {
  updateAllToPKR().catch(console.error);
}

module.exports = {
  updateAllToPKR,
  centsToPKR
}; 