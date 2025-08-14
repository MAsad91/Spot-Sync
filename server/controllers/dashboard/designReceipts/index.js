const router = require("express").Router();
const auth = require("../../../middleware/auth");
const createReceipt = require("./handlers/createReceipt");

router.post("/create", auth, createReceipt);

module.exports = router;
