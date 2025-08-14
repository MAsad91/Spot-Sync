const QRCodes = require("../../../../models/qrCodes");

const {
  http400,
} = require("../../../../global/errors/httpCodes");

module.exports = async (req, res) => {
  let success = false;
  try {
    // console.log(req.body, "<<<body")
    const { id } = req.params;
    const { url } = req.body
    const qrCodes = await QRCodes.findByIdAndUpdate(id, {
      $set: {
        url
      }
    }).lean();
    // console.log(qrCodes, "<<<qrCodes")
    if (!qrCodes) {
      return res.status(404).json({ message: 'Invalid QR code!' });
    }
    return res.status(200).json({
      success: true,
      message: "QR updated"
    })
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
