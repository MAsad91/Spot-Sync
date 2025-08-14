const router = require("express").Router();
const auth = require("../../../middleware/auth");
const deleteValidation = require("./handlers/deleteValidation");
const createValidation = require("./handlers/createValidation");
const getValidationByPlaceId = require("./handlers/getValidationByPlaceId");
const getAllValidation = require("./handlers/getAllValidation");

router.get("/getValidations/:placeId", auth, getValidationByPlaceId);
router.post("/create", auth, createValidation);
router.patch("/deleteValidation", auth, deleteValidation);
router.get("/getValidations", auth, getAllValidation);

module.exports = router;
