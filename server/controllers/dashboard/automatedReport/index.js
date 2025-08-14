const router = require("express").Router();
const auth = require("../../../middleware/auth");
const validate = require("../../../middleware/joiValidation");
const { automatedReportSchema } = require("../../../validations");
const createReport = require("../automatedReport/handlers/createReport");
const deleteReport = require("./handlers/deleteReport");
const getReport = require("./handlers/getReport");
const getReportsByPlaceId = require("./handlers/getReportsByPlaceId");

router.post("/create", auth, validate(automatedReportSchema), createReport);
router.get("/getReports", auth, getReport);
router.get("/get/:placeId", auth, getReportsByPlaceId);
router.put("/delete/:reportId", auth, deleteReport);

module.exports = router;
