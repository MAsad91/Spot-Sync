const SubscriptionCollection = require("../../../models/subscriptions");
const Place = require("../../../models/places");
const brands = require("../../../models/brands");
const Customer = require("../../../models/customers");
const Payment = require("../../../models/payments");
const {
  http200,
  http400,
  http401,
} = require("../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
} = require("mongoose");
const { DOC_STATUS } = require("../../../constants");
const {
  createStripeCustomer,
  getPaymentMethodById,
} = require("../../../services/stripe");
const { get } = require("lodash");
const { getSubscriptionRevenueModel } = require("../../../services/revenue");
const { generateSerialNumber } = require("../../../global/functions");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { body } = req;
    const { records } = body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(http400).json({
        success,
        message: "No subscription data provided or data format is incorrect",
      });
    }
    let count = 0;
    for (const subscription of records) {
      const {
        email,
        mobile,
        firstName,
        lastName,
        companyName,
        licensePlate,
        baseRate,
        isApplyTax,
        isApplyServiceFee,
        paymentMethodType,
        stripeCustomerId,
        paymentMethodId,
      } = subscription;

      const startDate = "2024-03-31T18:30:00.000+00:00";
      const endDate = "2024-04-30T18:29:59.999+00:00";
      // const stripeCustomerId = "cus_PyHXND3zanndDv";
      // const paymentMethodId =
      //   paymentMethodType === "ACH"
      //     ? "pm_1PAqbvKCEdwqS3NJ3ST53pbc"
      //     : "pm_1P8y6qKCEdwqS3NJLHYSpDfo";

      const placeId = "662f8f57dc55533a53bd143b";
      const placeData = await Place.findOne(
        { _id: ObjectId(placeId) },
        { tax: 1, userId: 1, google: 1, applyTaxOnServiceFee: 1, plivoId: 1 }
      ).populate("plivoId");

      const props = {
        customerId: stripeCustomerId,
        paymentMethodId,
        place: placeData,
      };
      const paymentMethodData = await getPaymentMethodById(props);
      console.log("paymentMethodData ====>", paymentMethodData);
      const paymentObject = {
        paymentMethodType,
        paymentStatus: "success",
        stripeCustomerId,
        paymentMethodId,
        paymentInfo: {
          payment_method_details: paymentMethodData.data,
        },
      };

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
        stripeCustomerId: stripeCustomerId,
      };

      const customer = await Customer.findOneAndUpdateCustomer(findQuery, insertObj, {
        upsert: true,
        new: true,
      });
      paymentObject.customerId = customer._id;
      const licensePlateArray = licensePlate.map((licensePlates) => ({
        licensePlateNumber: licensePlates.licensePlateNumber.toUpperCase(),
        assignName: licensePlates.assignName,
        price: licensePlates.price,
      }));
      const licensePlateCount = licensePlate.length;
      console.log("licensePlateCount===>", licensePlateCount);
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
        taxPercentage: get(placeData, "tax", 0),
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
        isApplyServiceFee: true,
        isMonthly: true,
        paymentMethodType,
        defaultPaymentMethodId: paymentMethodId,
        subscriptionStatus: "active",
        isSubscriptionActive: true,
        renewalCount: 1,
        subscriptionNumber: subscriptionNumber,
      };

      const subscriptionCreate = await SubscriptionCollection.create(
        subscriptionObj
      );
      paymentObject.subscriptionId = subscriptionCreate._id;
      console.log("paymentObject ----->", paymentObject);
      await Payment.create(paymentObject);
      count++;
    }

    return res.status(http200).json({
      success: true,
      message: `Successfully created ${records.length} out of ${count}`,
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
