const Shortly = require("../../../../models/shortly");
const { http200, http400 } = require("../../../../global/errors/httpCodes");
const { DOC_STATUS } = require("../../../../constants");
const moment = require("moment");
const { get } = require("lodash");

module.exports = async (req, res) => {
  try {
    const {
      params: { shortlyId },
    } = req;
    const shortlyData = await Shortly.findOne({
      isParking: true,
      shortlyId,
      status: { $ne: DOC_STATUS.DELETE },
    }).populate("brandId placeId paymentId");
    if (!shortlyData) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid Payment" });
    }
    const { brandId } = shortlyData;
    shortlyData["brandLogo"] = get(brandId, "brandLogo", "");
    if (shortlyData.paymentStatus === "success")
      return res
        .status(http400)
        .json({ success: false, message: "Payment Already Paid", shortlyData });
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
