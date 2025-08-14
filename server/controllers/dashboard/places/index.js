const router = require("express").Router();
const createPlace = require("./handlers/createPlace");
const getPlaceByPlaceId = require("./handlers/getPlaceByPlaceId");
const assignSettings = require("./handlers/assignSettings");
const getPlaces = require("./handlers/getPlaces");
const auth = require("../../../middleware/auth");
const updatePlace = require("./handlers/updatePlace");
const deletePlace = require("./handlers/deletePlace");
const validate = require("../../../middleware/joiValidation");
const { placeSchema } = require("../../../validations");

router.get("/get", auth, getPlaces);
router.get("/get/:placeId", auth, getPlaceByPlaceId);
router.post("/create", auth, validate(placeSchema), createPlace);
router.put("/setting/:placeId", auth, assignSettings);
router.put("/update/:placeId", auth, updatePlace);
router.patch("/deletePlace", auth, deletePlace);

module.exports = router;
