const Rates = require('../../../../models/rates')
const Users = require('../../../../models/users')
const Roles = require('../../../../models/roles')
const {
  http200,
  http400,
  http403
} = require('../../../../global/errors/httpCodes')
const {
  Types: { ObjectId },
  isValidObjectId
} = require('mongoose')
const { DOC_STATUS } = require('../../../../constants')

module.exports = async (req, res) => {
  let success = false
  try {
    const {
      userId,
      params: { placeId }
    } = req
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: 'Invalid Token'
      })

      const user = await Users.findById(userId).lean();
    if (!user)
      return res.status(http403).json({
        success,
        message: 'User not found'
      });

    const role = await Roles.findById(user.roleId).lean();
    if (!role)
      return res.status(http403).json({
        success,
        message: 'Role not found'
      });

    if (!placeId || !isValidObjectId(placeId))
      return res.status(http403).json({
        success,
        message: 'Invalid request'
      })

    let query;
    if (role?.title?.toLowerCase() === 'super admin') {
      query = { placeId: ObjectId(placeId), status: { $ne: DOC_STATUS.DELETE } }
    } else {
      query = {
        // userId: ObjectId(userId),
        placeId: ObjectId(placeId),
        status: { $ne: DOC_STATUS.DELETE }
      }
    }
    
    const rates = await Rates.find(query).lean()
    return res.status(http200).json({
      success: true,
      message: 'Success',
      rates,
      total: rates?.length || 0
    })
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || 'Something went wrong!'
    })
  }
}
