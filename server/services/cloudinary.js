const cloudinary = require("cloudinary").v2;
const Moment = require("moment");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = {
  async uploadFile(file, ext, timeStamp) {
    try {
      /**
       * DESTRUCTURE FILE NAME FROM FILE
       */
      if (!ext) ext = ".jpeg";
      const m = Moment();
      const ms =
        m.milliseconds() +
        1000 * (m.seconds() + 60 * (m.minutes() + 60 * m.hours()));
      let originalname = `new_spotSync/file-${ext}`;
      if(timeStamp) {
        originalname = `new_spotSync/file-${ms}-${ext}`;
      }

      /**
       * UPLOAD FILE TO CLOUDINARY
       */
      const uploadResponse = await cloudinary.uploader.upload(file.path, {
        folder: "SpotSync",
        public_id: originalname.replace(/\.[^/.]+$/, ""), // Remove extension for public_id
        resource_type: "auto",
        overwrite: true,
        invalidate: true,
      });

      /**
       * RETURN KEY: NAME, AND URL: LOCATION
       */
      return { 
        success: true, 
        key: uploadResponse.public_id, 
        url: uploadResponse.secure_url 
      };
    } catch (e) {
      console.log("Cloudinary upload error:", e);
      return { success: false, error: e?.message };
    }
  },

  async deleteFile(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { success: true, result };
    } catch (e) {
      console.log("Cloudinary delete error:", e);
      return { success: false, error: e?.message };
    }
  },
}; 