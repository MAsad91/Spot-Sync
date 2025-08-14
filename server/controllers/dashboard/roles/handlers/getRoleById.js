const Roles = require('../../../../models/roles')
const {http200, http400, http403} = require('../../../../global/errors/httpCodes')
const { Types: {ObjectId}, isValidObjectId } = require('mongoose')

module.exports = async (req, res) => {
    let success = false
    try {
        const {userId, query: {roleId}} = req
        if(!userId || !isValidObjectId(userId)) return res.status(http403).json({
            success, 
            message: "Invalid Token"
        })
        if(!roleId || !isValidObjectId(roleId))
            return res.status(http400).json({
                success,
                message: "Role id required!"
        })
        const role = await Roles.findOne({_id: ObjectId(roleId), userId: ObjectId(userId)}).lean()
        return res.status(http200).json({
            success: true,
            message: "Success",
            role
        })
    } catch (error) {
        return res.status(http400).json({
            success,
            message: error?.message || "Something went wrong!"
        })
    }
}