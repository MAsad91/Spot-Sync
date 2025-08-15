const crypto = require('crypto');
const axios = require('axios');
const { get } = require('lodash');

class EasyPaisa {
  constructor(place = null) {
    this.merchantId = process.env.EASY_PAISA_MERCHANT_ID;
    this.password = process.env.EASY_PAISA_PASSWORD;
    this.returnUrl = process.env.EASY_PAISA_RETURN_URL;
    this.currency = "PKR";
    this.language = "EN";
    this.apiUrl = process.env.EASY_PAISA_API_URL || "https://easypay.easypaisa.com.pk/easypay/Index.jsf";

    // Override with place-specific settings if provided
    if (place && place.easyPaisaSettings) {
      this.merchantId = place.easyPaisaSettings.merchantId || this.merchantId;
      this.password = place.easyPaisaSettings.password || this.password;
      this.returnUrl = place.easyPaisaSettings.returnUrl || this.returnUrl;
      this.currency = place.easyPaisaSettings.currency || this.currency;
      this.language = place.easyPaisaSettings.language || this.language;
      this.apiUrl = place.easyPaisaSettings.apiUrl || this.apiUrl;
    }
  }

  // Generate EasyPaisa hash
  generateHash(data) {
    const hashString = `${this.merchantId}&${data.pp_Amount}&${data.pp_BillReference}&${data.pp_Description}&${data.pp_Language}&${data.pp_MerchantID}&${data.pp_Password}&${data.pp_ProductCategory}&${data.pp_PurchaseDateTime}&${data.pp_ReturnURL}&${data.pp_TxnCurrency}&${data.pp_TxnDateTime}&${data.pp_TxnExpiryDateTime}&${data.pp_TxnRefNo}&${data.pp_Version}`;
    return crypto.createHash('sha256').update(hashString).digest('hex');
  }

  // Create payment request
  async createPaymentRequest(paymentData) {
    try {
      const {
        amount,
        billReference,
        description,
        customerEmail,
        customerMobile,
        txnRefNo,
        returnUrl
      } = paymentData;

      const currentDate = new Date();
      const purchaseDateTime = currentDate.toISOString().replace(/[-:]/g, '').split('.')[0];
      const txnDateTime = currentDate.toISOString().replace(/[-:]/g, '').split('.')[0];
      const txnExpiryDateTime = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0];

      const requestData = {
        pp_Version: "1.1",
        pp_TxnType: "MWALLET",
        pp_Language: this.language,
        pp_MerchantID: this.merchantId,
        pp_Password: this.password,
        pp_TxnRefNo: txnRefNo,
        pp_Amount: amount * 100, // Convert to smallest currency unit (paisa)
        pp_TxnCurrency: this.currency,
        pp_TxnDateTime: txnDateTime,
        pp_BillReference: billReference,
        pp_Description: description,
        pp_TxnExpiryDateTime: txnExpiryDateTime,
        pp_ReturnURL: returnUrl || this.returnUrl,
        pp_SecureHash: "",
        ppmpf_1: customerEmail,
        ppmpf_2: customerMobile,
        ppmpf_3: "2", // 2 for EasyPaisa
        ppmpf_4: "",
        ppmpf_5: ""
      };

      // Generate secure hash
      requestData.pp_SecureHash = this.generateHash(requestData);

      // Make API request
      const response = await axios.post(this.apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return {
        success: true,
        data: response.data,
        requestData: requestData
      };

    } catch (error) {
      console.error('EasyPaisa payment request error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create EasyPaisa payment request',
        error: error
      };
    }
  }

  // Verify payment response
  verifyPaymentResponse(responseData) {
    try {
      const {
        pp_ResponseCode,
        pp_ResponseMessage,
        pp_TxnRefNo,
        pp_Amount,
        pp_SecureHash,
        pp_TxnCurrency,
        pp_TxnDateTime,
        pp_BillReference,
        pp_Description
      } = responseData;

      // Verify hash
      const expectedHash = this.generateHash(responseData);
      const isHashValid = pp_SecureHash === expectedHash;

      // Check response code (0000 = success)
      const isSuccess = pp_ResponseCode === "0000";

      return {
        success: isSuccess && isHashValid,
        responseCode: pp_ResponseCode,
        responseMessage: pp_ResponseMessage,
        transactionId: pp_TxnRefNo,
        amount: pp_Amount / 100, // Convert back from paisa
        currency: pp_TxnCurrency,
        billReference: pp_BillReference,
        description: pp_Description,
        isHashValid: isHashValid,
        rawResponse: responseData
      };

    } catch (error) {
      console.error('EasyPaisa payment verification error:', error);
      return {
        success: false,
        message: 'Failed to verify EasyPaisa payment response',
        error: error
      };
    }
  }

  // Get customer profile (if supported by EasyPaisa)
  async getCustomerProfile(customer) {
    try {
      // EasyPaisa doesn't have customer profiles like Stripe
      // This method is kept for consistency with other payment gateways
      return {
        success: true,
        data: {
          customerId: customer._id.toString(),
          paymentMethods: []
        }
      };
    } catch (error) {
      console.error('EasyPaisa get customer profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get customer profile',
        error: error
      };
    }
  }

  // Charge customer (for subscriptions)
  async chargeCustomer(customer, amount, description = "Subscription payment") {
    try {
      const txnRefNo = `EP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentData = {
        amount: amount,
        billReference: `SUB_${customer._id}`,
        description: description,
        customerEmail: customer.email,
        customerMobile: customer.mobile,
        txnRefNo: txnRefNo,
        returnUrl: `${process.env.FRONT_DOMAIN}payment/easypaisa/callback`
      };

      const result = await this.createPaymentRequest(paymentData);
      
      if (result.success) {
        return {
          success: true,
          data: {
            id: txnRefNo,
            status: 'requires_payment_method',
            client_secret: null,
            payment_intent: {
              id: txnRefNo,
              status: 'requires_payment_method'
            }
          },
          paymentUrl: result.data.pp_RedirectURL || result.data.redirect_url,
          transactionId: txnRefNo
        };
      }

      return result;

    } catch (error) {
      console.error('EasyPaisa charge customer error:', error);
      return {
        success: false,
        message: error.message || 'Failed to charge customer',
        error: error
      };
    }
  }
}

module.exports = EasyPaisa; 