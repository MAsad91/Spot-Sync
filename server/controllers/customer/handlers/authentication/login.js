const { http400 } = require("../../../../global/errors/httpCodes");
const customer = require("../../../../models/customers");
const Subscription = require("../../../../models/subscriptions");
const moment = require("moment");
const otpGenerator = require("otp-generator");
const { customerOtpVerification } = require("../../../../services/email");
const { capitalizeFirstLetter } = require("../../../../global/functions");
const { sendMessage } = require("../../../../services/plivo");
const { get } = require("lodash");
const {
  Types: { ObjectId },
} = require("mongoose");

module.exports = async (req, res) => {
  try {
    const { emailOrMobile, isEmail } = req.body;

    if (!emailOrMobile) {
      return res
        .status(http400)
        .json({ message: "Please enter email or mobile" });
    }

    let user = null;
    
    if (isEmail) {
      let findQuery = {
        status: 10,
        email: emailOrMobile
      };
      user = await customer.findOne(findQuery);
    } else {
      user = await customer.findOneByMobile(emailOrMobile);
    }
    if (!user) return res.status(http400).json({ message: "Invalid User!" });

    if (user.status === 1)
      return res.status(http400).json({ message: "Your account is suspended" });

    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    
    await customer.findOneAndUpdateCustomer({ _id: user._id }, {
      $set: { otp, otpExpiryTime: moment().add(5, "minutes").toDate() },
    });
    // console.log("user ====>", user);
    if (isEmail) {
      customerOtpVerification(emailOrMobile)()({
        name: capitalizeFirstLetter(`${user.firstName} ${user.lastName}`),
        brandLogo: "",
        otp,
      });
    } else {
      const customerId = get(user, "_id", false);
      const subscription = await Subscription.findOne(
        {
          customerId: ObjectId(customerId),
        },
        { placeId: 1 }
      )
        .populate("placeId")

        .sort({ createdAt: -1 })
        .exec();

      const placeData = get(subscription, "placeId", false);
      const plivoNumber = get(placeData, "plivoNumber", false);

      const props = {
        from: plivoNumber,
        to: parseInt(emailOrMobile, 10),
        body: `This is Your One Time Password for logging to Parker Dashboard OTP: ${otp}`,
      };
      // console.log("props ===>", props);
      const sms = await sendMessage(props);
      // console.log("sms ===>", sms);
    }
    let response = { isEmail, [isEmail ? "email" : "mobile"]: emailOrMobile };
    return res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: err.message || "Something went wrong!",
    });
  }
};
