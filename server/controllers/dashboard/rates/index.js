const router = require('express').Router()
const auth = require('../../../middleware/auth')
const deleteRate = require('./handlers/deleteRate')
const createRate = require('./handlers/createRate')
const getRates = require('./handlers/getRates')
const updateRate = require('./handlers/updateRate')
const statusUpdate = require('./handlers/statusUpdate')
const getRatesByPlaceId = require('./handlers/getRatesByPlaceId')

router.get('/get', auth, getRates)
router.post('/create', auth, createRate)
router.patch('/deleteRate', auth, deleteRate)
router.patch('/statusUpdate', auth, statusUpdate)
router.put('/update/:rateId', auth, updateRate)
router.get('/getRates/:placeId', auth, getRatesByPlaceId)

module.exports = router