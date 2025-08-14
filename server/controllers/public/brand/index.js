const router = require("express").Router();

const brandImageUpload = require("./handlers/imageUpload");
const brandCreate = require("./handlers/createBrand");

router.post("/imageUpload", brandImageUpload);
router.post("/create", brandCreate);

module.exports = router;
