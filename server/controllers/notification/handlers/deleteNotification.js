const { NOTIFICATION_READSTATUS } = require('../../../constants')
const UserNotification = require('../../../models/userNotifications')
const {
  http200,
  http400,
  http403
} = require('../../../global/errors/httpCodes')
const {
  Types: { ObjectId },
  isValidObjectId
} = require('mongoose')

module.exports = async (req, res) => {
  let success = false
  try {
    const {
      userId,
      body: { notificationId }
    } = req
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: 'Invalid Token'
      })
    let update = {}
    const filter = { _id: ObjectId(notificationId) }
    update['$set'] = { status: NOTIFICATION_READSTATUS.DELETED }
    await UserNotification.updateOne(filter, update)

    return res.status(http200).json({
      success: true,
      message: 'Updated successfully'
    })
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || 'Something went wrong!'
    })
  }
}
