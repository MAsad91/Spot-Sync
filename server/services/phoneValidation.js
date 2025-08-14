const { parsePhoneNumberWithError, getCountries, getCountryCallingCode, isSupportedCountry } = require("libphonenumber-js");

/**
 * Enhanced International Phone Number Validation Service
 * Supports all countries while maintaining backward compatibility
 */

class PhoneValidationService {
  constructor() {
    this.supportedCountries = getCountries();
    this.defaultCountry = "US";
  }

  /**
   * Validate phone number for any country
   * @param {string} phoneNumber - The phone number to validate
   * @param {string} countryCode - Optional country code (default: auto-detect)
   * @returns {object} Validation result with detailed information
   */
  validatePhoneNumber(phoneNumber, countryCode = null) {
    try {
      if (!phoneNumber || typeof phoneNumber !== 'string') {
        return {
          isValid: false,
          error: "Invalid phone number format",
          suggestions: []
        };
      }

      // Clean the phone number
      const cleanedNumber = this.cleanPhoneNumber(phoneNumber);
      
      // Try to parse with provided country code
      if (countryCode && isSupportedCountry(countryCode)) {
        const parsedWithCountry = this.parseWithCountry(cleanedNumber, countryCode);
        if (parsedWithCountry.isValid) {
          return parsedWithCountry;
        }
      }

      // Try to auto-detect country
      const autoDetected = this.autoDetectCountry(cleanedNumber);
      if (autoDetected.isValid) {
        return autoDetected;
      }

      // Try with common country codes if auto-detection fails
      const commonCountries = ["US", "CA", "GB", "AU", "IN", "DE", "FR", "IT", "ES", "BR", "MX", "JP", "KR", "CN"];
      for (const country of commonCountries) {
        const result = this.parseWithCountry(cleanedNumber, country);
        if (result.isValid) {
          return {
            ...result,
            detectedCountry: country,
            suggestions: this.getSuggestions(cleanedNumber)
          };
        }
      }

      // If all attempts fail, return suggestions
      return {
        isValid: false,
        error: "Invalid phone number",
        suggestions: this.getSuggestions(cleanedNumber),
        originalNumber: phoneNumber
      };

    } catch (error) {
      console.error("Phone validation error:", error);
      return {
        isValid: false,
        error: error.message,
        originalNumber: phoneNumber
      };
    }
  }

