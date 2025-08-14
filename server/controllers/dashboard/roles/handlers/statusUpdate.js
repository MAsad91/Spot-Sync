const Roles = require("../../../../models/roles");
const Brands = require("../../../../models/brands");
const event = require("../../../../services/emitter");
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
      body: { roleId, status },
    } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    let update = {};
    const filter = { _id: ObjectId(roleId) };
    update["$set"] = { status };
    const updateUser = await Roles.updateOne(filter, update);
    // console.log("updateUser ===>", updateUser);
    const RolesData = await Roles.findOne(filter);
    const brandData = await Brands.findOne({
      userId: userId,
    });
    event.emit("notification", {
      userId: userId,
      title: "Role Status Updated!",
      message: `${
        brandData?.brandName ? brandData?.brandName : "Super Admin"
      } update role status of ${RolesData?.title} to ${
        status === 1 ? "InActive" : "Active"
      }`,
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
