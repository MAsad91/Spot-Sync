const {
    http200,
    http400,
    http403,
} = require("../../../../global/errors/httpCodes");
const {
    Types: { ObjectId },
    isValidObjectId,
} = require("mongoose");

const Reservations = require("../../../../models/reservations");
const Places = require("../../../../models/places")
const moment = require("moment");
const {get} = require("lodash")

module.exports = async (req, res) => {
    let success = false;
    try {
        const {
            userId,
            body: {
                placeId,
                startDate,
                endDate,
            },
        } = req;

        if (!userId || !isValidObjectId(userId))
            return res.status(http403).json({
                success,
                message: "Invalid Token",
            });

        const placeData = await Places.findOne(
            { _id: ObjectId(placeId) },
            { timeZoneId: 1, lotName: 1, google: 1, parkingCode: 1 }
        );
        const tz = placeData?.timeZoneId;
        let modifiedStartDate = moment.tz(startDate, tz).startOf("day");
        let modifiedEndDate = moment.tz(endDate, tz).endOf("day");

        const start = modifiedStartDate.utc().toDate();
        const end = modifiedEndDate.utc().toDate();
        const reservationData = await Reservations.find({
            placeId: ObjectId(placeId),
            status: "success",
            purpose: "PARKING",
            startDate: { $gte: start, $lte: end },
        }).populate({
            path: "placeId",
            select: "_id parkingCode google.formatted_address lotName timeZoneId",
        }).populate("rateId");

        let processedResults = {
            placeData,
            startDate: modifiedStartDate.format("MM/DD/YYYY"),
            endDate: modifiedEndDate.format("MM/DD/YYYY"),
            total: 0,
            serviceFee: 0,
            totals: {},
            sums: {},
            totalReservation: 0,
            data: [],
        };

        let hourlyData = {};
        for (let i = 0; i < 24; i++) {
            const hour = moment().startOf("day").add(i, "hours").format("HH:00");
            hourlyData[hour] = {
                time: hour,
                totalCount: 0,
                totalRevenue: 0,
                totalServiceFee: 0,
                percentage: 0,
                rates: {},
                revenuePercent: 0,
            };
        }
        reservationData.map((reservation) => {
            const { rateId, baseRate, totalAmount, serviceFee, startDate } = reservation;
            const noOfPasses = get(reservation, "noOfPasses", 1)
            const rateDisplayName = rateId ? rateId.displayName : '';
            const amount = baseRate;
            const totalSum = amount;

            if (!processedResults.totals[rateDisplayName]) {
                processedResults.totals[rateDisplayName] = {
                    count: 0,
                    amount,
                    totalSum: 0,
                };
                processedResults.sums[rateDisplayName] = 0;
            }
            processedResults.totalReservation += noOfPasses;
            processedResults.totals[rateDisplayName].count += 1;
            processedResults.totals[rateDisplayName].totalSum += totalSum;
            processedResults.sums[rateDisplayName] += totalSum;

            processedResults.total += totalAmount;
            processedResults.serviceFee += serviceFee;

            const reservationHour = moment.tz(startDate, tz).format("HH:00");

            if (!hourlyData[reservationHour].rates[rateDisplayName]) {
                hourlyData[reservationHour].rates[rateDisplayName] = {
                    count: 0,
                    amount,
                };
            }

            hourlyData[reservationHour].totalCount += 1;
            hourlyData[reservationHour].totalRevenue += totalAmount;
            hourlyData[reservationHour].totalServiceFee += serviceFee;
            hourlyData[reservationHour].rates[rateDisplayName].count += 1;

            hourlyData[reservationHour].revenuePercent = (
                (hourlyData[reservationHour].totalRevenue /
                    processedResults.total) *
                100
            ).toFixed(2);
        });

        Object.keys(hourlyData).forEach((hour) => {
            const hourlyRevenue = hourlyData[hour].totalRevenue;
            if (processedResults.total > 0) {
                hourlyData[hour].percentage = (
                    (hourlyRevenue / processedResults.total) *
                    100
                ).toFixed(2);
            } else {
                hourlyData[hour].percentage = "0.00";
            }

            processedResults.data.push(hourlyData[hour]);
        });


        return res.status(http200).json({
            success: true,
            message: "Success",
            data: processedResults,
        });
    } catch (error) {
        return res.status(http400).json({
            success,
            message: error?.message || "Something went wrong!",
        });
    }
};
