const router = require("express").Router();
const auth = require("../../../middleware/auth");
const createPricingTier = require("./handlers/createPricingTier");
const getPricingTier = require("./handlers/getPricingTier");
const deletePricingTier = require("./handlers/deletePricingTier");
const updatePricingTier = require("./handlers/updatePricingTier");

router.post("/create", auth, createPricingTier);
router.get("/get/:placeId", auth, getPricingTier);
router.patch("/deletePricingTier", auth, deletePricingTier);
router.put("/update/:pricingId", auth, updatePricingTier);

module.exports = router;
