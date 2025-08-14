const router = require("express").Router();
const customerAuth = require("../../middleware/auth");
const customerToken = require("./handlers/authentication/customerToken");
const {
  getCustomerInfo,
} = require("./handlers/authentication/getCustomerInfo");
const login = require("./handlers/authentication/login");
const otpResend = require("./handlers/authentication/otpResend");
const otpVerify = require("./handlers/authentication/otpVerify");
const addLicensePlate = require("./handlers/dashboard/addLicensePlate");
const cancelSubscription = require("./handlers/dashboard/cancelSubscription");
const deleteLicensePlate = require("./handlers/dashboard/deleteLicensePlate");
const getPaymentMethod = require("./handlers/dashboard/getPaymentMethod");
const getSubscriptionList = require("./handlers/dashboard/getSubscriptionList");
const updateLicensePlate = require("./handlers/dashboard/updateLicensePlate");
const updatePaymentMethod = require("./handlers/dashboard/updatePaymentMethod");
const getPaymentHistory = require("./handlers/paymentHistory/getPaymentHistory");

router.post("/login", login);
router.post("/token", customerToken);
router.post("/otpVerify", otpVerify);
router.post("/otpResend", otpResend);
router.get("/info", customerAuth, getCustomerInfo);
router.get("/subscriptions", customerAuth, getSubscriptionList);
router.post("/paymentMethod", customerAuth, getPaymentMethod);
router.post("/updatePaymentMethod", customerAuth, updatePaymentMethod);
router.put("/cancelSubscription/:subscriptionId", customerAuth, cancelSubscription);
router.put("/updateLicensePlate/:subscriptionId", customerAuth, updateLicensePlate);
router.get("/getPaymentHistory/:customerId", customerAuth, getPaymentHistory);
router.put("/addLicensePlate/:subscriptionId", customerAuth, addLicensePlate);
router.put("/deleteLicensePlate/:subscriptionId", customerAuth, deleteLicensePlate);

module.exports = router;
