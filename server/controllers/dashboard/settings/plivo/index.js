const router = require('express').Router()
const getPlivos = require('./handlers/getPlivo')
const auth = require('../../../../middleware/auth')

router.get('/get', auth, getPlivos)

module.exports = router