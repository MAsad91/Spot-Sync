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
const { isEmpty, intersection } = require("lodash");

module.exports = async (req, res) => {
  try {
    const {
      userId,
      params: { subscriptionId },
      body: { licensePlate, licensePlateUpdateMessage }, // This is an array of objects [{_id, licensePlateNumber},...]
    } = req;

    // console.log("Body ----->", subscriptionId);

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

    const existLicensePlate = await Subscription.find({
      _id: ObjectId(subscriptionId),
      "licensePlate.licensePlateNumber": { $in: licensePlateNumbers },
    });

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

    const licensePlatesWithId = licensePlate.map((plate) => ({
      _id: new ObjectId(),
      licensePlateNumber: plate.licensePlateNumber.toUpperCase(),
      assignName: plate.assignName ? plate.assignName : "",
      price: 0,
      status: 1,
    }));
    const filter = { _id: ObjectId(subscriptionId) };
    const update = {
      isReminderEmailSend: false,
      licensePlateGetUpdated: true,
      licensePlateUpdateMessage: licensePlateUpdateMessage
        ? licensePlateUpdateMessage
        : "",
      $addToSet: { licensePlate: { $each: licensePlatesWithId } },
    };

    const updatedSubscription = await Subscription.findOneAndUpdate(
      filter,
      update,
      { new: true }
    );

    if (!updatedSubscription) {
      return res.status(http400).json({
        success: false,
        message: "Failed to update subscription.",
      });
    }

    return res.status(http200).json({
      success: true,
      message: "License plate added successfully.",
      //   updatedSubscription,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
