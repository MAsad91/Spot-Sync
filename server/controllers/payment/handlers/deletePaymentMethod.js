const { http200, http400 } = require("../../../global/errors/httpCodes");
const {
  deletePaymentMethods,
} = require("../../../services/stripe");
const Place = require("../../../models/places");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

module.exports = async (req, res) => {
  try {
    const {
      params: { cardId },
      query: { placeId },
    } = req;

    let place = null;
    if (placeId && isValidObjectId(placeId)) {
      place = await Place.findOne({ _id: ObjectId(placeId) });
    }

    const paymentMethods = await deletePaymentMethods(cardId, place);
    if (!paymentMethods.success) {
      return res.status(http400).json({
        success: false,
        message: "Invalid Request",
      });
    }
    return res.status(http200).json({
      success: true,
      message: "Success",
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
