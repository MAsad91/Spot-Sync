const config = require("../config");

/**
 * Pakistani Currency and Tax Utility Functions
 */

// Convert cents to PKR (assuming amounts are stored in cents)
const centsToPKR = (cents) => {
  return (cents / 100).toFixed(2);
};

// Convert PKR to cents for storage
const pkrToCents = (pkr) => {
  return Math.round(pkr * 100);
};

// Format PKR amount with proper symbol
const formatPKR = (amount) => {
  const pkrAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  return `₨${pkrAmount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Calculate Pakistani taxes
const calculatePakistaniTaxes = (baseAmount, taxRates = {}) => {
  const {
    gst = config.TAX_CONFIG.GST_RATE,
    federalExciseDuty = config.TAX_CONFIG.FEDERAL_EXCISE_DUTY,
    provincialTax = config.TAX_CONFIG.PROVINCIAL_TAX,
    withholdingTax = config.TAX_CONFIG.WITHHOLDING_TAX
  } = taxRates;

  return {
    gst: Math.round((baseAmount * gst) / 100),
    federalExciseDuty: Math.round((baseAmount * federalExciseDuty) / 100),
    provincialTax: Math.round((baseAmount * provincialTax) / 100),
    withholdingTax: Math.round((baseAmount * withholdingTax) / 100),
    totalTax: Math.round((baseAmount * (gst + federalExciseDuty + provincialTax + withholdingTax)) / 100)
  };
};

// Get Pakistani tax breakdown for display
const getPakistaniTaxBreakdown = (taxes) => {
  const breakdown = [];
  
  if (taxes.gst > 0) {
    breakdown.push({
      name: "GST (General Sales Tax)",
      amount: taxes.gst,
      percentage: config.TAX_CONFIG.GST_RATE
    });
  }
  
  if (taxes.federalExciseDuty > 0) {
    breakdown.push({
      name: "Federal Excise Duty",
      amount: taxes.federalExciseDuty,
      percentage: config.TAX_CONFIG.FEDERAL_EXCISE_DUTY
    });
  }
  
  if (taxes.provincialTax > 0) {
    breakdown.push({
      name: "Provincial Tax",
      amount: taxes.provincialTax,
      percentage: config.TAX_CONFIG.PROVINCIAL_TAX
    });
  }
  
  if (taxes.withholdingTax > 0) {
    breakdown.push({
      name: "Withholding Tax",
      amount: taxes.withholdingTax,
      percentage: config.TAX_CONFIG.WITHHOLDING_TAX
    });
  }
  
  return breakdown;
};

// Validate Pakistani tax rates
const validatePakistaniTaxRates = (taxRates) => {
  const errors = [];
  
  if (taxRates.gst < 0 || taxRates.gst > 100) {
    errors.push("GST rate must be between 0 and 100");
  }
  
  if (taxRates.federalExciseDuty < 0 || taxRates.federalExciseDuty > 100) {
    errors.push("Federal Excise Duty rate must be between 0 and 100");
  }
  
  if (taxRates.provincialTax < 0 || taxRates.provincialTax > 100) {
    errors.push("Provincial Tax rate must be between 0 and 100");
  }
  
  if (taxRates.withholdingTax < 0 || taxRates.withholdingTax > 100) {
    errors.push("Withholding Tax rate must be between 0 and 100");
  }
  
  return errors;
};

module.exports = {
  centsToPKR,
  pkrToCents,
  formatPKR,
  calculatePakistaniTaxes,
  getPakistaniTaxBreakdown,
  validatePakistaniTaxRates
}; 