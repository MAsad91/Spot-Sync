const router = require("express").Router();
const auth = require("../../../middleware/auth");
const validate = require("../../../middleware/joiValidation");
const { automatedValidationSchema } = require("../../../validations");
const createValidation = require("../automatedValidation/handlers/createValidation");
const deleteValidation = require("./handlers/deleteValidation");
const getValidation = require("./handlers/getValidation");
const getValidationsByPlaceId = require("./handlers/getValidationsByPlaceId");

router.post(
  "/create",
  auth,
  validate(automatedValidationSchema),
  createValidation
);
router.get("/getValidations", auth, getValidation);
router.get("/get/:placeId", auth, getValidationsByPlaceId);
router.put("/delete/:reportId", auth, deleteValidation);

module.exports = router;
