const { sendSimpleWhatsAppMessage } = require('./services/whatsapp');

/**
 * Simple test to verify WhatsApp integration
 */
async function testWhatsAppSimple() {
  console.log('🚀 Testing WhatsApp with your credentials...\n');

  const testNumber = '+923060934291'; // Your test number
  const testMessage = 'Hello from SpotSync! This is a test message from your Twilio account. 🚗';

  try {
    console.log('Sending test message...');
    const result = await sendSimpleWhatsAppMessage(testNumber, testMessage);
    
    if (result.success) {
      console.log('✅ WhatsApp message sent successfully!');
      console.log(`   Message SID: ${result.messageSid}`);
      console.log(`   Status: ${result.status}`);
      console.log('\n📱 Check your WhatsApp for the test message!');
    } else {
      console.log('❌ WhatsApp message failed:');
      console.log(`   Error: ${result.error}`);
      console.log(`   Code: ${result.code}`);
    }
  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(`   ${error.message}`);
  }
}

// Run the test
testWhatsAppSimple().catch(console.error); 