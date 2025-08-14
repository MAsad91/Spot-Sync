const { http200, http400 } = require("../../../../global/errors/httpCodes");
const Roles = require("../../../../models/roles");
const Place = require("../../../../models/places")
const Users = require("../../../../models/users")
const moment = require("moment");
const Jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const Rates = require("../../../../models/rates")
const {
  topSellingRates,
} = require("./calculationFunctions/statisticsUtils");
const { ObjectId } = require('mongodb');
const { DOC_STATUS } = require("../../../../constants")
module.exports = async (req, res) => {
  try {
    const token = req.headers.token;
    let { placeId } = req.query
    if (placeId && placeId !== 'all' && !Array.isArray(placeId)) {
      placeId = Array.isArray(placeId) ? placeId : [new ObjectId(placeId)];
    }

    const decode = Jwt.decode(token);
    const userId = mongoose.Types.ObjectId(decode.userId);

    const startDate = moment().add(-1, 'days').toDate();
    const endDate = moment().add(-7, 'days').toDate();
    let modifiedStartDate = moment(startDate).startOf('day').toDate()
    let modifiedEndDate = moment(startDate).endOf('day').toDate()

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
        places = await Users.find({ userId }).select('locations');
        places = places.map(place => place.locations).flat()
      }
    } else {
      places = placeId
    }
    const data = []
    for (let i = 0; i < 7; i++) {

      const rates = await topSellingRates(modifiedStartDate, modifiedEndDate, places, isSuperAdmin);
      console.log(rates)
      if (rates) {
        query = { _id: rates.rateId, status: DOC_STATUS.ACTIVE }
        if (!isSuperAdmin || places.length > 0) {
          query.placeId = { $in: places.map(mongoose.Types.ObjectId) }
        }
        let dayRate = await Rates.findOne(query)
          .sort({ createdAt: -1 })
          .select("displayName")
          .limit(1);
        if (dayRate) {
          dayRate = dayRate.toObject()
          dayRate.date = moment(modifiedStartDate).format("DD MMM YYYY").toUpperCase();
        }
        data.push(dayRate ? dayRate : { displayName: "No Rate Available" });
      } else {
        data.push({ displayName: "No Rate Available" });
      }

      if (modifiedStartDate > endDate) {
        modifiedStartDate = moment(modifiedStartDate).add(-1, 'days').toDate()
        modifiedEndDate = moment(modifiedEndDate).add(-1, 'days').toDate()
      }
    }


    return res.status(http200).json({ success: true, data, message: "Top Selling Rates Retrieved Successfully!" });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message ?? "Something went wrong!",
    });
  }
};
