const Rates = require("../../../../models/rates");
const Places = require("../../../../models/places");
const Brands = require("../../../../models/brands");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const event = require("../../../../services/emitter");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      userId,
      body: { rateId, status },
    } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    let update = {};
    const filter = { _id: ObjectId(rateId) };
    update["$set"] = { status };
    const updateUser = await Rates.updateOne(filter, update);
    const ratesData = await Rates.findOne(filter);
    const placeData = await Places.findOne({ _id: ratesData?.placeId });
    const brandData = await Brands.findOne({
      userId: ObjectId(placeData.userId),
    });
    // console.log("updateUser ===>", updateUser);

    event.emit("notification", {
      userId: userId,
      title: "Rates status Updated!",
      message: `${
        brandData?.brandName ? brandData?.brandName : "Super Admin"
      } change their rate status of ${ratesData?.displayName} on place ${
        placeData?.google?.name
      } to ${ratesData?.status === 1 ? "InActive" : "Active"}`,
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
