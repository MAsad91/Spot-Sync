const { http200, http400 } = require("../../../global/errors/httpCodes");
const { uploadFile, getCurrentService } = require("../../../services/fileUpload");
const path = require("path");

module.exports = async (req, res) => {
  try {
    const { file } = req.body;
    
    if (!file) {
      return res.status(http400).json({
        success: false,
        message: "No file provided",
      });
    }

    console.log("Testing file upload...");
    console.log("File:", file);
    console.log("Current service:", getCurrentService());

    const fileData = await uploadFile(
      file,
      path?.extname(file?.path),
      true
    );

    if (fileData?.success) {
      return res.status(http200).json({
        success: true,
        message: "File uploaded successfully!",
        data: {
          url: fileData.url,
          key: fileData.key,
          service: getCurrentService(),
        },
      });
    } else {
      return res.status(http400).json({
        success: false,
        message: "File upload failed",
        error: fileData?.error,
      });
    }
  } catch (error) {
    console.error("File upload test error:", error);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
}; 