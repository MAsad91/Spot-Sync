const router = require("express").Router();

const addTransactionDate = require("./handlers/addTransactionDate");
const commonTest = require("./handlers/commonTest");
const createProductionSubscriptions = require("./handlers/createProductionSubscriptions");
const createSubscriptionBulk = require("./handlers/createSubscriptionBulk");

const getPaymentIntents = require("./handlers/getPaymentIntents");
const invoiceCreate = require("./handlers/invoiceCreate");
const createPAymentReceipt = require("./handlers/createPaymentReceipt");
const modifyPayments = require("./handlers/modifyPayments");
const renewACHSubscription = require("./handlers/renewACHSubscription");
const renewCardSubscription = require("./handlers/renewCardSubscription");
const sendExtendReminder = require("./handlers/sendExtendReminder");
const sendUpcomingSubscriptionEmailReminder = require("./handlers/sendUpcomingSubscriptionEmailReminder");
const sendValidationReminder = require("./handlers/sendValidationReminder");

const test = require("./handlers/test");
const updateSubscriptionWhichCharged = require("./handlers/updateSubscriptionWhichCharged");
const ChargeCustomer = require("./handlers/chargeCustomer");
const RenewAllSubscriptions = require("./handlers/subscriptionRenew/renewSubscription");
const SendUpcomingRenewalEmail = require("./handlers/subscriptionRenew/upcomingRenewalEmail");
const SendEmailConfirmation = require("./handlers/subscriptionRenew/sendEmailConfirmation");
const SendSMSConfirmation = require("./handlers/subscriptionRenew/sendSMSConfirmation");
const UpdateSlack = require("./handlers/subscriptionRenew/updateSlack");

const testFileUpload = require("./handlers/testFileUpload");
const testPhoneValidation = require("./handlers/testPhoneValidation");
const testStatistics = require("./handlers/testStatistics");
const testRandomStats = require("./handlers/testRandomStats");

const activeSubscriptionWithoutPayment = require("./handlers/activeSubscriptionWithoutPayment");
const SyncData = require("./handlers/syncData");


router.post("/activeSubscription", activeSubscriptionWithoutPayment);
router.post("/test", test);
router.post("/updatePayment", modifyPayments);
router.post("/subscriptionGroupedBy", commonTest);
router.post("/createSubscriptionBulk", createSubscriptionBulk);
router.post("/invoice", invoiceCreate);
router.post("/receipt", createPAymentReceipt);
router.post("/createProductionSubscription", createProductionSubscriptions);
router.post("/sendReminderEmail", sendUpcomingSubscriptionEmailReminder);
router.post("/sendExtendReminder", sendExtendReminder);
router.post("/renewCardSubscription", renewCardSubscription);
router.post("/renewACHSubscription", renewACHSubscription);
router.post("/update", updateSubscriptionWhichCharged);
router.post("/paymentIntents", getPaymentIntents);

router.post("/sendValidationReminder", sendValidationReminder);
router.post("/addTransactionDataToPayments", addTransactionDate);

router.post("/chargeCustomer", ChargeCustomer);

router.post("/subscription/sendUpcomingRenewalEmail", SendUpcomingRenewalEmail);
router.post("/subscription/renewAllSubscription", RenewAllSubscriptions);
router.post("/subscription/sendEmailConfirmation", SendEmailConfirmation);
router.post("/subscription/sendSMSConfirmation", SendSMSConfirmation);
router.post("/subscription/updateSlack", UpdateSlack);
router.post("/syncData", SyncData);
router.post("/testFileUpload", testFileUpload);
router.post("/testPhoneValidation", testPhoneValidation);
router.get("/testStatistics", testStatistics);
router.get("/testRandomStats", testRandomStats);


module.exports = router;
