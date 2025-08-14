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
const { getCurrentWeekDates } = require('../../../../global/functions')
const { get } = require('lodash')
const { DOC_STATUS } = require('../../../../constants')
const { getColorId } = require('./utils/colorCalculator')

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

    const currentWeekDates = getCurrentWeekDates()
    const assignedRates = await AssignRates.find(
      {
        placeId,
        status: DOC_STATUS.ACTIVE
      },
      {
        startTime: 1,
        startDate: 1,
        endTime: 1,
        endDate: 1,
        rateId: 1,
        day: 1,
        isSpecialEvent: 1,
        isBlackout: 1,
        isExtensionRate: 1,
        message: 1,
      }
    )
      .populate('rateId')
      .lean()

    const combinedArray = assignedRates.map((rate, index) => {
      const matchingDay = currentWeekDates.find(day => day.day === rate.day)
      if (rate.isSpecialEvent) {
        const startDate = rate.startDate
        const endDate = rate.endDate
        const title = `${rate?.rateId?.displayName} (Special Rates)`
        const rateType = rate?.rateId?.rateType
        const rateTitle = rate?.rateId?.title
        const isExtension = rate?.rateId.isExtensionRate
        return {
          startDate,
          endDate,
          title,
          id: index,
          colorId: getColorId(rateType, rateTitle, isExtension, false)
        }
      } else if (rate.isBlackout) {
        const startDate = rate.startDate
        const endDate = rate.endDate
        const title = `${rate.message} (Blackout)`
        const rateType = rate?.rateId?.rateType
        const rateTitle = rate?.rateId?.title
        const isBlackout = rate?.isBlackout
        return {
          startDate,
          endDate,
          title,
          id: index,
          colorId: getColorId(rateType, rateTitle, false, isBlackout)
        }
      } else if (matchingDay) {
        const startDate = matchingDay.date + 'T' + rate.startTime
        const endDate = matchingDay.date + 'T' + rate.endTime
        const title = get(rate, 'rateId.displayName', '')
        const rateType = rate?.rateId?.rateType
        const rateTitle = rate?.rateId?.title
        const isExtension = rate?.isExtensionRate
        delete rate.rateId
        return {
          startDate,
          endDate,
          title,
          id: index,
          colorId: getColorId(rateType, rateTitle, isExtension, false)
        }
      }
      return rate
    })

    return res.status(http200).json({
      success: true,
      message: 'Success',
      assignRates: combinedArray
    })
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || 'Something went wrong!'
    })
  }
}
