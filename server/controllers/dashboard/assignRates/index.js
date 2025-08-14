const router = require("express").Router();
const auth = require("../../../middleware/auth");
const validate = require("../../../middleware/joiValidation");
const {
  assignRatesSchema,
  specialEventsSchema,
  blackoutDaysSchema,
  getByPlaceIdSchema,
} = require("../../../validations");
const assignRates = require("./handlers/assignRates");
const blackoutDayRates = require("./handlers/blackoutDayRates");
const deleteAssignRate = require("./handlers/deleteAssignRate");
const getAssignRatesByPlaceId = require("./handlers/getAssignRatesByPlaceId");
const getCalenderView = require("./handlers/getCalenderView");
const specialEventRates = require("./handlers/specialEventRates");
const getTableAssignRatesByPlaceId = require("./handlers/getTableAssignRatesByPlaceId")

router.post("/post", auth, validate(assignRatesSchema), assignRates);

router.post(
  "/postSpecialEvent",
  auth,
  validate(specialEventsSchema),
  specialEventRates
);

router.post(
  "/postBlackoutDay",
  auth,
  validate(blackoutDaysSchema),
  blackoutDayRates
);

router.get("/get/:placeId", auth, getAssignRatesByPlaceId);

router.get("/getRates/:placeId", auth, getTableAssignRatesByPlaceId)

router.get("/getCalenderData/:placeId", auth, getCalenderView);

router.patch("/delete", auth, deleteAssignRate);

module.exports = router;
