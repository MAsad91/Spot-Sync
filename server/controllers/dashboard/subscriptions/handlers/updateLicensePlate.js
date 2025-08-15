const Subscription = require("../../../../models/subscriptions");
const ReceiptCollection = require("../../../../models/receipts");
const Payment = require("../../../../models/payments");
const {
  http200,
  http400,
  http403,
} = require("../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
const { isEmpty, intersection, get } = require("lodash");
const {
  getSubscriptionRevenueModel,
  isDirectChargePayment,
} = require("../../../../services/revenue");
const {
  createPaymentIntentForACH,
  createPaymentIntent,
  getOrCreateDCCustomer,
  getStripeCustomerId,
} = require("../../../../services/stripe");
const {
  generateSerialNumber,
  getSubscriptionDuration,
  getTimezoneName,
  getDatesFromDuration,
  amountToShow,
  generateShortlyId,
} = require("../../../../global/functions");
const moment = require("moment");

const JazzCash = require("../../../../services/jazzCash");
const EasyPaisa = require("../../../../services/easyPaisa");
const SendAttachmentEmail = require("../../../../services/APIServices/sendAttachmentEmail");

module.exports = async (req, res) => {
  try {
    const {
      userId,
      params: { subscriptionId },
      body: { licensePlate, isChargeable },
    } = req;

    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(http403)
        .json({ success: false, message: "Invalid Token" });
    }

    if (!subscriptionId || !isValidObjectId(subscriptionId)) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid Request" });
    }

    if (!Array.isArray(licensePlate) || !licensePlate.length) {
      return res
        .status(http400)
        .json({ success: false, message: "Invalid License Plate data" });
    }

    const licensePlateNumbers = licensePlate.map((plate) =>
      plate.licensePlateNumber.toUpperCase()
    );

    const existLicensePlate = await Subscription.find({
      licensePlate: {
        $elemMatch: {
          licensePlateNumber: { $in: licensePlateNumbers },
          status: 10,
        },
      },
    });

    if (!isEmpty(existLicensePlate)) {
      const existingLicensePlates = existLicensePlate.flatMap((entry) =>
        entry.licensePlate.map((plate) => plate.licensePlateNumber)
      );
      const matchedLicensePlates = intersection(
        existingLicensePlates,
        licensePlateNumbers
      );

      if (matchedLicensePlates.length > 0) {
        return res.status(http400).json({
          success: false,
          message: `The following license plates are already subscribed: ${matchedLicensePlates.join(
            ", "
          )}`,
        });
      }
    }

    const subscriptionData = await Subscription.findOne({
      _id: ObjectId(subscriptionId),
    }).populate("paymentId customerId brandId placeId");

    if (!subscriptionData) {
      return res.status(http400).json({
        success: false,
        message: "Subscription not found",
      });
    }

    const {
      defaultPaymentMethodId,
      paymentId,
      customerId,
      paymentMethodType,
      placeId,
      isApplyTax,
      isApplyServiceFee,
      isApplyTaxOnServiceFee,
      subscriptionNumber,
      baseRate,
      taxPercentage,
      cityTaxPercentage,
      countyTaxPercentage,
    } = subscriptionData;

    let totalBaseRate = licensePlate.reduce((sum, item) => sum + item.price, 0);

    if (isChargeable) {
      const paymentMethod = defaultPaymentMethodId
        ? defaultPaymentMethodId
        : paymentId.paymentMethodId;

      const revenueModal = await getSubscriptionRevenueModel(
        {
          baseRate: totalBaseRate * 100,
          placeId: placeId._id,
          isApplyTax,
          isApplyServiceFee,
          isApplyTaxOnServiceFee,
        },
        subscriptionData.isDirectChargeSubscription
      );

      const licensePlateArray = licensePlate.map((plate) => ({
        licensePlateNumber: plate.licensePlateNumber.toUpperCase(),
        assignName: plate.assignName,
        price: plate.price * 100,
      }));

      const paymentObject = {
        customerId: customerId._id,
        purpose: "SUBSCRIPTION",
        subscriptionId: subscriptionData._id,
        stripeCustomerId: await getStripeCustomerId(customerId, placeId),
        paymentMethodId: paymentMethod,
        paymentMethodType,
        subscriptionNumber,
        placeId: placeId._id,
        licensePlate: licensePlateArray,
        isApplyTax,
        isApplyServiceFee,
        isApplyTaxOnServiceFee,
        paymentGatewayFeePayBy: subscriptionData.paymentGatewayFeePayBy,
        baseRate: revenueModal.baseRate,
        tax: revenueModal.tax,
        taxPercentage,
        cityTax: revenueModal.cityTax,
        cityTaxPercentage,
        countyTax: revenueModal.countyTax,
        countyTaxPercentage,
        serviceFee: revenueModal.serviceFee,
        ownerPayout: revenueModal.ownerPayout,
        isbpRevenue: revenueModal.isbpRevenue,
        applicationFee: revenueModal.applicationFee,
        paymentGatewayFee: revenueModal.paymentGatewayFee,
        totalAmount: revenueModal.totalAmount,
      };

      const directChargePayment = isDirectChargePayment(
        placeId,
        subscriptionData
      );
      const stripeProps = {
        total: revenueModal.totalAmount,
        applicationFeeAmount: revenueModal.applicationFee,
        connectedAccountId: get(
          subscriptionData,
          "placeId.connectAccountId",
          "acct_1OmGEqH75gj1EHDr"
        ),
        customerId: await getStripeCustomerId(customerId, placeId),
        customer: customerId,
        place: placeId,
        directChargePayment,
        currency: "usd",
        metadata: {
          mobile: get(customerId, "mobile", ""),
          email: get(customerId, "email", ""),
          subscriptionId: subscriptionData._id.toString(),
          Purpose: "SUBSCRIPTION",
          parkingCode: get(placeId, "parkingCode", ""),
          paymentMethodType,
          statement_descriptor: get(placeId, "statementDescriptor", false),
          isLicensePlateUpdate: true,
          placeAddress: get(placeId, "google.formatted_address", ""),
        },
        paymentMethodId: paymentMethod,
        statement_descriptor_suffix: get(placeId, "statementDescriptor", false),
      };

      let paymentIntent;
      let transactionDate = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      if (placeId.paymentGateway === "JAZZ_CASH") {
        const jazzCash = new JazzCash(placeId);
        paymentIntent = await jazzCash.chargeCustomer(
          subscriptionData.customerId,
          totalAmount / 100
        );
      } else {
        if (directChargePayment) {
          const connectAccountId = get(
            placeId,
            "connectAccountId",
            "acct_1OmGEqH75gj1EHDr"
          );
          const customerDCProfile = await getOrCreateDCCustomer(
            customerId,
            connectAccountId,
            paymentMethod,
            placeId
          );

          paymentObject.stripeCustomerId = customerDCProfile.customerId;
          paymentObject.paymentMethodId = customerDCProfile.paymentMethodId;
          paymentObject.isDirectCharge = true;
          paymentObject.connectAccountId = connectAccountId;
        }

        if (paymentMethodType === "ACH") {
          paymentIntent = await createPaymentIntentForACH(stripeProps);
        } else if (paymentMethodType === "card") {
          paymentIntent = await createPaymentIntent(stripeProps);
        }
      }

      if (!paymentIntent.success) {
        if (paymentIntent.data?.payment_intent?.created) {
          transactionDate = moment
            .unix(paymentIntent.data.payment_intent.created)
            .utc()
            .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        }
        paymentObject.paymentStatus = "failed";
        paymentObject.paymentInfo = paymentIntent.data;
        paymentObject.transactionDate = transactionDate;
        paymentObject.transactionId = paymentIntent.data?.payment_intent?.id;
        await Payment.create(paymentObject);
        return res.status(http400).json({
          success: false,
          message: "Payment Failed!",
        });
      } else {
        if (paymentIntent.data?.created) {
          transactionDate = moment
            .unix(paymentIntent.data.created)
            .utc()
            .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        }
        paymentObject.paymentStatus =
          paymentMethodType === "ACH"
            ? "initialize"
            : paymentMethodType === "card"
            ? "success"
            : "";
        const receiptNumber = await generateSerialNumber({ type: "receipt" });
        const duration = getSubscriptionDuration({
          startDate: subscriptionData.startDate,
          endDate: subscriptionData.endDate,
          timezone: getTimezoneName(),
        });
        const dates = getDatesFromDuration({ duration });
        let paymentGatewayFee = 0;
        if (get(placeId, "paymentGatewayFeePayBy", "isbp") === "customer") {
          if (
            subscriptionData.renewalCount === 0 &&
            subscriptionData.isMonthly
          ) {
            paymentGatewayFee = subscriptionData.firstMonthPaymentGatewayFee;
          } else {
            paymentGatewayFee = subscriptionData.paymentGatewayFee;
          }
        }
        const receiptData = {
          subscriptionNumber,
          subscriptionType: get(subscriptionData, "isMonthly", false)
            ? "Monthly"
            : "Custom",
          toEmail: get(customerId, "email", ""),
          parkerName: `${get(customerId, "firstName", "")} ${get(
            customerId,
            "lastName",
            ""
          )}`,
          startDate: dates.startDate,
          endDate: dates.endDate,
          brandLogo: get(subscriptionData, "brandLogo", ""),
          tax: `${amountToShow(revenueModal.tax)}`,
          cityTax: `${amountToShow(revenueModal.cityTax)}`,
          countyTax: `${amountToShow(revenueModal.countyTax)}`,
          serviceFee: `${revenueModal.serviceFee / 100}`,
          paymentGatewayFee: `${amountToShow(paymentGatewayFee)}`,
          total: `${amountToShow(revenueModal.totalAmount)}`,
          baseRate: `${amountToShow(revenueModal.baseRate)}`,
          brandName: `${get(subscriptionData, "brandId.brandName", "")}`,
          brandAddress: `${get(subscriptionData, "brandId.brandAddress", "")}`,
          brandMobile: `${get(
            subscriptionData,
            "brandId.ownerMobileNumber",
            ""
          )}`,
          companyName: `${get(subscriptionData, "customerId.companyName", "")}`,
          parkerEmail: `${get(subscriptionData, "customerId.email", "")}`,
          placeAddress: get(
            subscriptionData,
            "placeId.google.formatted_address",
            ""
          ),
          discount: 0,
          licensePlates: licensePlateArray,
          serialNumber: receiptNumber,
          type: "receipt",
          transactionId: paymentIntent.data?.id,
        };

        const receiptURL = `${process.env.FRONT_DOMAIN}sub-receipt?id=${receiptData.serialNumber}`;
        await ReceiptCollection.create(receiptData),
          console.log("receiptURL ---->", receiptURL);

        paymentObject.receiptURL = receiptURL;
        paymentObject.paymentInfo = paymentIntent.data;
        paymentObject.transactionId = paymentIntent.data?.id;
        paymentObject.transactionDate = transactionDate;
        await Payment.create(paymentObject);
        if (paymentMethodType === "card") {
          if (customerId.isEmailPrimary) {
            await SendAttachmentEmail({
              type: "paymentConfirmation",
              attachmentData: receiptData,
            });
          }
          const mobileNumber = get(customerId, "mobile", false);
          if (mobileNumber) {
            const plivoNumber = get(
              subscriptionData,
              "placeId.plivoNumber",
              false
            );
            const licensePlateArray = licensePlate.map(
              (obj) => obj.licensePlateNumber
            );
            const messageProps = {
              from: plivoNumber,
              to: mobileNumber,
              body: `
              Your payment for your parking subscription with ${get(
                subscriptionData,
                "brandId.brandName",
                ""
              )} at ${get(
                subscriptionData,
                "placeId.google.formatted_address",
                ""
              )} has been processed.
              Parker Name: ${get(
                subscriptionData,
                "customerId.firstName",
                ""
              )} ${get(subscriptionData, "customerId.lastName", "")}
              Amount: ${amountToShow(revenueModal.totalAmount)}
              License Plate(s): ${licensePlateArray}
              Start Date: ${dates.startDate}
              End Date: ${dates.endDate}
              To access a receipt for this transaction, please click on the button below and access your parker dashboard.
              https://portal.isbparking.bot/parker-login`,
            };
            await sendMessage(messageProps);
            const guideProps = {
              from: plivoNumber,
              to: mobileNumber,
              body: `
                To help you get acquainted with the Parker Dashboard, please click the link below for a step-by-step guide, containing useful tips and instructions on how to navigate your way through your dashboard.
                https://drive.google.com/file/d/1tOuAkESnRJ9LOhWX3sQU_577chpyUsU-/view?usp=drive_link
                `,
            };
            await sendMessage(guideProps);
          }
        }
      }
    }

    // Bulk Update license plates and subscription data
    const bulkOps = licensePlate.map((plate) => {
      const randomString = generateShortlyId();
      const externalKey = `${randomString}_${plate.licensePlateNumber}`;
      const updateDate = moment().utc().toDate();

      const update = {
        "licensePlate.$.licensePlateNumber":
          plate.licensePlateNumber.toUpperCase(),
        "licensePlate.$.assignName": plate.assignName,
        "licensePlate.$.price": plate.price * 100,
        "licensePlate.$.status": 10,
        "licensePlate.$.externalKey": externalKey,
        "licensePlate.$.ballparkValidateDate": updateDate,
      };
      if (plate._id) {
        return {
          updateOne: {
            filter: {
              _id: ObjectId(subscriptionId),
              "licensePlate._id": ObjectId(plate._id),
            },
            update: { $set: update },
          },
        };
      } else {
        return {
          updateOne: {
            filter: { _id: ObjectId(subscriptionId) },
            update: {
              $addToSet: {
                licensePlate: {
                  _id: new ObjectId(),
                  licensePlateNumber: plate.licensePlateNumber.toUpperCase(),
                  assignName: plate.assignName,
                  price: plate.price * 100,
                },
              },
            },
          },
        };
      }
    });

    await Subscription.bulkWrite(bulkOps);

    // Update Subscription Revenue Data
    const revenueModal = await getSubscriptionRevenueModel(
      {
        baseRate: baseRate + totalBaseRate * 100,
        taxPercentage,
        cityTaxPercentage,
        countyTaxPercentage,
        placeId: placeId._id,
        isApplyTax,
        isApplyServiceFee,
        isApplyTaxOnServiceFee,
      },
      subscriptionData.isDirectChargeSubscription
    );

    await Subscription.updateOne(
      { _id: ObjectId(subscriptionId) },
      {
        baseRate: revenueModal.baseRate,
        tax: revenueModal.tax,
        cityTax: revenueModal.cityTax,
        countyTax: revenueModal.countyTax,
        serviceFee: revenueModal.serviceFee,
        ownerPayout: revenueModal.ownerPayout,
        isbpRevenue: revenueModal.isbpRevenue,
        applicationFee: revenueModal.applicationFee,
        paymentGatewayFee: revenueModal.paymentGatewayFee,
        totalAmount: revenueModal.totalAmount,
        licensePlateGetUpdated: false,
      }
    );

    return res.status(http200).json({
      success: true,
      message: "License plate numbers updated successfully.",
    });
  } catch (error) {
    console.log("Error ====>", error.message);
    return res.status(http400).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
