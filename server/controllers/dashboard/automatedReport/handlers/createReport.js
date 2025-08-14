const { isValidObjectId } = require("mongoose")
const { http400, http200 } = require("../../../../global/errors/httpCodes")
const AutomatedReports = require("../../../../models/automatedReports")

module.exports = async (req, res) => {
  let success = false
  try {
    const { body, userId } = req
    if (!userId || !isValidObjectId(userId)) {
      return res.status(http400).json({
        success,
        message: "Invalid token"
      })
    }
    console.log("body ==>",body)


    if (!body?.toEmail || body.toEmail?.trim()?.length <= 0) {
      return res.status(http400).json({
        success,
        message: 'Invalid email'
      })
    }
    const payload = { userId, ...body }
    const isPermit = payload.isPermit
    const report = await AutomatedReports.create(payload)
    if (!report) {
      return res.status(http400).json({
        success,
        message: "something went wrong"
      })
    }
    return res.status(http200).json({
      success: true,
      message: isPermit ? "Receipent Added Successfully" : "report create successfully"
    })

  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "something went wrong"
    })
  }
}