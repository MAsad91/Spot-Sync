const router = require("express").Router();
const ConnectedAccount = require("./Connect-Account/index")

router.use("/connect", ConnectedAccount)

module.exports = router;
