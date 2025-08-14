const UserNotification = require('../../../models/userNotifications')
const {
  http200,
  http400,
  http403
} = require('../../../global/errors/httpCodes')
const { NOTIFICATION_READSTATUS } = require('../../../constants')
const {
  Types: { ObjectId },
  isValidObjectId
} = require('mongoose')

const event = require('../../../services/emitter')

module.exports = async (req, res) => {
  let success = false
  try {
    const { userId } = req
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: 'Invalid Token'
      })

    const updateNotificationStatus = await UserNotification.updateMany(
      { userId: ObjectId(userId), status: NOTIFICATION_READSTATUS.UNSEEN },
      { $set: { status: NOTIFICATION_READSTATUS.SEEN  } }
    )

    if (updateNotificationStatus.nModified > 0) {
      // event.emit('get_notification')
      return res.status(http200).json({
        success: true,
        message: 'Notifications marked as read successfully.'
      })
    } else {
      console.log('No notifications found to update.')
      return res.status(http200).json({
        success: true,
        message: 'No notifications needed update.'
      })
    }
  } catch (error) {
    console.error('Error updating notifications:', error)
    return res.status(http400).json({
      success: false,
      message: 'Error updating notifications.'
    })
  }
}
