const router = require('express').Router()
const createDiscord = require('./handlers/createDiscord')
const getDiscord = require('./handlers/getDiscords')
const deleteDiscord = require('./handlers/deleteDiscord')
const auth = require('../../../../middleware/auth')
const updateDiscord = require('./handlers/updateDiscord')

router.post('/create', auth, createDiscord)

router.get('/get/:placeId', auth, getDiscord)

router.put('/update/:placeId', auth, updateDiscord)

router.patch('/deleteDiscord', auth, deleteDiscord)

module.exports = router