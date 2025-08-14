const router = require("express").Router();
const auth = require("../../../middleware/auth");
const getStatistics = require("./handlers/getStatistics");

router.get("/statistics/get", auth, getStatistics);

module.exports = router;
