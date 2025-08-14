const SubscriptionCollection = require("../../../models/subscriptions");
const Place = require("../../../models/places");
const brands = require("../../../models/brands");
const Customer = require("../../../models/customers");
const Payment = require("../../../models/payments");
const Reservation = require("../../../models/reservations");
const axios = require("axios");
const {
  http200,
  http400,
  http401,
} = require("../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
} = require("mongoose");
const { DOC_STATUS } = require("../../../constants");
const { getPaymentMethodById } = require("../../../services/stripe");
const { get } = require("lodash");
const { getSubscriptionRevenueModel } = require("../../../services/revenue");
const { generateSerialNumber } = require("../../../global/functions");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { body } = req;
    const { subscriptionIds } = body;
    if (
      !subscriptionIds ||
      !Array.isArray(records) ||
      subscriptionIds.length === 0
    ) {
      return res.status(http400).json({
        success,
        message: "No subscription Ids",
      });
    }
    let count = 0;
    let invalidEmailOrMobiles = [];
    // console.log("records ===>", records.length);
    for (const subscription of records) {
      const {
        email,
        mobile,
        firstName,
        lastName,
        companyName,
        licensePlate,
        baseRate,
      } = subscription;

      const startDate = "2024-05-31T18:30:00.000+00:00";
      const endDate = "2024-06-30T18:29:59.999+00:00";

      const placeId = "667da40dbb48390ae4fd1c2c";
      const placeData = await Place.findOne(
        { _id: ObjectId(placeId) },
        { tax: 1, userId: 1, google: 1, applyTaxOnServiceFee: 1, plivoId: 1, stripeConfiguration: 1 }
      ).populate("plivoId");

      const brand = await brands.findOne({ userId: placeData.userId });

      const findQuery =
        email && email !== "" && mobile && mobile !== ""
          ? { email }
          : email && email !== ""
          ? { email }
          : { mobile };

      const insertObj = {
        ...findQuery,
        firstName: firstName,
        lastName: lastName,
        isEmailPrimary: email && email !== "" ? true : false,
        secondaryMobile: email && mobile ? mobile : "",
        status: DOC_STATUS.ACTIVE,
        brandId: brand._id,
        companyName: companyName ? companyName : "",
      };

      const customer = await Customer.findOneAndUpdateCustomer(findQuery, insertObj, {
        upsert: true,
        new: true,
      });

      let queryForPayment = {
        placeId: "651cdf40b28751390b797a19",
      };
      if (customer.isEmailPrimary) {
        queryForPayment.email = email.toLowerCase();
        queryForPayment.isEmail = true;
      } else {
        queryForPayment.email = mobile;
        queryForPayment.isPhone = true;
      }

      let stripeCustomerId = "";
      let paymentMethodId = "";
      const apiUrl = "https://api.spot-sync.com/subscription/placewise";
      const { data } = await axios.post(apiUrl, queryForPayment);
      console.log("Stripe customer Data ====>", data);
      stripeCustomerId = get(data, "latestSubscriptions.customerId", false);
      paymentMethodId = get(
        data,
        "latestSubscriptions.paymentProfileId",
        false
      );
      console.log("stripeCustomerId ====>", stripeCustomerId);
      console.log("paymentMethodId ====>", paymentMethodId);
      if (!stripeCustomerId && !paymentMethodId) {
        const value = queryForPayment.email;
        console.log("This email or mobile not found! ----->", value);
        invalidEmailOrMobiles.push(value);
      } else {
        let stripeCustomerIds = customer.stripeCustomerIds || {};
        const stripeConfigurationName = get(placeData, "stripeConfiguration.name", "default");
        stripeCustomerIds[stripeConfigurationName] = {
          customerId: stripeCustomerId,
          paymentMethodId
        };

        await Customer.findOneAndUpdateCustomer(
          { _id: customer._id },
          { $set: { stripeCustomerIds } }
        );

        const licensePlateArray = licensePlate.map((licensePlates) => ({
          licensePlateNumber: licensePlates.licensePlateNumber.toUpperCase(),
          assignName: licensePlates.assignName,
          price: licensePlates.price,
        }));
        const licensePlateCount = licensePlate.length;
        const revenueModal = await getSubscriptionRevenueModel({
          baseRate: baseRate * 100,
          placeId,
          isApplyTax: true,
          isApplyServiceFee: true,
          isApplyTaxOnServiceFee: get(placeData, "applyTaxOnServiceFee", false),
          licensePlateCount: licensePlateCount,
        });

        const subscriptionNumber = await generateSerialNumber({
          type: "subscription",
        });
        let reservationObject = {};
        let subscriptionObj = {
          customerId: customer._id,
          placeId: ObjectId(placeId),
          brandId: brand._id,
          brandLogo: brand.brandLogo,
          startDate,
          endDate,
          licensePlate: licensePlateArray,
          message: body.message ? body.message : "",
          baseRate: get(revenueModal, "baseRate", 0),
          tax: get(revenueModal, "tax", 0),
          taxPercentage: get(placeData, "subscriptionSurcharge.stateTax", 0),
          cityTax: get(revenueModal, "cityTax", 0),
          cityTaxPercentage: get(placeData, "subscriptionSurcharge.cityTax", 0),
          countyTax: get(revenueModal, "countyTax", 0),
          countyTaxPercentage: get(placeData, "subscriptionSurcharge.countyTax", 0),
          isApplyTaxOnServiceFee: get(placeData, "applyTaxOnServiceFee", false),
          paymentGatewayFeePayBy: get(
            placeData,
            "paymentGatewayFeePayBy",
            "isbp"
          ),
          serviceFee: get(revenueModal, "serviceFee", 0),
          ownerPayout: get(revenueModal, "ownerPayout", 0),
          isbpRevenue: get(revenueModal, "isbpRevenue", 0),
          applicationFee: get(revenueModal, "applicationFee", 0),
          paymentGatewayFee: get(revenueModal, "paymentGatewayFee", 0),
          totalAmount: get(revenueModal, "totalAmount", 0),
          isAutoRenew: true,
          isApplyTax: true,
          isMonthly: true,
          isApplyServiceFee: true,
          paymentMethodType: "credit card",
          defaultPaymentMethodId: paymentMethodId,
          subscriptionStatus: "active",
          isSubscriptionActive: true,
          renewalCount: 1,
          subscriptionNumber: subscriptionNumber,
        };

        const subscriptionCreate = await SubscriptionCollection.create(
          subscriptionObj
        );
        reservationObject.subscriptionId = subscriptionCreate._id;
        reservationObject.status = "paid";
        await Reservation.create(reservationObject);
        count++;
      }
    }

    return res.status(http200).json({
      success: true,
      message: `Successfully created ${records.length} out of ${count}`,
      countInvalidEmail: invalidEmailOrMobiles.length,
      invalidEmailOrMobiles,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
