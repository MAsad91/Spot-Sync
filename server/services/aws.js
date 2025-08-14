// AWS S3 Service - COMPLETELY DISABLED FOR CLOUDINARY ONLY
// import { S3 } from "aws-sdk"
// const { S3 } = require("aws-sdk");
const Moment = require("moment");

// Import Cloudinary service
const cloudinaryService = require("./cloudinary");

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

      // FORCE CLOUDINARY USAGE - AWS S3 IS DISABLED
      console.log("🔄 Redirecting to Cloudinary (AWS S3 is disabled)");
      return await cloudinaryService.uploadFile(file, ext, timeStamp);

      // AWS S3 CODE IS COMPLETELY DISABLED
      // To re-enable AWS S3, uncomment the code below and modify fileUpload.js
      /*
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: String(originalname),
        Body: file,
        ACL: "public-read",
        // ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // ContentDisposition: "inline",
        // CreateBucketConfiguration: {
        //   LocationConstraint: process.env.REGION,
        // },
      };

      let s3Response = await new S3({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_KEY_SECRET,
      })
        .upload(params)
        .promise();

      return { success: true, key: s3Response?.Key, url: s3Response?.Location };
      */
    } catch (e) {
      console.log("File upload error:", e);
      return { success: false, error: e?.message };
    }
  },

  // Use Cloudinary delete method
  async deleteFile(publicId) {
    return await cloudinaryService.deleteFile(publicId);
  },
};
