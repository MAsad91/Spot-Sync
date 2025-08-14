const Brands = require("../../../../models/brands");
const Place = require("../../../../models/places");
const Users = require("../../../../models/users");
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

module.exports = async (req, res) => {
  try {
    const { userId } = req;
    if (!userId || !isValidObjectId(userId)) {
      return res.status(http403).json({
        success: false,
        message: "Invalid Token",
      });
    }

    const userRole = await Users.findOne({ _id: ObjectId(userId) })
      .populate("roleId")
      .lean();
    const roleType = userRole?.roleId?.level;

    const findQuery = {
      status: roleType === 100 ? { $ne: DOC_STATUS.DELETE } : DOC_STATUS.ACTIVE,
      ...(roleType !== 100 && { userId: ObjectId(userId) }),
    };

    const brands = await Brands.find(findQuery).sort({ _id: -1 }).lean();
    if (!brands.length) {
      return res.status(http200).json({
        success: true,
        message: "No brands found",
        brands: [],
        total: 0,
      });
    }
    const brandIds = brands.map((brand) => ObjectId(brand._id));
    const placeCounts = await Place.aggregate([
      { $match: { brandId: { $in: brandIds }, status: DOC_STATUS.ACTIVE } },
      { $group: { _id: "$brandId", count: { $sum: 1 } } },
    ]);

    const placeCountMap = placeCounts.reduce((acc, { _id, count }) => {
      acc[_id.toString()] = count;
      return acc;
    }, {});
    const brandData = brands.map((brand) => ({
      ...brand,
      placeCount: placeCountMap[brand._id.toString()] || 0,
    }));

    return res.status(http200).json({
      success: true,
      message: "Success",
      brands: brandData,
      total: brands.length,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
