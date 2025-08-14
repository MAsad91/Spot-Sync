const cloudinary = require("cloudinary").v2;

// Cloudinary Configuration
const configureCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log("✅ Cloudinary configured successfully");
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'Not set'}`);
    console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'Not set'}`);
    
    return true;
  } catch (error) {
    console.error("❌ Cloudinary configuration failed:", error.message);
    return false;
  }
};

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Cloudinary connection test failed:", error.message);
    return false;
  }
};

// Get Cloudinary URL from environment
const getCloudinaryUrl = () => {
  return process.env.CLOUDINARY_URL || `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`;
};

module.exports = {
  configureCloudinary,
  testCloudinaryConnection,
  getCloudinaryUrl,
  cloudinary,
}; 