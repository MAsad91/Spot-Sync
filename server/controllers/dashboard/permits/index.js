const router = require("express").Router();
const auth = require("../../../middleware/auth");
const createPermit = require("./handlers/createPermit");
const deletePermit = require("./handlers/deletePermit");
const getPermitByPlaceId = require("./handlers/getPermitsByPlaceId");
const getPermitStatistics = require("./handlers/getPermitStatistics");
const updatePermit = require("./handlers/updatePermit");

router.post("/create", auth, createPermit);
router.post("/getpermit", auth, getPermitByPlaceId);
router.patch("/deletepermit/:permitId", auth, deletePermit);
router.get("/getpermitstatistics/:placeId", auth, getPermitStatistics);
router.put("/updatepermit", auth, updatePermit);
module.exports = router;
