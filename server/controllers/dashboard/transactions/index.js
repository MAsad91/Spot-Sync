const router = require("express").Router();
const auth = require("../../../middleware/auth");

const getTransactionsByPlaceId = require("./handlers/getTransactionsByPlaceId");

router.post("/getTransactions", auth, getTransactionsByPlaceId);

module.exports = router;
