const router = require("express").Router();
// const authRoutes = require("./auth");
const Plivos = require("./plivo/index");
const Slacks = require("./slack/index");

const PaymentGateway = require("./paymentGateway/index");

const discord = require("./discord/index")

router.use("/plivos", Plivos);

router.use("/slacks", Slacks);

router.use("/discord", discord);



router.use("/paymentGateway", PaymentGateway);



module.exports = router;
