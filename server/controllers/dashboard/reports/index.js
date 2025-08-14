const router = require("express").Router();
const auth = require("../../../middleware/auth");
const reservationReport = require("./handlers/reservationReport");
const subscriptionReport = require("./handlers/subscriptionReport");

const transactionReport = require("./handlers/transactionReport");
const revenueSummary = require("./handlers/revenueSummary")
const depositReport = require('./handlers/depositReport');

router.post("/getTransactionReport", auth, transactionReport);
router.post("/getReservationReport", auth, reservationReport);
router.post("/getSubscriptionReport", auth, subscriptionReport);
router.post("/getRevenueSummary", auth, revenueSummary)
router.post("/getDepositReport", auth, depositReport)
module.exports = router;
