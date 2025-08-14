const router = require("express").Router();
const auth = require("../../../middleware/auth");

const createQrCode = require("./handlers/createQrCode");
const deleteQrCode = require("./handlers/deleteQrCode");
const getQrCodes = require("./handlers/getQrCodes");
const redirectQrCode = require("./handlers/redirectQrCode");
const updateRedirectionUrl = require("./handlers/updateRedirectionUrl");

router.post("/create", auth, createQrCode);
router.get("/get", auth, getQrCodes);
router.get("/redirect/:shortUrl", redirectQrCode);
router.patch("/update/url/:id", updateRedirectionUrl);
router.patch("/deleteQRCode", auth, deleteQrCode);
module.exports = router;
