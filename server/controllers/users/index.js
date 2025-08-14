const router = require("express").Router();
const createApi = require("./handlers/create");
const getApi = require("./handlers/get");
const getUsersApi = require("./handlers/getUsers");
const getExportUserApi = require("./handlers/getExportUsers")
const passwordResetAPI = require("./handlers/passwordReset");
const deleteUserAPI = require("./handlers/deleteUser");
const statusUpdateAPI = require("./handlers/statusUpdate");
const updateUserAPI = require("./handlers/update");
const auth = require("../../middleware/auth"); 
const { getMeInfo } = require("./handlers/meData");
// const auth = require("../middleware/auth");

///////////////////////
// const Joi = require("joi");

router.post("/create", auth, createApi.xcreate);
router.get("/get", auth, getApi.getUserInfo);
router.get("/getUsers", auth, getUsersApi.getUsers);
router.get("/getExportUsers", auth, getExportUserApi.getExportUsers);
router.post("/passwordReset", auth, passwordResetAPI.passwordReset);
router.patch("/deleteUser", auth, deleteUserAPI);
router.patch("/statusUpdate", auth, statusUpdateAPI);
router.put("/updateUser", auth, updateUserAPI);
router.get("/me", auth, getMeInfo);
module.exports = router;
