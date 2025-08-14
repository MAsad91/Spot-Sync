const { http200, http400 } = require("../../../global/errors/httpCodes");
const {
  getPaymentMethods,
  createStripeCustomer,
  getStripeCustomerId,
} = require("../../../services/stripe");
const Customer = require("../../../models/customers");
const Place = require("../../../models/places");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { get } = require("lodash");
module.exports = async (req, res) => {
  try {
    const {
      params: { customerId },
      query: { placeId }
    } = req;
    const customer = await Customer.findOne({ _id: ObjectId(customerId) });
    if (!customer) {
      return res.status(http400).json({
        success: false,
        message: "Invalid Customer",
      });
    }

    let place = null;
    if (placeId && isValidObjectId(placeId)) {
      place = await Place.findOne({ _id: ObjectId(placeId) });
    }

    let stripeCustomerId = await getStripeCustomerId(customer, place);
    if (!stripeCustomerId) {
      const stripeResponse = await createStripeCustomer({
        email: customer.email,
        phone: customer.mobile,
        name: `${customer.firstName} ${customer.lastName}`,
        metadata: {
          email: get(customer, "email", ""),
          phone: get(customer, "mobile", ""),
        },
        place,
      });
      stripeCustomerId = get(stripeResponse, "id", false);
      let stripeCustomerIds = customer.stripeCustomerIds || {};
      const stripeConfigurationName = get(place, "stripeConfiguration.name", "default");
      stripeCustomerIds[stripeConfigurationName] = { customerId: stripeCustomerId };

      await Customer.findOneAndUpdateCustomer(
        { _id: customer._id },
        {
          $set: {
            stripeCustomerIds,
          },
        }
      );
    }

    const paymentMethods = await getPaymentMethods(stripeCustomerId, place);
    if (!paymentMethods.status) {
      return res.status(http400).json({
        success: false,
        message: "Invalid Customer",
      });
    }
    return res.status(http200).json({
      success: true,
      message: "Success",
      paymentMethods: paymentMethods.data,
      placeId: place?._id,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
