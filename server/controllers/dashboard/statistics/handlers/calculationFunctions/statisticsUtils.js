const Reservation = require("../../../../../models/reservations");
const Statistics = require("../../../../../models/statistics");
const Customers = require("../../../../../models/customers");
const Place = require("../../../../../models/places");
const mongoose = require("mongoose");

const updateStatisticsForSuperAdmin = async (startDate, endDate) => {
    const bookings = await Reservation.find({
        status: "success",
        createdAt: {
            $lte: endDate,
            $gte: startDate
        }
    });

    const userCount = await Customers.countDocuments({ status: 10 });

    const result = calculateBookingStatistics(bookings);

    await updateStatistics(result, userCount, startDate, endDate);
};

const updateStatisticsForBrand = async (userId, startDate, endDate) => {
    const places = await Place.find({ userId }).select('_id brandId');
    if (places.length > 0) {
        await Promise.all(places.map(async (place) => {
            const placeId = place._id;
            const brandId = place.brandId

            const bookings = await Reservation.find({
                placeId: placeId,
                status: "success",
                createdAt: {
                    $lte: endDate,
                    $gte: startDate
                }
            });

            const userCount = await Customers.countDocuments({
                brandId: brandId,
                status: 10
            });

            const result = calculateBookingStatistics(bookings);
            await updateStatistics(result, userCount, startDate, endDate, placeId, brandId);
        }));
    }
};


const calculateBookingStatistics = (bookings) => {
    return bookings.reduce((acc, booking) => {
        acc.count += 1;
        acc.totalAmount += booking.totalAmount || 0;
        acc.tax += booking.tax || 0;
        acc.serviceFee += booking.serviceFee || 0;
        return acc;
    }, { count: 0, totalAmount: 0, tax: 0, serviceFee: 0 });
};

const updateStatistics = async (result, userCount, startDate, endDate, placeId = null, brandId = null) => {
    const statisticsData = [
        { title: 'Bookings', value: result.count },
        { title: 'Customers', value: userCount },
        { title: 'Revenue', value: result.totalAmount },
        { title: 'Service Fee', value: result.serviceFee },
        { title: 'Tax', value: result.tax }
    ];

    await Promise.all(
        statisticsData.map(async ({ title, value }) => {
            const query = { title, createdAt: { $gte: startDate, $lte: endDate } };

            if (placeId) {
                query.placeId = placeId;
                query.brandId = brandId;

            } else {
                query.placeId = { $exists: false };
                query.brandId = { $exists: false };
            }

            const stats = await Statistics.findOne(query);

            if (stats) {
                stats.value = value;
                stats.updatedAt = new Date();
                await stats.save();
            } else {
                const newStat = {
                    title,
                    value,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                if (placeId) {
                    newStat.placeId = placeId;
                    newStat.brandId = brandId;
                }
                await Statistics.create(newStat);
            }
        })
    );
};

const returningUser = async (startDate, endDate, places, isSuperAdmin) => {
    let matchQuery = {
        status: "success",
        startDate: {
            $lte: endDate,
            $gte: startDate
        }
    } 
    if (!isSuperAdmin || places.length > 0) {
        matchQuery.placeId = { $in: places.map(mongoose.Types.ObjectId) }
    }

    let query = [
        {
            $match: matchQuery
        },
        {
            $unwind: "$licensePlate"
        },
        {
            $group: {
                _id: {
                    licensePlate: "$licensePlate",
                    customerId: "$customerId"
                },
                reservationCount: { $sum: 1 },
                totalAmount: { $sum: "$totalAmount" }
            }
        },
        {
            $match: {
                reservationCount: { $gt: 1 }
            }
        },
        {
            $project: {
                licensePlate: "$licensePlate",
                customerId: "$_id.customerId",
                reservationCount: 1,
                totalAmount: 1,

            }
        }
    ]

    const returningUserData = await Reservation.aggregate(query);
    const totalCount = returningUserData.length;
    const topFive = returningUserData.sort((a, b) => b.reservationCount - a.reservationCount).slice(0, 5);

    const data = { topFive, totalCount }
    return data;
};

const topSellingRates = async (startDate, endDate, places, isSuperAdmin) => {
    let matchQuery = {
        status: "success",
        startDate: {
            $lte: endDate,
            $gte: startDate
        }
    } 
    if (!isSuperAdmin || places.length > 0) {
        matchQuery.placeId = { $in: places.map(mongoose.Types.ObjectId) }
    }

    let query = [
        {
            $match: matchQuery
        },
        {
            $group: {
                _id: "$rateId",
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                count: -1
            }
        },
        {
            $limit: 1
        },
        {
            $project: {
                _id: 0,
                rateId: "$_id",
                count: 1
            }
        }
    ]
    const data = await Reservation.aggregate(query);
    return data.length > 0 ? data[0] : null;
};

module.exports = {
    updateStatisticsForSuperAdmin,
    updateStatisticsForBrand,
    calculateBookingStatistics,
    updateStatistics,
    returningUser,
    topSellingRates,

};
