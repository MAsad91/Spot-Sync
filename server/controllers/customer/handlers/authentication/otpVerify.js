const { http400 } = require("../../../../global/errors/httpCodes");
const customer = require("../../../../models/customers");
const moment = require("moment");
const auth = require("../../../../services/auth");

module.exports = async (req, res) => {
  try {
    const { emailOrMobile, isEmail, otp } = req.body;
    if (!emailOrMobile)
      return res
        .status(http400)
        .json({ message: "Please enter email and mobile" });

    let user = null;
    if (isEmail) {
      let findQuery = { status: 10 };
      findQuery.email = emailOrMobile;

      user = await customer.findOne(findQuery);
    } else {      
      user = await customer.findOneByMobile(emailOrMobile);
    }

    if (!user) {
      return res.status(http400).json({ message: "Invalid User!" });
    }
    if (user && user.status === 1) {
      return res.status(http400).json({ message: "Your account is suspended" });
    }
    if (user.otp != otp) {
      return res.status(http400).json({
        message: "Incorrect OTP!",
      });
    }
    if (moment().isAfter(user.otpExpiryTime)) {
      return res.status(http400).json({
        message: "Your OTP has expired! Please request for new OTP",
      });
    }
    const jwt = await auth.createJWT({
      userId: user._id,
    });
    user.otp = null;
    await user.save();

    return res.json({
      success: true,
      data: {
        fullName: `${user.firstName.concat(" ", user.lastName)}`,
        email: user.email,
        mobile: user.mobile,
      },
      token: jwt.token,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: err?.message || "Something went wrong!",
    });
  }
};
