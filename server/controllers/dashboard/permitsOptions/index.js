const router = require("express").Router();
const auth = require("../../../middleware/auth");
const createPermitsOption = require("./handlers/createPermitsOption");
const getPermitsOptions = require("./handlers/getPermitsOptions");
const updatePermitsOption = require("./handlers/updatePermitsOption");

router.post("/create", auth, createPermitsOption);
router.post("/get", auth, getPermitsOptions);
router.put("/update", auth, updatePermitsOption);
module.exports = router;
