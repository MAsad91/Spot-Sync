const AssignRates = require('../../../../models/assignRates')
const {
  http200,
  http400,
  http403
} = require('../../../../global/errors/httpCodes')
const {
  isValidObjectId,
  Types: { ObjectId }
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
    if (!placeId || !isValidObjectId(placeId))
      return res.status(http403).json({
        success,
        message: 'Invalid place Id'
      })
    const assignRates = await AssignRates.aggregate([
      {
        $match: { placeId: ObjectId(placeId), status: DOC_STATUS.ACTIVE }
      },
      {
        $lookup: {
          from: 'rates',
          let: { rateId: '$rateId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$rateId'] }
              }
            }
          ],
          as: 'rate'
        }
      },
      {
        $unwind: {
          path: '$rate',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            placeId: '$placeId',
            day: '$day',
            rateId: '$rate._id',
            displayName: '$rate.displayName',
            rateType: '$rate.rateType',
            amount: '$rate.amount',
            hours: '$rate.hours',
            isBlackout: '$isBlackout',
            isSpecialEvent: '$isSpecialEvent'
          },
          time: {
            $push: {
              startTime: '$startTime',
              endTime: '$endTime'
            }
          },
          date: {
            $push: {
              startDate: '$startDate',
              endDate: '$endDate'
            }
          },
          message: { $first: '$message' },
          id: { $first: '$_id' }
        }
      },
      {
        $group: {
          _id: {
            placeId: '$_id.placeId',
            day: '$_id.day',
            isBlackout: '$_id.isBlackout',
            isSpecialEvent: '$_id.isSpecialEvent'
          },
          data: {
            $push: {
              rate: {
                _id: '$_id.rateId',
                displayName: '$_id.displayName',
                rateType: '$_id.rateType',
                amount: '$_id.amount',
                hours: '$_id.hours'
              },
              time: '$time',
              date: '$date',
              message: '$message',
              id: '$id'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          placeId: '$_id.placeId',
          day: '$_id.day',
          data: 1,
          isBlackout: '$_id.isBlackout',
          isSpecialEvent: '$_id.isSpecialEvent'
        }
      }
    ])

    return res.status(http200).json({
      success: true,
      message: 'Success',
      assignRates
    })
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || 'Something went wrong!'
    })
  }
}
