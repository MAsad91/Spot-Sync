const Rates = require("../../../../models/rates");
const AssignRates = require("../../../../models/assignRates");
const Places = require("../../../../models/places");
const Brands = require("../../../../models/brands");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { DOC_STATUS } = require("../../../../constants");
const event = require("../../../../services/emitter");

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      userId,
      body: { rateId },
    } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    let update = {};
    const filter = { _id: ObjectId(rateId) };
    update["$set"] = { status: DOC_STATUS.DELETE };
    await Rates.updateOne(filter, update);
    await AssignRates.updateMany({ rateId: ObjectId(rateId) }, update);
    const ratesData = await Rates.findOne(filter);
    const placeData = await Places.findOne({ _id: ratesData?.placeId });
    const brandData = await Brands.findOne({
      userId: ObjectId(placeData.userId),
    });

    event.emit("notification", {
      userId: userId,
      title: "Rates Deleted!",
      message: `${
        brandData?.brandName ? brandData?.brandName : "Super Admin"
      } deleted rate, rate name ${ratesData?.displayName} on place ${
        placeData?.google?.name
      }`,
      placeId: placeData?._id,
      brandName: brandData?.shortBrandName,
      brandLogo: brandData?.brandLogo,
    });

    return res.status(http200).json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
