const { http200, http400 } = require("../../../../global/errors/httpCodes");
const Roles = require("../../../../models/roles");
const moment = require("moment");
const Jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const {
    updateStatisticsForSuperAdmin,
    updateStatisticsForBrand
} = require("./calculationFunctions/statisticsUtils");

module.exports = async (req, res) => {
    try {
        const token = req.headers.token;
        const decode = Jwt.decode(token);
        const userId = mongoose.Types.ObjectId(decode.userId);

        const startDate = moment().startOf('day').utc();
        const endDate = moment().endOf('day').utc();

        const roles = await Roles.findOne({ userId, status:10, level:100 });

        if (roles) {
            await updateStatisticsForSuperAdmin(startDate, endDate);
        } else {
            await updateStatisticsForBrand(userId, startDate, endDate);
        } 

        return res.status(http200).json({ success: true, message: "Statistics updated successfully" });
    } catch (error) {
        return res.status(http400).json({
            success: false,
            message: error?.message ?? "Something went wrong!",
        });
    }
};
