const Subscription = require("../../../../models/subscriptions");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { isEmpty, intersection, get } = require("lodash");
const { generateShortlyId } = require("../../../../global/functions");

const moment = require("moment");

module.exports = async (req, res) => {
  try {
    const {
      userId,
      params: { subscriptionId },
      body: { licensePlate }, // This is an array of objects [{_id, licensePlateNumber},...]
    } = req;

    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(http403)
        .json({ success: false, message: "Invalid Token" });
    }

    if (!subscriptionId || !isValidObjectId(subscriptionId)) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid Request" });
    }

    if (!Array.isArray(licensePlate) || !licensePlate.length) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid License Plate data" });
    }
    const licensePlateNumbers = licensePlate.map((plate) =>
      plate.licensePlateNumber.toUpperCase()
    );
    const subscriptionData = await Subscription.findOne(
      {
        _id: ObjectId(subscriptionId),
      },
      { placeId: 1 }
    ).populate("placeId");
    const existLicensePlate = await Subscription.find({
      "licensePlate.licensePlateNumber": { $in: licensePlateNumbers },
    }).populate("placeId");

    console.log("existLicensePlate ===>", subscriptionData);

    if (!isEmpty(existLicensePlate)) {
      const existingLicensePlates = existLicensePlate.flatMap((entry) =>
        entry.licensePlate.map((plate) => plate.licensePlateNumber)
      );
      const matchedLicensePlates = intersection(
        existingLicensePlates,
        licensePlateNumbers
      );

      if (matchedLicensePlates.length > 0) {
        return res.status(http400).json({
          success: false,
          message: `The following license plates are already subscribed: ${matchedLicensePlates.join(
            ", "
          )}`,
        });
      }
    }

    const filter = { _id: ObjectId(subscriptionId) };
    const { placeId, startDate, endDate } = subscriptionData;

    // Process each license plate update individually
    for (const plate of licensePlate) {
      const randomString = generateShortlyId();
      const externalKey = `${randomString}_${plate.licensePlateNumber}`;
      const updateDate = moment().utc().toDate();
      const update = {
        $set: {
          "licensePlate.$[elem].licensePlateNumber":
            plate.licensePlateNumber.toUpperCase(),
          "licensePlate.$[elem].externalKey": externalKey,
          "licensePlate.$[elem].ballparkValidateDate": updateDate,
          isReminderEmailSend: false,
        },
      };
      const arrayFilters = [{ "elem._id": ObjectId(plate._id) }];

      // Perform update operation for each license plate
      await Subscription.updateOne(filter, update, { arrayFilters });
    }


    return res.status(http200).json({
      success: true,
      message: "License plate numbers updated successfully.",
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
