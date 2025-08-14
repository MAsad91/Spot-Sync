const router = require("express").Router();
const auth = require("../../../middleware/auth");

const getEnforcementsByPlaceId = require("./handlers/getEnforcementsByPlaceId");

router.post("/getEnforcements", auth, getEnforcementsByPlaceId);

module.exports = router;
