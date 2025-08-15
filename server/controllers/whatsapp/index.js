const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { sendWhatsAppMessage, sendSimpleWhatsAppMessage, validateWhatsAppNumber, formatWhatsAppNumber } = require('../../services/whatsapp');

/**
 * Send WhatsApp message using template
 * POST /api/whatsapp/send-template
 */
router.post('/send-template', auth, async (req, res) => {
  try {
    const { to, contentVariables, contentSid } = req.body;

    // Validate required fields
    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient phone number is required'
      });
    }

    // Validate phone number format
    if (!validateWhatsAppNumber(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please use international format (e.g., +923060934291)'
      });
    }

    // Format phone number
    const formattedNumber = formatWhatsAppNumber(to);

    // Send WhatsApp message
    const result = await sendWhatsAppMessage(formattedNumber, contentVariables, contentSid);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'WhatsApp message sent successfully',
        data: {
          messageSid: result.messageSid,
          status: result.status
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send WhatsApp message',
        error: result.error
      });
    }

  } catch (error) {
    console.error('WhatsApp send template error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Send simple WhatsApp text message
 * POST /api/whatsapp/send-text
 */
router.post('/send-text', auth, async (req, res) => {
  try {
    const { to, message } = req.body;

    // Validate required fields
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient phone number and message are required'
      });
    }

    // Validate phone number format
    if (!validateWhatsAppNumber(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please use international format (e.g., +923060934291)'
      });
    }

    // Format phone number
    const formattedNumber = formatWhatsAppNumber(to);

    // Send WhatsApp message
    const result = await sendSimpleWhatsAppMessage(formattedNumber, message);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'WhatsApp message sent successfully',
        data: {
          messageSid: result.messageSid,
          status: result.status
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send WhatsApp message',
        error: result.error
      });
    }

  } catch (error) {
    console.error('WhatsApp send text error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Test WhatsApp connection
 * GET /api/whatsapp/test
 */
router.get('/test', auth, async (req, res) => {
  try {
    const testNumber = '+923060934291'; // Your test number
    const testMessage = 'This is a test message from SpotSync WhatsApp service.';

    const result = await sendSimpleWhatsAppMessage(testNumber, testMessage);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'WhatsApp service is working correctly',
        data: {
          messageSid: result.messageSid,
          status: result.status
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'WhatsApp service test failed',
        error: result.error
      });
    }

  } catch (error) {
    console.error('WhatsApp test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Validate WhatsApp number format
 * POST /api/whatsapp/validate-number
 */
router.post('/validate-number', auth, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const isValid = validateWhatsAppNumber(phoneNumber);
    const formatted = isValid ? formatWhatsAppNumber(phoneNumber) : null;

    return res.status(200).json({
      success: true,
      data: {
        isValid,
        formatted,
        original: phoneNumber
      }
    });

  } catch (error) {
    console.error('WhatsApp validate number error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 