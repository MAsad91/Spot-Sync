const { http200, http400 } = require("../../../../global/errors/httpCodes");
const Customer = require("../../../../models/customers");
const Place = require("../../../../models/places");
const Authorizenet = require("../../../../services/authorizenet");
module.exports = async (req, res) => {
  try {
    const { customerId, placeId } = req.body;

    const customer = await Customer.findOne({ _id: customerId });
    if (!customer) {
        return res.status(http400).json({
            success: false,
            message: "Customer not found!",
        });
    }

    const place = await Place.findOne({ _id: placeId });
    if (!place) {
        return res.status(http400).json({
            success: false,
            message: "Place not found!",
        });
    }

    const authorizenet = new Authorizenet(place);
    const response = await authorizenet.getCustomerPaymentProfiles(customer);
    if (!response.success) {
        return res.status(http400).json({
            success: false,
            message: response.message,
        });
    }

    return res.status(http200).json({
        success: true,
        paymentProfiles: response.paymentProfiles
    });

  } catch (error) {
    console.log("error.message", error.message);
    console.log("error.stack", error.stack);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
