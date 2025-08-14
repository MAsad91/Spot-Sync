const router = require('express').Router()
const createSlack = require('./handlers/createSlack')
const getSlack = require('./handlers/getSlacks')
const deleteSlack = require('./handlers/deleteSlack')
const auth = require('../../../../middleware/auth')
const updateSlack = require('./handlers/updateSlack')

router.post('/create', auth, createSlack)

router.get('/get/:placeId', auth, getSlack)

router.put('/update/:placeId', auth, updateSlack)

router.patch('/deleteSlack', auth, deleteSlack)

module.exports = router