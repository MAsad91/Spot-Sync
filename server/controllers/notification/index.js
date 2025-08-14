const router = require("express").Router();
const auth = require("../../middleware/auth");

const getNotification = require("./handlers/getNotification");
const updateNotification = require("./handlers/updateNotificationsStatus");
const clearAllNotification = require("./handlers/clearAllNotification");
const readNotification = require("./handlers/readNotification");
const deleteNotification = require("./handlers/deleteNotification");

router.get("/get", auth, getNotification);
router.patch("/readStatusupdate", auth, updateNotification);
router.patch("/clearAllNotification", auth, clearAllNotification);
router.patch("/readNotification", auth, readNotification);
router.patch("/delete", auth, deleteNotification);

module.exports = router;
