const router = require("express").Router();
const authRoutes = require("./auth");
const Users = require("./users");
const Roles = require("./dashboard/roles");
const Brands = require("./dashboard/brands");
const Places = require("./dashboard/places");
const Rates = require("./dashboard/rates");
const pricingTier = require("./dashboard/pricingTier");
const Settings = require("./dashboard/settings");
const validations = require("./dashboard/validations");
const AssignRates = require("./dashboard/assignRates");
const automatedReport = require("./dashboard/automatedReport");
const automatedValidation = require("./dashboard/automatedValidation");
const subscriptions = require("./dashboard/subscriptions");
const transactions = require("./dashboard/transactions");
const enforcements = require("./dashboard/enforcements");
const reservations = require("./dashboard/reservation");
const designReceipts = require("./dashboard/designReceipts");
const qrCode = require("./dashboard/qrCode");
const notification = require("./notification/index");
const payment = require("./payment/index");
const test = require("./test/index");
const customer = require("./customer/index");

const dashboard = require("./dashboard/homePage/index");
const webhook = require("./webhooks/index");

const statistics = require("./dashboard/statistics");
const public = require("./public/index");
const report = require("./dashboard/reports");
const permit = require("./dashboard/permits");
const permitsOptions = require("./dashboard/permitsOptions");
const customerActivityLogs = require("./dashboard/customerActivityLogs");
router.get("/health", (req, res) => {
  res.json({ status: "alive" });
});

// Routes for authentication
router.use("/auth", authRoutes);
router.use("/users", Users);
router.use("/roles", Roles);

// Routes for brands
router.use("/brands", Brands);

//Routes for places
router.use("/places", Places);

// Routes for customerActivityLogs
router.use("/places/:placeId/customerActivityLogs", customerActivityLogs);

// Routes for rates
router.use("/rates", Rates);

// Routes for pricingTier
router.use("/pricingTier", pricingTier);

router.use("/validations", validations);

router.use("/settings", Settings);

router.use("/assign", AssignRates);

// Automated Report
router.use("/automatedReports", automatedReport);

router.use("/automatedValidations", automatedValidation);

router.use("/subscriptions", subscriptions);

router.use("/transactions", transactions);

router.use("/enforcements", enforcements);

router.use("/reservations", reservations);

router.use("/designReceipt", designReceipts);

router.use("/qrCode", qrCode);

router.use("/notification", notification);

router.use("/payment", payment);

router.use("/test", test);

router.use("/customer", customer);

router.use("/dashboard", dashboard);

router.use("/webhook", webhook);



router.use("/statistics", statistics);

router.use("/public", public);

router.use("/report", report);

router.use("/permit", permit);

router.use("/permitsOptions", permitsOptions);

// Routes for Reconciliation
// router.use("/reconciliation", Reconciliation);
// router.use("/entity", Entity);
// router.use("/role", Role);
// router.use("/location", Locations);
// router.use("/report", Reports);
// router.use("/liveReport", LiveReport);
// router.use("/history", History);
// router.use("/api", Vendors);

// If no API routes are hit, send the React app
// router.use("*", (req, res) =>
//   res.sendFile(path.join(__dirname, "../client/build/index.html"))
// );

module.exports = router;
