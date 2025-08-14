const PermitsOptions = require("../../../../models/permitsOptions");
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
  let success = false;
  try {
    const {
      userId,
      body: {
        placeId
      },
    } = req;

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

    let query = {
      placeId: ObjectId(placeId),
    }

    const permitsOptions = await PermitsOptions.find(query).populate("customRates");

    return res.status(http200).json({
      success: true,
      message: "Success",
      permitsOptions: permitsOptions
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
