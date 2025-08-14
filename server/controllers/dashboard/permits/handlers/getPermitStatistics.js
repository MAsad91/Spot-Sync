const Permit = require("../../../../models/permits");
const {
  http200,
  http400,
  http403,
  http500,
} = require("../../../../global/errors/httpCodes");
const moment = require("moment");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { DOC_STATUS } = require("../../../../constants");
module.exports = async (req, res) => {
  try {
    const { userId } = req;
    const { placeId } = req.params;
    let success = false;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    if (!placeId || !isValidObjectId(placeId))
      return res.status(http403).json({
        success,
        message: "Invalid request",
      });

    const currentDate = moment().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    const Permits = await Permit.find({
      status: { $ne: "deleted" },
      placeId: ObjectId(placeId),
    });
    let expiredPermits = 0;
    let activePermits = 0;
    let activeLicensePlates = 0;
    let requestedPermits = 0;

    Permits.forEach((permit) => {
      const { endDate, licensePlate } = permit;
      const permitExpiration = moment(endDate).startOf('day');
      const currentDateMoment = moment(currentDate).startOf('day');

      if (permit.status?.toLowerCase() === "requested") {
        requestedPermits++;
      } else if (permit.status?.toLowerCase() === "active") {
        if (permitExpiration.isBefore(currentDateMoment)) {
          expiredPermits++
        } else {
          activePermits++;
          activeLicensePlates += licensePlate.length;
        }
      }
    });

    const statistics = {
      expiredPermits,
      activePermits,
      activeLicensePlates,
      requestedPermits,
    };

    return res.status(http200).json({
      success: true,
      message: "success",
      statistics,
    });
  } catch (error) {
    console.error("Error fetching permits statistics:", error);
    return res.status(http500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
