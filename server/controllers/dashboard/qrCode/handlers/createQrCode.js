const QRCode = require("../../../../models/qrCodes");
const {
  http200,
  http400,
  http401,
} = require("../../../../global/errors/httpCodes");
const { isValidObjectId } = require("mongoose");
const { uploadFile } = require("../../../../services/fileUpload");
const path = require("path");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { body, userId } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http401).json({
        success,
        message: "Invalid Token",
      });
    if (!body?.file) {
      return res.status(http400).json({
        success,
        message: "QR Code file required!",
      });
    }
    // Assuming uploadFile function uploads the file to a cloud storage bucket
    const fileData = await uploadFile(
      req.body?.file,
      path?.extname(req?.body?.file?.path),
      true
    );
    if (fileData?.success) {
      body["qrCodeImage"] = fileData?.url;
    }
    body["creatorId"] = userId;
    const createQRCode = await QRCode.create(body);
    if (!createQRCode)
      return res.status(http400).json({
        success,
        message: "Something went wrong!",
      });
    return res.status(http200).json({
      success: true,
      message: "Barcode created successfully!",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(http400).json({
      success,
      message: error.message || "Something went wrong!",
    });
  }
};
