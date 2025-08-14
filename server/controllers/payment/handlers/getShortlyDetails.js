const Shortly = require("../../../models/shortly");
const Brands = require("../../../models/brands");
const { http200, http400 } = require("../../../global/errors/httpCodes");
const { DOC_STATUS } = require("../../../constants");
const moment = require("moment");
const { get } = require("lodash");
const {
  Types: { ObjectId },
} = require("mongoose");

module.exports = async (req, res) => {
  try {
    const {
      params: { shortlyId },
    } = req;
    const shortlyData = await Shortly.findOne({
      shortlyId,
      status: { $ne: DOC_STATUS.DELETE },
    }).populate({
      path: "subscriptionId",
      populate: [
        { path: "customerId", model: "customers" },
        { path: "brandId", model: "brands" },
        {
          path: "placeId",
          model: "places",
          select: "userId _id tax serviceFee google stripeConfiguration",
        },
      ],
    });

    if (!shortlyData) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid Payment" });
    }
    const brandUserId = get(shortlyData, "subscriptionId.placeId.userId", "");
    const brand = await Brands.findOne(
      {
        userId: ObjectId(brandUserId),
      },
      { brandLogo: 1 }
    );
    shortlyData["brandLogo"] = get(brand, "brandLogo", "");
    if (shortlyData.paymentStatus === "success")
      return res
        .status(http400)
        .json({ success: false, message: "Payment Already Paid", shortlyData });
    if (shortlyData.paymentStatus === "initialize")
      return res
        .status(http400)
        .json({ success: false, message: "Payment In Process", shortlyData });
    if (moment().isAfter(moment(shortlyData.expireOn)))
      return res
        .status(http400)
        .json({ success: false, message: "Payment Link Expired" });
    return res
      .status(http200)
      .json({ success: true, message: "Success", shortlyData });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
