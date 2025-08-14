const { http400, http200 } = require("../../../../global/errors/httpCodes")

const { Types: { ObjectId }, isValidObjectId } = require('mongoose')
const Report = require("../../../../models/automatedReports")
const { DOC_STATUS } = require("../../../../constants")

module.exports = async (req, res) => {
  let success = false
  try {
    const { userId, params: { reportId } } = req

    if (!userId || !isValidObjectId(userId)) {
      return res.status(http400).json({
        success,
        message: 'Invalid token'
      })
    }

    let update = {}

    const filter = { _id: ObjectId(reportId), userId: ObjectId(userId) }

    update['$set'] = { status: DOC_STATUS.DELETE }
    const isDeleted =  await Report.updateOne(filter, update)
    if(!isDeleted)
      return res.status(http400).json({
        success,
        message: "Something went wrong!"
      })

    return res.status(http200).json({
      success: true,
      message: "Deleted successfully!"
    })

  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message
    })
  }
}