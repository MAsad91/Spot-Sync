const router = require("express").Router();
const auth = require("../../../middleware/auth");
const bulkSubscription = require("./handlers/bulkSubscription");
const createSubscription = require("./handlers/createSubscription");
const declineLicensePlateUpdates = require("./handlers/declineLicensePlateUpdates");
const deleteSubscription = require("./handlers/deleteSubscription");
const editLicensePlate = require("./handlers/editLicensePlate");
const getRawSubscriptions = require("./handlers/getRawSubscriptions");
const getSubscriptionByPlaceId = require("./handlers/getSubscriptionByPlaceId");
const getSubscriptionDetail = require("./handlers/getSubscriptionDetail");
const getSubscriptionPaymentLogs = require("./handlers/getSubscriptionPaymentLogs");
const getSubscriptionServiceFee = require("./handlers/getSubscriptionServiceFee");
const getSubscriptionStatistics = require("./handlers/getSubscriptionStatistics");
const renewSubscription = require("./handlers/renewSubscription");
const sendPaymentLink = require("./handlers/sendPaymentLink");
const sendReminderEmail = require("./handlers/sendReminderEmail");
const updateLicensePlate = require("./handlers/updateLicensePlate");
const getSubcriptionSummaries = require("./handlers/getSubcriptionSummaries");
const updateSubscriptionPauseStatus = require("./handlers/updateSubscriptionPauseStatus")

router.post("/create", auth, createSubscription);
router.get("/getSubscriptions/:placeId", auth, getSubscriptionByPlaceId);
router.post("/bulkSubscriptions", auth, bulkSubscription);
router.get("/rawSubscriptions/:placeId", auth, getRawSubscriptions);
router.get(
  "/getSubscriptionServiceFee/:placeId",
  auth,
  getSubscriptionServiceFee
);
router.patch("/deleteSubscription/:subscriptionId", auth, deleteSubscription);
router.get(
  "/getSubscriptionStatistics/:placeId",
  auth,
  getSubscriptionStatistics
);
router.get(
  "/getSubscriptionPaymentLogs/:subscriptionId",
  auth,
  getSubscriptionPaymentLogs
);
router.get("/detail/:subscriptionId", auth, getSubscriptionDetail);
router.patch("/renewSubscription/:subscriptionId", auth, renewSubscription);
router.post("/sendReminderEmail", auth, sendReminderEmail);
router.put("/updateLicensePlate/:subscriptionId", auth, updateLicensePlate);
router.put("/editLicensePlate/:subscriptionId", auth, editLicensePlate);
router.put(
  "/declineUpdateLicensePlate/:subscriptionId",
  auth,
  declineLicensePlateUpdates
);
router.patch("/sendPaymentLinkEmail/:subscriptionId", auth, sendPaymentLink);


router.get("/getSubscriptionsSummaries/:placeId", auth, getSubcriptionSummaries);
router.post("/updateSubscriptionPauseStatus", auth, updateSubscriptionPauseStatus)



module.exports = router;
