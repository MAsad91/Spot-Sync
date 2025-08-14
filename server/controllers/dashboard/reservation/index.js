const router = require("express").Router();
const auth = require("../../../middleware/auth");
const getReservationStatistics = require("./handlers/getReservationStatistics");
const getReservationsList = require("./handlers/getReservationsList");
const createReservation = require("./handlers/createReservation");
const getRatesByPlaceId = require("./handlers/getRatesByPlaceId");

router.post("/list", auth, getReservationsList);
router.get("/statistics/:placeId", auth, getReservationStatistics);
router.post("/create", auth, createReservation);
router.get("/rates/:placeId", auth, getRatesByPlaceId);

module.exports = router;
