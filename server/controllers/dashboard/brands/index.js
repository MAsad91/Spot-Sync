const router = require("express").Router();
const createBrand = require("./handlers/createBrand");
const getBrands = require("./handlers/getBrands");
const deleteBrand = require("./handlers/deleteBrand");
const auth = require("../../../middleware/auth");
const { brandSchema } = require("../../../validations");
const validate = require("../../../middleware/joiValidation");
const updateBrandReceiptColor = require("./handlers/updateBrandReceiptColor"); 
const updateBrandDefaultSettings = require("./handlers/updateBrandDefaultSettings");

router.post("/create", auth, createBrand);
router.get("/get", auth, getBrands);
router.patch("/delete", auth, deleteBrand);
router.put("/updateReceiptColor/:brandId", auth, updateBrandReceiptColor);
router.post("/updateDefault", auth, updateBrandDefaultSettings);


module.exports = router;
