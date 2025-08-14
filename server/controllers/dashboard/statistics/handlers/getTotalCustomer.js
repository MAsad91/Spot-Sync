const { http200, http400 } = require("../../../../global/errors/httpCodes");
const Statistics = require("../../../../models/statistics")
const Place = require("../../../../models/places")
const Roles = require("../../../../models/roles")
const Users = require("../../../../models/users")
const moment = require("moment");
const mongoose = require("mongoose")
const Jwt = require("jsonwebtoken")
const { calculatePercentageIncrease, calculateOneMonthStats } = require("./calculationFunctions/statsCount");


module.exports = async (req, res) => {
    try {
        const token = req.headers.token;
        let { placeId } = req.query
        const decode = Jwt.decode(token);
        const userId = mongoose.Types.ObjectId(decode.userId);
        const roleId = mongoose.Types.ObjectId(decode.roleId);

        const today = moment().toDate();
        const previousMonthEndDate = moment(today).add(-1, 'month').toDate();
        const previousMonthStartDate = moment(previousMonthEndDate).add(-1, 'month').toDate();

        const roles = await Roles.findOne({ _id: userId, status: 10 });
        const isSuperAdmin = roles && roles.level === 100 ? true : false
        const isBrandAdmin = roles && (roles.level === 90 || roles.level === 80) ? true : false
        let places = []
        if (placeId === 'all') {
            if (!isSuperAdmin && isBrandAdmin) {
                places = await Place.find({ userId }).select('_id');
                places = places.map(place => place._id)
            } else if (!isSuperAdmin && !isBrandAdmin) {
                places = await Users.find({ userId }).select('locations');
                places = places.map(place => place.locations).flat()
            }
        } else {
            places = placeId
        }

        let query;
        if (placeId === 'all' && isSuperAdmin) {
            query = { title: 'Customers', placeId: { $exists: false } };
        } else {
            query = { title: 'Customers', placeId: { $in: places } };
        }

        const stats = await Statistics.findOne(query).sort({ createdAt: -1 }).exec();
        const result = stats ? stats.value : 0;

        const twoMonthPreviousStatsCount = await calculateOneMonthStats(previousMonthStartDate, previousMonthEndDate, 'Customers', (isSuperAdmin && !placeId) ? null : places)
        const oneMonthPreviousStatsCount = await calculateOneMonthStats(previousMonthEndDate, today, 'Customers', (isSuperAdmin && !placeId) ? null : places)
        const percentageIncrease = calculatePercentageIncrease(twoMonthPreviousStatsCount, oneMonthPreviousStatsCount)

        return res
            .status(http200)
            .json({ success: true, data: { customers: result, percentageIncrease }, message: "Statistics Retrieved successfully" });
    } catch (error) {
        return res.status(http400).json({
            success: false,
            message: error?.message ?? "Something went wrong!",
        });
    }
};
