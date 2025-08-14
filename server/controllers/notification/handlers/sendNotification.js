const {
  Types: { ObjectId },
  isValidObjectId
} = require('mongoose')
const {
  DOC_STATUS,
  NOTIFICATION_PURPOSE,
  NOTIFICATION_READSTATUS
} = require('../../../constants')
const Notification = require('../../../models/notifications')

const sendNotification = async ({ brandName, brandLogo, userId, title, message, placeId }) => {
  try {
    // if (!userId || !isValidObjectId(userId))
    //   return res.status(http403).json({
    //     success,
    //     message: 'Invalid Token'
    //   })

    const payload = {
      userId,
      title,
      placeId,
      message,
      brandName, 
      brandLogo,
      purpose: NOTIFICATION_PURPOSE.CREATE,
      status: DOC_STATUS.ACTIVE,
      readStatus: NOTIFICATION_READSTATUS.UNSEEN,
      onlyForSuperAdmin: true
    }

    // console.log('Data===>', payload)
    await Notification.create(payload)
  } catch (e) {
    console.log('error on notify trust level', e.message)
  }
}

module.exports = sendNotification
