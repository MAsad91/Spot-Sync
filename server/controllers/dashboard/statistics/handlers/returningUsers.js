const { http200, http400 } = require("../../../../global/errors/httpCodes");
const Roles = require("../../../../models/roles");
const Place = require("../../../../models/places")
const Users = require("../../../../models/users")
const moment = require("moment");
const Jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const {
    returningUser,
} = require("./calculationFunctions/statisticsUtils");
const { ObjectId } = require('mongodb');
module.exports = async (req, res) => {
    try {
        const token = req.headers.token;
        let { placeId } = req.query
        if (placeId && placeId !== 'all' && !Array.isArray(placeId)) {
            placeId = Array.isArray(placeId) ? placeId : [new ObjectId(placeId)];
          }
        const decode = Jwt.decode(token);
        const userId = mongoose.Types.ObjectId(decode.userId);

        const startDate = moment().startOf('month').toDate();
        const endDate = moment().endOf('month').toDate();
        const userRole = await Users.findOne({ _id: userId }).populate("roleId");
        const roleType = userRole?.roleId.level;
        const isSuperAdmin = roleType === 100 ? true : false
        const isBrandAdmin = roleType === 90 ? true : false
        let places = []
        if (placeId === 'all') {
            if (!isSuperAdmin && isBrandAdmin) {
                places = await Place.find({ userId }).select('_id');
                places = places.map(place => place._id)
            } else if (!isSuperAdmin && !isBrandAdmin) {
                places = await Users.find({ _id: userId }).select('locations');
                places = places.map(place => place.locations).flat()
            }
        } else {
            places = placeId
        }

        const data = await returningUser(startDate, endDate, places, isSuperAdmin );
        return res.status(http200).json({ success: true, data, message: "Returning User updated successfully" });
    } catch (error) {
        return res.status(http400).json({
            success: false,
            message: error?.message ?? "Something went wrong!",
        });
    }
};
