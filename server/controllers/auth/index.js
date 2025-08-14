const router = require("express").Router();
const loginApi = require("./handlers/login");
const auth = require("../../middleware/auth");
const { loginSchema } = require("../../validations/index");
// const meData = require("../users/handlers/meData");
// const auth = require("../middleware/auth");

///////////////////////
// const Joi = require("joi");

// const Joi = require("joi");
const validate = require("../../middleware/joiValidation");

// const loginSchema = Joi.object({
//   email: Joi.string().email().required(),
//   password: Joi.string().required(),
// });

router.post("/login", validate(loginSchema), loginApi.login);
router.post("/token", loginApi.userToken);
// router.get("/me", meData.getUserInfo);

module.exports = router;