  /**
   * Parse phone number with specific country
   * @param {string} phoneNumber - The phone number
   * @param {string} countryCode - The country code
   * @returns {object} Parsed result
   */
  parseWithCountry(phoneNumber, countryCode) {
    try {
      let numberToParse = phoneNumber;
      
      // Add country calling code if not present
      if (!phoneNumber.startsWith('+')) {
        const callingCode = getCountryCallingCode(countryCode);
        numberToParse = `+${callingCode}${phoneNumber}`;
      }

      const parsed = parsePhoneNumberWithError(numberToParse, countryCode);
      
      if (parsed && parsed.isValid()) {
        return {
          isValid: true,
          number: parsed.number,
          countryCode: parsed.country,
          countryCallingCode: `+${parsed.countryCallingCode}`,
          nationalNumber: parsed.nationalNumber,
          internationalNumber: parsed.formatInternational(),
          nationalNumberFormatted: parsed.formatNational(),
          type: parsed.getType(),
          isMobile: parsed.getType() === 'MOBILE',
          isFixedLine: parsed.getType() === 'FIXED_LINE',
          isValidForCountry: parsed.isValid(),
          countryName: this.getCountryName(parsed.country)
        };
      }

      return { isValid: false };

    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  /**
   * Auto-detect country from phone number
   * @param {string} phoneNumber - The phone number
   * @returns {object} Auto-detected result
   */
  autoDetectCountry(phoneNumber) {
    try {
      // If number starts with +, try to parse without country
      if (phoneNumber.startsWith('+')) {
        const parsed = parsePhoneNumberWithError(phoneNumber);
        if (parsed && parsed.isValid()) {
          return {
            isValid: true,
            number: parsed.number,
            countryCode: parsed.country,
            countryCallingCode: `+${parsed.countryCallingCode}`,
            nationalNumber: parsed.nationalNumber,
            internationalNumber: parsed.formatInternational(),
            nationalNumberFormatted: parsed.formatNational(),
            type: parsed.getType(),
            isMobile: parsed.getType() === 'MOBILE',
            isFixedLine: parsed.getType() === 'FIXED_LINE',
            isValidForCountry: parsed.isValid(),
            countryName: this.getCountryName(parsed.country),
            autoDetected: true
          };
        }
      }

      return { isValid: false };

    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  /**
   * Clean phone number by removing non-digit characters except +
   * @param {string} phoneNumber - The phone number to clean
   * @returns {string} Cleaned phone number
   */
  cleanPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Remove all characters except digits, +, and spaces
    let cleaned = phoneNumber.replace(/[^\d+\s]/g, '');
    
    // Remove extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  /**
   * Get suggestions for invalid phone numbers
   * @param {string} phoneNumber - The phone number
   * @returns {array} Array of suggestions
   */
  getSuggestions(phoneNumber) {
    const suggestions = [];
    
    if (!phoneNumber) return suggestions;

    // Remove all non-digits
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    if (digitsOnly.length < 7) {
      suggestions.push("Phone number seems too short. Most countries require 7-15 digits.");
    }
    
    if (digitsOnly.length > 15) {
      suggestions.push("Phone number seems too long. Most countries require 7-15 digits.");
    }

    // Common country code suggestions
    const commonCodes = {
      "1": "US/Canada (+1)",
      "44": "UK (+44)",
      "33": "France (+33)",
      "49": "Germany (+49)",
      "39": "Italy (+39)",
      "34": "Spain (+34)",
      "81": "Japan (+81)",
      "86": "China (+86)",
      "91": "India (+91)",
      "61": "Australia (+61)"
    };

    // Check if number might need a country code
    if (!phoneNumber.startsWith('+') && digitsOnly.length >= 10) {
      suggestions.push("Try adding a country code (e.g., +1 for US/Canada)");
      
      // Suggest based on first few digits
      const firstDigits = digitsOnly.substring(0, 2);
      if (commonCodes[firstDigits]) {
        suggestions.push(`This might be a ${commonCodes[firstDigits]} number`);
      }
    }

    return suggestions;
  }

  /**
   * Get country name from country code
   * @param {string} countryCode - The country code
   * @returns {string} Country name
   */
  getCountryName(countryCode) {
    const countryNames = {
      "US": "United States",
      "CA": "Canada",
      "GB": "United Kingdom",
      "AU": "Australia",
      "IN": "India",
      "DE": "Germany",
      "FR": "France",
      "IT": "Italy",
      "ES": "Spain",
      "BR": "Brazil",
      "MX": "Mexico",
      "JP": "Japan",
      "KR": "South Korea",
      "CN": "China",
      // Add more countries as needed
    };
    
    return countryNames[countryCode] || countryCode;
  }

  /**
   * Get all supported countries
   * @returns {array} Array of supported countries
   */
  getSupportedCountries() {
    return this.supportedCountries.map(country => ({
      code: country,
      name: this.getCountryName(country),
      callingCode: getCountryCallingCode(country)
    }));
  }

  /**
   * Format phone number for display
   * @param {string} phoneNumber - The phone number
   * @param {string} countryCode - The country code
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phoneNumber, countryCode = "US") {
    try {
      const validation = this.validatePhoneNumber(phoneNumber, countryCode);
      if (validation.isValid) {
        return validation.internationalNumber;
      }
      return phoneNumber;
    } catch (error) {
      return phoneNumber;
    }
  }

  /**
   * Extract country calling code from phone number
   * @param {string} phoneNumber - The phone number
   * @returns {string} Country calling code
   */
  extractCountryCallingCode(phoneNumber) {
    try {
      const validation = this.validatePhoneNumber(phoneNumber);
      if (validation.isValid) {
        return validation.countryCallingCode;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if phone number is mobile
   * @param {string} phoneNumber - The phone number
   * @param {string} countryCode - The country code
   * @returns {boolean} True if mobile
   */
  isMobileNumber(phoneNumber, countryCode = null) {
    try {
      const validation = this.validatePhoneNumber(phoneNumber, countryCode);
      return validation.isValid && validation.isMobile;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const phoneValidationService = new PhoneValidationService();

module.exports = phoneValidationService; 