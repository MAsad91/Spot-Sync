const { get } = require("lodash");
const { http200, http400, http403 } = require("../../../global/errors/httpCodes");
const { Types: { ObjectId }, isValidObjectId } = require("mongoose");
const Subscriptions = require("../../../models/subscriptions");
const Payments = require("../../../models/payments");
const Reservations = require("../../../models/reservations");
const Shortly = require("../../../models/shortly");
const Transaction = require("../../../models/transaction");
// Session model removed - no longer needed for chatbot functionality
const { generateSerialNumber } = require("../../../global/functions");
const { sendEmail } = require("../../../services/email");
const { sendMessage } = require("../../../services/plivo");
const { capitalizeFirstLetter, amountToShow } = require("../../../global/functions");
const { getSubscriptionDuration, getDatesFromDuration } = require("../../../global/functions");


module.exports = async (req, res) => {
  let success = false;
  try {
    const { body } = req;
    const { 
      subscriptionId, 
      cashPaymentCollectedBy, 
      customerId,
      shortlyId 
    } = body;

    if (!subscriptionId || !isValidObjectId(subscriptionId)) {
      return res.status(http400).json({
        success,
        message: "Invalid subscription ID",
      });
    }

    if (!cashPaymentCollectedBy || cashPaymentCollectedBy.trim() === "") {
      return res.status(http400).json({
        success,
        message: "Cash collector name is required",
      });
    }

    // Find the subscription
    const subscription = await Subscriptions.findOne({
      _id: new ObjectId(subscriptionId),
    }).populate({
      path: "customerId placeId brandId",
    });

    if (!subscription) {
      return res.status(http400).json({
        success,
        message: "Subscription not found",
      });
    }

    // Check if subscription is already paid
    if (subscription.isSubscriptionActive) {
      return res.status(http400).json({
        success,
        message: "Subscription is already active",
      });
    }

    const {
      isMonthly,
      placeId,
      brandId,
      firstMonthTax,
      tax,
      cityTax,
      firstMonthCityTax,
      countyTax,
      firstMonthCountyTax,
      firstMonthBaseRate,
      baseRate,
      firstMonthServiceFee,
      serviceFee,
      firstMonthOwnerPayout,
      ownerPayout,
      firstMonthIsbpRevenue,
      isbpRevenue,
      firstMonthApplicationFee,
      applicationFee,
      firstMonthPaymentGatewayFee,
      paymentGatewayFee,
      firstMonthTotalAmount,
      totalAmount,
    } = subscription;

    let revenue = {
      tax: isMonthly ? firstMonthTax : tax,
      cityTax: isMonthly ? firstMonthCityTax : cityTax,
      countyTax: isMonthly ? firstMonthCountyTax : countyTax,
      serviceFee: isMonthly ? firstMonthServiceFee : serviceFee,
      baseRate: isMonthly ? firstMonthBaseRate : baseRate,
      ownerPayout: isMonthly ? firstMonthOwnerPayout : ownerPayout,
      isbpRevenue: isMonthly ? firstMonthIsbpRevenue : isbpRevenue,
      applicationFee: isMonthly ? firstMonthApplicationFee : applicationFee,
      paymentGatewayFee: isMonthly ? firstMonthPaymentGatewayFee : paymentGatewayFee,
      totalAmount: isMonthly ? firstMonthTotalAmount : totalAmount,
    };

    // Generate receipt and subscription numbers
    const receiptNumber = await generateSerialNumber({ type: "receipt" });
    const subscriptionNumber = await generateSerialNumber({ type: "subscription" });
    
    // Generate transaction ID for cash payment
    const transactionId = `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record
    const transactionObject = {
      transactionId: transactionId,
      locationId: placeId._id,
      status: "success",
      userId: req.user ? req.user._id : null, // Vendor/admin who processed the cash payment
      paymentGateway: "cash",
      lotCode: get(placeId, "lotCode", ""),
      transactionDate: new Date(),
    };

    const transaction = await Transaction.create(transactionObject);

    // Create payment record
    const paymentObject = {
      customerId: subscription.customerId._id,
      purpose: "SUBSCRIPTION",
      subscriptionId: subscription._id,
      shortlyId: shortlyId || get(subscription, "shortlyId", ""),
      paymentMethodType: "cash",
      paymentStatus: "succeeded",
      placeId: placeId._id,
      licensePlate: get(subscription, "licensePlate", []),
      isApplyTax: get(subscription, "isApplyTax", false),
      isApplyServiceFee: get(subscription, "isApplyServiceFee", false),
      isApplyTaxOnServiceFee: get(subscription, "isApplyTaxOnServiceFee", false),
      paymentGatewayFeePayBy: subscription.paymentGatewayFeePayBy,
      baseRate: get(revenue, "baseRate", 0),
      tax: get(revenue, "tax", 0),
      taxPercentage: get(subscription, "taxPercentage", 0),
      cityTax: get(revenue, "cityTax", 0),
      cityTaxPercentage: get(subscription, "cityTaxPercentage", 0),
      countyTax: get(revenue, "countyTax", 0),
      countyTaxPercentage: get(subscription, "countyTaxPercentage", 0),
      serviceFee: get(revenue, "serviceFee", 0),
      ownerPayout: get(revenue, "ownerPayout", 0),
      isbpRevenue: get(revenue, "isbpRevenue", 0),
      applicationFee: get(revenue, "applicationFee", 0),
      paymentGatewayFee: get(revenue, "paymentGatewayFee", 0),
      totalAmount: get(revenue, "totalAmount", 0),
      transactionId: transactionId,
      transactionDate: new Date(),
      paymentInfo: {
        cashPaymentCollectedBy,
        cashPaymentCollectedAt: new Date(),
        receiptNumber,
      },
    };

    const payment = await Payments.create(paymentObject);

    // Create reservation object
    const reservationObject = {
      licensePlate: subscription.licensePlate.map(plate => plate.licensePlateNumber),
      placeId: placeId._id,
      brandId: brandId._id,
      subscriptionId: subscription._id,
      shortlyId: shortlyId || get(subscription, "shortlyId", ""),
      baseRate: get(revenue, "baseRate", 0),
      totalAmount: get(revenue, "totalAmount", 0),
      isbpRevenue: get(revenue, "isbpRevenue", 0),
      serviceFee: get(revenue, "serviceFee", 0),
      ownerPayout: get(revenue, "ownerPayout", 0),
      paymentGatewayFee: get(revenue, "paymentGatewayFee", 0),
      applicationFee: get(revenue, "applicationFee", 0),
      tax: get(revenue, "tax", 0),
      cityTax: get(revenue, "cityTax", 0),
      countyTax: get(revenue, "countyTax", 0),
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      purpose: "SUBSCRIPTION",
      paymentMethodType: "cash",
      paymentStatus: "paid",
      paymentId: payment._id,
      customerId: subscription.customerId._id,
      transactionId: transactionId,
      transactionDate: new Date(),
    };

    // Update subscription to active
    const subscriptionResponse = await Subscriptions.findOneAndUpdate(
      { _id: new ObjectId(subscriptionId) },
      {
        isSubscriptionActive: true,
        paymentId: payment._id,
        subscriptionNumber,
        subscriptionStatus: "active",
        paymentMethodType: "cash",
        isCashPayment: true,
        cashPaymentCollectedBy,
        cashPaymentCollectedAt: new Date(),
        cashPaymentReceiptNumber: receiptNumber,
        isEmailSend: true,
        isSMSSend: true,
        isBallparkUpdate: true,
        isSlackUpdate: true,
      },
      { new: true }
    );

    // Create reservation
    const shortlyData = shortlyId ? await Shortly.findOne({ shortlyId }) : null;
    if (shortlyData) {
      reservationObject.noOfPasses = shortlyData.noOfPasses;

    }

    await Reservations.create(reservationObject);

    // Send confirmation email and SMS
    const duration = getSubscriptionDuration({
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      timezone: get(placeId, "timeZoneId", ""),
    });
    const dates = getDatesFromDuration({ duration });
    const licensePlates = subscription.licensePlate.map(plate => plate.licensePlateNumber).join(", ");

    // Send email
    await sendEmail({
      to: subscription.customerId.email,
      subject: "Cash Payment Confirmation - Subscription Activated",
    })()({
      startDate: dates.startDate,
      endDate: dates.endDate,
      brandName: brandId.brandName,
      brandLogo: brandId.brandLogo,
      placeAddress: get(placeId, "google.formatted_address", ""),
      parkerName: capitalizeFirstLetter(
        `${subscription.customerId.firstName} ${subscription.customerId.lastName}`
      ),
      licensePlates: licensePlates,
      amount: `${amountToShow(
        subscription.isMonthly
          ? subscription.firstMonthTotalAmount
          : subscription.totalAmount
      )}`,
      autoRenewal: subscription.isAutoRenew ? "Yes" : "No",
      receiptNumber: receiptNumber,
      subscriptionNumber: subscriptionNumber,
      cashPaymentCollectedBy: cashPaymentCollectedBy,
      message: "Your subscription has been activated with cash payment.",
    });

    // Send SMS
    const mobileNumber = get(subscription.customerId, "mobile", false);
    if (mobileNumber) {
      const plivoNumber = get(placeId, "plivoNumber", false);
      if (plivoNumber) {
        const props = {
          from: plivoNumber,
          to: mobileNumber,
          body: `Your subscription has been activated with cash payment. Receipt #: ${receiptNumber}. Subscription #: ${subscriptionNumber}`,
        };
        await sendMessage(props);
      }
    }

    return res.status(http200).json({
      success: true,
      message: "Cash payment processed successfully",
      data: {
        subscriptionId: subscription._id,
        receiptNumber,
        subscriptionNumber,
        totalAmount: get(revenue, "totalAmount", 0),
        cashPaymentCollectedBy,
        cashPaymentCollectedAt: new Date(),
      },
    });

  } catch (error) {
    console.error("Cash payment error:", error);
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
}; 