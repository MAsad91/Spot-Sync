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

module.exports = async (req, res) => {
  try {
    const {
      userId,
      params: { subscriptionId },
      body: { licensePlate, reasonForDeclineMessage }, // This is an array of objects [{_id, licensePlateNumber},...]
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

    // console.log("body ====>", req.body);

  
    const filter = { _id: ObjectId(subscriptionId) };
    // Process each license plate update individually
    for (const plate of licensePlate) {
      const update = {
        $set: {
          "licensePlate.$[elem].status": 2,
          reasonForDeclineMessage: reasonForDeclineMessage,
          licensePlateGetUpdated:false
        },
      };
      const arrayFilters = [{ "elem._id": ObjectId(plate._id) }];

      // Perform update operation for each license plate
      await Subscription.updateOne(filter, update, { arrayFilters });
    }

    return res.status(http200).json({
      success: true,
      message: "Request Declined successfully",
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
