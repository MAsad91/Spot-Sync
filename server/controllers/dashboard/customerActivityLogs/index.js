const router = require("express").Router();
const auth = require("../../../middleware/auth");
const getUsersList = require("./handlers/getUsersList");
const get = require("./handlers/get");

router.get("/", auth, getUsersList);
router.get("/:customerActivityLogId", auth, get);

module.exports = router;
