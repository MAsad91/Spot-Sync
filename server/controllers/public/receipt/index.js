const router = require("express").Router();

const getReceiptData = require("./handlers/getReceiptData");

router.get("/receiptData:receiptNumber", getReceiptData);

module.exports = router;
