const router = require("express").Router();

const brand = require("./brand/index");
const receipt = require("./receipt/index");
const other = require("./other/index");
// const brandImageUpload = require("./handlers/brand/imageUpload");
// const brandCreate = require("./handlers/brand/createBrand");

// router.post("/brand/imageUpload", brandImageUpload);
// router.post("/brand/create", brandCreate);

router.use("/brand", brand);
router.use("/receipt", receipt);
router.use("/other", other);
module.exports = router;
