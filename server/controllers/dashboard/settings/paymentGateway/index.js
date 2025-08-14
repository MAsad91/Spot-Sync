const router = require("express").Router();
const auth = require("../../../../middleware/auth");

const getConnectAccounts = require("./handlers/getConnectAccounts");

router.get("/getConnectAccounts", auth, getConnectAccounts);

module.exports = router;
