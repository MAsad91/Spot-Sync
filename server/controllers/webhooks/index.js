const router = require("express").Router();
const ACHPayment = require("./ACH-Payment/index");
const Stripe = require("./stripe/index")

router.post("/ACH", ACHPayment);
router.use("/stripe", Stripe);

module.exports = router;
