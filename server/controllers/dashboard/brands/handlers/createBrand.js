const Brands = require("../../../../models/brands");
const Roles = require("../../../../models/roles");
const User = require("../../../../models/users");
const path = require("path");
const {
  http200,
  http400,
  http401,
} = require("../../../../global/errors/httpCodes");
const {
  extractCountryCode,
  capitalizeFirstLetter,
} = require("../../../../global/functions");
const { isValidObjectId } = require("mongoose");
const { uploadFile } = require("../../../../services/fileUpload");
const bcrypt = require("bcrypt");
const { welcomeEmail } = require("../../../../services/email");

module.exports = async (req, res) => {
  let success = false;

  try {
    const { body, userId } = req;
    const { userType } = body;

    if (!userId || !isValidObjectId(userId))
      return res.status(http401).json({
        success,
        message: "Invalid Token",
      });

    const requiredFields = ["brandName", "shortBrandName", "brandAddress"];
    if (userType === "new") {
      requiredFields.push("ownerName", "ownerEmail", "ownerMobileNumber");
    }
    const missingField = requiredFields.find(
      (field) => !body[field] || body[field]?.trim().length === 0
    );
    if (missingField) {
      return res.status(http400).json({
        success,
        message: `${
          missingField.charAt(0).toUpperCase() + missingField.slice(1)
        } is required!`,
      });
    }

    if (!body?.file) {
      return res.status(http400).json({
        success,
        message: "Brand Logo required!",
      });
    }

    const fileData = await uploadFile(
      req.body?.file,
      path?.extname(req?.body?.file?.path),
      true
    );
    const payload = { ...body };

    if (fileData?.success) {
      payload["brandLogo"] = fileData?.url;
    }

    if (userType === "new") {
      const ownerMobileNumber = body.ownerMobileNumber;
      const { countryCode, mobileNumber } = extractCountryCode(
        ownerMobileNumber
      );
      payload["ownerMobileNumber"] = mobileNumber;
      payload["countryCode"] = countryCode;

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(ownerMobileNumber, salt);

      const role = await Roles.findOne({
        level: 90,
        default: true,
        title: "Brand Admin",
      });

      const userObject = {
        firstName: body?.ownerName?.split(" ")?.[0],
        lastName:
          body?.ownerName?.split(" ")?.length > 1
            ? body?.ownerName?.split(" ")?.[1]
            : "",
        email: body.ownerEmail,
        mobile: payload["ownerMobileNumber"],
        password: hashedPassword,
        roleId: role._id,
        creatorId: userId,
      };
      const isUserExists = await User.findOne({
        $or: [{ email: userObject?.email }, { mobile: userObject?.mobile }],
      }).lean();
      if (isUserExists)
        return res.status(http400).json({
          success: false,
          message: "Email Or Mobile Already Registered!",
        });

      const user = await User.create(userObject);
      payload["userId"] = user._id;

      await welcomeEmail(user?.email)()({
        name: `${user.firstName || ""}  ${user.lastName || ""}`,
        brandName: capitalizeFirstLetter(
          body?.ownerName?.split(" ")?.[0] ?? ""
        ),
        address: body?.brandAddress ?? "",
        email: user?.email ?? "",
        password: user.mobile ?? "",
      });
    } else if (userType === "existing") {
      const existingUser = await User.findById(body.userId);
      if (!existingUser)
        return res.status(http400).json({
          success: false,
          message: "User not found!",
        });

      payload[
        "ownerName"
      ] = `${existingUser.firstName} ${existingUser.lastName}`;
      payload["ownerEmail"] = existingUser.email;
      payload["ownerMobileNumber"] = existingUser.mobile;
      payload["userId"] = body.userId;
    }

    payload["botcopyBotId"] =
      body.botcopyBotId && body.botcopyBotId !== ""
        ? body.botcopyBotId
        : "665029144f6e36000829b6e0";

    const brand = await Brands.create(payload);
    if (!brand)
      return res.status(http400).json({
        success,
        message: "Something went wrong!",
      });

    return res.status(http200).json({
      success: true,
      message: "Brand created successfully!",
    });
  } catch (error) {
    let message = "";
    if (error?.code === 11000 && error?.keyPattern) {
      const keys = Object.keys(error.keyPattern);

      switch (true) {
        case keys.includes("ownerEmail"):
          message = "Owner email must be unique.";
          break;
        case keys.includes("ownerMobileNumber"):
          message = "Owner mobile number must be unique.";
          break;
        default:
          break;
      }
    }

    if (message?.length > 0) {
      return res.status(http400).json({ success, message });
    }

    return res
      .status(http400)
      .json({ success, message: error?.message || "Something went wrong!" });
  }
};
