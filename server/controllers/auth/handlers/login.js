const { http400 } = require("../../../global/errors/httpCodes");
const Users = require("../../../models/users");
const Roles = require("../../../models/roles");
const AUTH = require("../../../services/auth");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

const Joi = require("joi");
const validate = require("../../../middleware/joiValidation");

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  async login(req, res) {
    try {
      validate(loginSchema);

      const { email, password } = req.body;
      if (!email || !password)
        return res
          .status(http400)
          .json({ message: "Please enter email and password" });
      const query = {
        email: { $regex: new RegExp(`^${email}$`, 'i') },
        // email: email.toLowerCase(),
      };
      const user = await Users.findOne(query);
      if (!user) {
        return res
          .status(http400)
          .json({ message: "Email not found. Please register" });
      }
      if (user && user.status === 1) {
        return res
          .status(http400)
          .json({ message: "Your account is suspended" });
      }
      const matchPassword = await AUTH.matchPassword({
        password,
        hashedPassword: user.password,
      });
      if (!matchPassword) {
        return res.status(http400).json({ message: "Please check email or password" });
      }
      const role = await Roles.findOne({ _id: ObjectId(user.roleId) });
      const jwt = await AUTH.createJWT({
        userId: user._id,
        roleId: user.roleId,
      });
      return res.json({
        success: true,
        data: {
          fullName: `${user.firstName.concat(" ", user.lastName)}`,
          email: user.email,
          mobile: user.mobile,
          roleId: user.roleId,
          roleTitle: role?.roleTitle,
        },
        token: jwt.token,
      });
    } catch (err) {
      return res.json({
        success: false,
        message: err?.message || "Something went wrong!",
      });
    }
  },
  async userToken(req, res) {
    try {
      const { email } = req.body;
      if (!email)
        return res.status(http400).json({ message: "Email is required!" });
      const query = {
        email: { $regex: new RegExp(`^${email}$`, 'i') },
       // email: email.toLowerCase(),
      };
      const user = await Users.findOne(query);
      if (!user) {
        return res.status(http400).json({ message: "Email not found." });
      }
      const jwt = await AUTH.createJWT({
        userId: user._id,
        roleId: user.roleId,
      });
      return res.json({
        success: true,
        token: jwt.token,
      });
    } catch (err) {
      return res.json({
        success: false,
        message: err?.message || "Something went wrong!",
      });
    }
  },
};
