const Users = require("../../../models/users");
const Brands = require("../../../models/brands");
const Roles = require("../../../models/roles");
const AUTH = require("../../../services/auth");
const { sendEmail, welcomeEmailUser } = require("../../../services/email");
const { capitalizeFirstLetter } = require("../../../global/functions");
const { http200, http400 } = require("../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
} = require("mongoose");
const { EMAIL } = require("../../../config");
const { DOC_STATUS } = require("../../../constants");

module.exports = {
  async xcreate(req, res) {
    try {
      let payload = req.body;
      if (!payload.password) {
        payload["password"] = payload.mobile;
      }
      payload.password = await AUTH.encryptPassword(payload.password);
      payload.creatorId = req.userId;
      const isUserExists = await Users.findOne({
        $or: [{ email: payload?.email.toLowerCase() }, { mobile: payload?.mobile }],
      }).lean();
      if (isUserExists) {
        if (isUserExists.status === DOC_STATUS.DELETE) {
          const filter = {
            $or: [{ email: payload?.email.toLowerCase() }, { mobile: payload?.mobile }],
          };
          let update = {};
          payload.status = DOC_STATUS.ACTIVE;
          update["$set"] = payload;
          const updatedUser = await Users.updateOne(filter, update);
          if (updatedUser) {
            return res.status(http400).json({
              success: true,
              message: "User Created Successfully!!",
            });
          } else {
            return res
              .status(http400)
              .json({ success: false, message: "Something went wrong!" });
          }
        } else {
          return res.status(http400).json({
            success: false,
            message: "Email Or Mobile Already Register!!",
          });
        }
      }
      const user = await Users.create(payload);
      if (!user)
        return res
          .status(http400)
          .json({ success: false, message: "Something went wrong!" });
      const role = await Roles.findOne({ _id: payload.roleId });
      const { userId } = req;
      const brand = await Brands.findOne({ userId: ObjectId(userId) });
      const brandLogo = brand?.brandLogo || process.env.SPOTSYNC_LOGO;
      const brandName = brand?.brandName || "SpotSync";
      
      await welcomeEmailUser(user?.email)()({
        name:
          capitalizeFirstLetter(payload?.firstName?.split(" ")?.[0] ?? "") +
          " " +
          capitalizeFirstLetter(payload?.lastName?.split(" ")?.[0] ?? ""),
        dashboard_url: "https://www.spot-sync.com",
        email: user?.email.toLowerCase() ?? "",
        password: user.mobile ?? "",
        role_title: role?.title || "user",
        brandLogo: brandLogo,
        brandName: brandName,
      });
      return res.status(http200).json({
        success: true,
        message: "Successfully created!",
      });
    } catch (err) {
      throw err;
    }
  },
};
