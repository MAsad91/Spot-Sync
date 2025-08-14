const { http400, http200 } = require("../../../../global/errors/httpCodes");
const Places = require("../../../../models/places");
const Brands = require("../../../../models/brands");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const AssignRates = require("../../../../models/assignRates");
const { DOC_STATUS } = require("../../../../constants");
const event = require("../../../../services/emitter");

module.exports = async (req, res) => {
  let success = false;
  try {
    const {
      userId,
      body: { assignRateId, placeId },
    } = req;
    // console.log("req.body =====>", req.body);
    if (!userId || !isValidObjectId(userId)) {
      return res.status(http400).json({
        success,
        message: "Invalid token",
      });
    }

    let update = {};
    const filter = {
      _id: { $in: assignRateId.map(id => ObjectId(id)) }
    //  _id: ObjectId(assignRateId),
      // placeId: ObjectId(placeId),
      // day: selectedDay,
    };
    // console.log("filter --->", filter);
    update["$set"] = { status: DOC_STATUS.DELETE };
    const isDeleted = await AssignRates.updateMany(filter, update);

    const placeData = await Places.findOne({ _id: placeId });
    const brandData = await Brands.findOne({
      userId: ObjectId(placeData.userId),
    });
    event.emit("notification", {
      userId: userId,
      title: "Assign Rates Deleted!",
      message: `${
        brandData?.brandName ? brandData?.brandName : "Super Admin"
      } deleted assign rates on place ${placeData?.google?.name}`,
      placeId: placeData?._id,
      brandName: brandData?.shortBrandName,
      brandLogo: brandData?.brandLogo,
    });

    if (!isDeleted)
      return res.status(http400).json({
        success,
        message: "Something went wrong!",
      });

    return res.status(http200).json({
      success: true,
      message: "Deleted successfully!",
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message,
    });
  }
};
