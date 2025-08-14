const Brands = require("../../../../models/brands");
const Roles = require("../../../../models/roles");
const User = require("../../../../models/users");
const { http200, http400 } = require("../../../../global/errors/httpCodes");
const {
  extractCountryCode,
  capitalizeFirstLetter,
} = require("../../../../global/functions");
const bcrypt = require("bcrypt");
const { welcomeEmail } = require("../../../../services/email");

module.exports = async (req, res) => {
  let success = false;

  try {
    const { body } = req;
    const requiredFields = [
      "brandName",
      "shortBrandName",
      "ownerName",
      "ownerEmail",
      "ownerMobileNumber",
      "brandAddress",
    ];

    // find missing field
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

    const payload = body;

    const { countryCode, mobileNumber } = extractCountryCode(
      body.ownerMobileNumber
    );

    payload["ownerMobileNumber"] = mobileNumber;
    payload["countryCode"] = countryCode;

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(body.ownerMobileNumber, salt);

    const findQuery = {
      level: 90,
      default: true,
      title: "Brand Admin",
    };
    const role = await Roles.findOne(findQuery);

    const userObject = {
      firstName: body?.ownerName?.split(" ")?.[0],
      lastName:
        body?.ownerName?.split(" ")?.length > 1
          ? body?.ownerName?.split(" ")?.[1]
          : "",
      email: body.ownerEmail,
      mobile: body.ownerMobileNumber,
      password: hashedPassword,
      roleId: role._id,
    };
    const isUserExists = await User.findOne({
      status: 10,
      $or: [{ email: userObject?.email }, { mobile: userObject?.mobile }],
    }).lean();
    if (isUserExists)
      return res.status(http400).json({
        success: false,
        message: "Email Or Mobile Already Register!",
      });
    const user = await User.create(userObject);
    payload["userId"] = user._id;
    payload["onBoardingFrom"] = "Dashboard";
    const brand = await Brands.create(payload);
    if (!brand)
      return res.status(http400).json({
        success,
        message: "Something went wrong!",
      });

    await welcomeEmail(user?.email)()({
      name: `${user.firstName || ""}  ${user.lastName || ""}`,
      brandName: capitalizeFirstLetter(body?.ownerName?.split(" ")?.[0] ?? ""),
      address: brand?.brandAddress ?? "",
      email: user?.email ?? "",
      password: user.mobile ?? "",
    });
    return res.status(http200).json({
      success: true,
      message: "Brand created successfully!",
      brandId: brand._id,
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
