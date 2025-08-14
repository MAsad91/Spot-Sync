const EventEmitter = require('events')
const event = new EventEmitter()

const sendNotification = require('../controllers/notification/handlers/sendNotification')

// event.on('notification', ({ brandName, brandLogo,userId, title, message,placeId }) => {
//   sendNotification({ brandName, brandLogo, userId, title, message,placeId })
// })

module.exports = event
