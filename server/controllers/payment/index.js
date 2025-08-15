const createPaymentIntent = require("./handlers/createPaymentIntent");
const deletePaymentMethod = require("./handlers/deletePaymentMethod");
const createPaymentIntentACH = require("./handlers/createPaymentIntentACH");
const getPaymentMethodList = require("./handlers/getPaymentMethodList");
const getShortlyDetails = require("./handlers/getShortlyDetails");
const geParkingShortlyDetails = require("./handlers/parking/getShortlyDetails");
const refundPayment = require("./handlers/refundPayment");
const createParkingPaymentIntent = require("./handlers/parking/createPaymentIntent");
const generateClientSecretACH = require("./handlers/generateClientSecretACH");
// Pakistan Payment Gateway Handlers
const jazzCashPayment = require("./handlers/jazzCashPayment");
const easyPaisaPayment = require("./handlers/easyPaisaPayment");
const updateSubscriptionAfter3dSecure = require("./handlers/updateSubscriptionAfter3dSecure");
const cashPayment = require("./handlers/cashPayment");
const processReservationPayment = require("./handlers/processReservationPayment");
const router = require("express").Router();

router.get("/shortlyDetails/:shortlyId", getShortlyDetails);
router.get("/parking/shortlyDetails/:shortlyId", geParkingShortlyDetails);
router.get("/getCardDetails/:customerId", getPaymentMethodList);
router.post("/intent", createPaymentIntent);
router.post("/parking/intent", createParkingPaymentIntent);
router.post("/intentACH", createPaymentIntentACH);
router.post("/generateClientSecret", generateClientSecretACH);
router.patch("/paymentMethodDelete/:cardId", deletePaymentMethod);
router.post("/paymentRefund", refundPayment);
router.post("/updateSubscriptionAfter3dSecure", updateSubscriptionAfter3dSecure);
// Pakistan Payment Gateway Routes
router.post("/jazzcash", jazzCashPayment);
router.post("/easypaisa", easyPaisaPayment);
router.post("/cash", cashPayment);
router.post("/processReservationPayment", processReservationPayment);

module.exports = router;
