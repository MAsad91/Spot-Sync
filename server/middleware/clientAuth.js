const User = require("../models/user");

// middleware to check if token is valid and has not expired
module.exports = async (req, res, next) => {
  // grab token from the request header
  const Authorization = req.header("Authorization");
  // if there is no token return error
  if (!Authorization)
    return res.status(401).json({ message: "" });
  try {
    // compare token
    const user = await User.findOne({ secretKey: Authorization });
    if (!user) {
      return res.status(401).json({ message: "Unathorized User" });
    }
    req.userId = user._id;
    // req.role = user.role;
    next();
  } catch (err) {
    // send error to client
    res.status(400).json({ message: "Invalid Authorization" });
  }
};
