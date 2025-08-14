const Brands = require("../../../../models/brands");
const Roles = require("../../../../models/roles");
const User = require("../../../../models/users");
const path = require("path");
const {
    http200,
    http400,
    http401,
} = require("../../../../global/errors/httpCodes");
const { isValidObjectId } = require("mongoose");

module.exports = async (req, res) => {
    let success = false;

    try {
        const { body, userId } = req;
        const { _id } = body;
        console.log(body)
        if (!userId || !isValidObjectId(userId))
            return res.status(http401).json({
                success,
                message: "Invalid Token",
            });

        // find brand by _id
        const brand = await Brands.findByIdAndUpdate(_id, body, { new: true });

        if (!brand) {
            return res.status(http401).json({
                success,
                message: "Brand not found!",
            });
        } else {
            return res.status(http200).json({
                success: true,
                message: "Default Settings Updated",
            });
        }
    } catch (error) {
        return res
            .status(http400)
            .json({ success, message: error?.message || "Something went wrong!" });
    }
};