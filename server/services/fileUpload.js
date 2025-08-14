const Moment = require("moment");

// Import both services
const awsService = require("./aws");
const cloudinaryService = require("./cloudinary");

// Force Cloudinary usage - AWS S3 is commented out
const getUploadService = () => {
  // Check if Cloudinary credentials are available
  if (process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET) {
    console.log("✅ Using Cloudinary for file uploads");
    return cloudinaryService;
  }
  
  // AWS S3 FALLBACK IS DISABLED - ONLY CLOUDINARY IS SUPPORTED
  console.error("❌ Cloudinary credentials not found!");
  console.error("   Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET");
  console.error("   AWS S3 fallback is disabled");
  
  throw new Error("Cloudinary credentials are required. AWS S3 fallback is disabled.");
};

module.exports = {
  async uploadFile(file, ext, timeStamp) {
    try {
      const uploadService = getUploadService();
      return await uploadService.uploadFile(file, ext, timeStamp);
    } catch (e) {
      console.log("File upload error:", e);
      return { success: false, error: e?.message };
    }
  },

  async deleteFile(publicId) {
    try {
      const uploadService = getUploadService();
      return await uploadService.deleteFile(publicId);
    } catch (e) {
      console.log("File delete error:", e);
      return { success: false, error: e?.message };
    }
  },

  // Helper method to get current service info
  getCurrentService() {
    try {
      const service = getUploadService();
      return service === cloudinaryService ? 'cloudinary' : 'aws';
    } catch (error) {
      return 'cloudinary'; // Default to cloudinary even if not configured
    }
  }
}; 