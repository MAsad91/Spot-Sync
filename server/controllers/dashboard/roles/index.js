const router = require('express').Router()
const createRole = require('./handlers/createRole')
const getRoles = require('./handlers/getRoles')
const auth = require('../../../middleware/auth')
const getRoleById = require('./handlers/getRoleById')
const deleteRole = require('./handlers/deleteRole')
const statusUpdateAPI = require('./handlers/statusUpdate')
const updateRole = require("./handlers/updateRole")

router.post('/create', auth, createRole)
router.get('/get', auth, getRoles)
router.get('/get/one', auth, getRoleById)
router.patch('/deleteRole', auth, deleteRole)
router.patch('/statusUpdate', auth, statusUpdateAPI)
router.patch('/update', updateRole)

module.exports = router