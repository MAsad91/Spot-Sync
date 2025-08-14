const Roles = require("../../../../models/roles");
const Brands = require("../../../../models/brands");
const event = require("../../../../services/emitter");
const {
  http200,
  http400,
  http401,
} = require("../../../../global/errors/httpCodes");
const { isValidObjectId } = require("mongoose");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { body, userId } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http401).json({
        success,
        message: "Invalid Token",
      });
    if (
      !body?.title ||
      typeof body.title !== "string" ||
      body.title?.trim().length <= 0
    )
      return res.status(http400).json({
        success,
        message: "Title is required and must be a non-empty string.",
      });

    const isRoleTitleExists = await Roles.findOne({
      status: 10,
      userId,
      title: {
        $regex: `^${body?.title}$`,
        $options: "i",
      },
    }).lean();
    if (isRoleTitleExists)
      return res.status(http400).json({
        success,
        message: "Role title already used!.",
      });

    const payload = { userId, ...({ title, modules } = body) };
    const role = await Roles.create(payload);

    if (!role)
      return res.status(http400).json({
        success,
        message: "Something went wrong!",
      });

    const brandData = await Brands.findOne({
      userId: userId,
    });
    event.emit("notification", {
      userId: userId,
      title: "Role Created!",
      message: `${
        brandData?.brandName ? brandData?.brandName : "Super Admin"
      } create role ${body?.title}`,
      brandName: brandData?.shortBrandName,
      brandLogo: brandData?.brandLogo,
    });
    return res.status(http200).json({
      success: true,
      message: "Role created successfully!",
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
