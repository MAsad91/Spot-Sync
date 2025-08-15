const { 
  sendWhatsAppMessage, 
  sendSimpleWhatsAppMessage, 
  sendReservationConfirmationWhatsApp,
  validateWhatsAppNumber,
  formatWhatsAppNumber 
} = require('./services/whatsapp');

/**
 * Test WhatsApp functionality
 */
async function testWhatsApp() {
  console.log('🚀 Testing WhatsApp Service...\n');

  // Test 1: Validate phone number
  console.log('1. Testing phone number validation:');
  const testNumber = '+923060934291';
  const isValid = validateWhatsAppNumber(testNumber);
  const formatted = formatWhatsAppNumber(testNumber);
  console.log(`   Number: ${testNumber}`);
  console.log(`   Valid: ${isValid}`);
  console.log(`   Formatted: ${formatted}\n`);

  // Test 2: Send simple text message
  console.log('2. Testing simple text message:');
  try {
    const simpleResult = await sendSimpleWhatsAppMessage(
      testNumber, 
      'Hello from SpotSync! This is a test message. 🚗'
    );
    console.log(`   Success: ${simpleResult.success}`);
    if (simpleResult.success) {
      console.log(`   Message SID: ${simpleResult.messageSid}`);
      console.log(`   Status: ${simpleResult.status}`);
    } else {
      console.log(`   Error: ${simpleResult.error}`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test 3: Send template message
  console.log('3. Testing template message:');
  try {
    const templateResult = await sendWhatsAppMessage(
      testNumber,
      {
        "1": "LSRO-001",
        "2": "12/01/2024",
        "3": "3:00 PM",
        "4": "₨500.00",
        "5": "ABC123"
      }
    );
    console.log(`   Success: ${templateResult.success}`);
    if (templateResult.success) {
      console.log(`   Message SID: ${templateResult.messageSid}`);
      console.log(`   Status: ${templateResult.status}`);
    } else {
      console.log(`   Error: ${templateResult.error}`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test 4: Send reservation confirmation
  console.log('4. Testing reservation confirmation:');
  try {
    const reservationData = {
      licensePlate: 'ABC-123',
      startDate: '12/01/2024 2:00 PM',
      endDate: '12/01/2024 3:00 PM',
      totalAmount: 50000, // in cents
      validationCode: 'ABC123',
      receiptURL: 'https://receipt.example.com/123'
    };
    
    const reservationResult = await sendReservationConfirmationWhatsApp(
      testNumber, 
      reservationData
    );
    console.log(`   Success: ${reservationResult.success}`);
    if (reservationResult.success) {
      console.log(`   Message SID: ${reservationResult.messageSid}`);
      console.log(`   Status: ${reservationResult.status}`);
    } else {
      console.log(`   Error: ${reservationResult.error}`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  console.log('✅ WhatsApp testing completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWhatsApp().catch(console.error);
}

module.exports = { testWhatsApp }; 