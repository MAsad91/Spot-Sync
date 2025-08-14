const ReceiptCollection = require("../../../../models/receipts");
const { http200, http400 } = require("../../../../global/errors/httpCodes");

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      params: { receiptNumber },
    } = req;
    console.log("receiptNumber ======>",receiptNumber)
    const receiptData = await ReceiptCollection.findOne({
      serialNumber: receiptNumber,
    });
    return res.status(http200).json({
      success: true,
      message: "Success",
      receiptData: receiptData || {},
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
