const QRCodes = require("../../../../models/qrCodes");

const {
  http400,
} = require("../../../../global/errors/httpCodes");

module.exports = async (req, res) => {
  let success = false;
  try {
    let { shortUrl } = req.params;
    shortUrl = process.env.BACKEND_DOMAIN + req.originalUrl
    const qrCodes = await QRCodes.findOne({
      shortUrl,
      status: { $ne: 0 },
    }).lean();
    if (!qrCodes) {
      return res.status(404).json({ message: 'Invalid QR code!' });
    }
    return res.redirect(qrCodes?.url);
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
