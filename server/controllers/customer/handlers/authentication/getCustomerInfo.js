const Customers = require("../../../../models/customers");
const {
  http400,
  http200,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");

module.exports = {
  async getCustomerInfo(req, res) {
    let success = false;
    try {
      const { userId } = req;
      if (!userId || !isValidObjectId(userId))
        return res.status(http403).json({
          success,
          message: "Invalid Token",
        });
      const customer = await Customers.findOne({ _id: ObjectId(userId) });
      return res.status(http200).json({
        success: true,
        message: "Success",
        data: {
          _id: customer._id,
          fullName: `${customer?.firstName.concat(" ", customer?.lastName)}`,
          email: customer?.email,
          mobile: customer?.mobile,
          companyName: customer?.companyName,
        },
      });
    } catch (error) {
      return res.status(http400).json({
        success,
        message: error?.message || "Something went wrong!",
      });
    }
  },
};
