const { http200, http400 } = require("../../../global/errors/httpCodes");
const { Types: { ObjectId }, isValidObjectId } = require("mongoose");
const JazzCash = require("../../../services/jazzCash");
const Payments = require("../../../models/payments");
const Reservations = require("../../../models/reservations");
const Transaction = require("../../../models/transaction");
const { generateSerialNumber } = require("../../../global/functions");
const { sendEmail } = require("../../../services/email");
const { sendMessage } = require("../../../services/plivo");
const { capitalizeFirstLetter, amountToShow } = require("../../../global/functions");

module.exports = async (req, res) => {
  let success = false;
  try {
    const { body } = req;
    const { 
      subscriptionId, 
      customerId,
      amount,
      description,
      returnUrl,
      shortlyId 
    } = body;

    if (!subscriptionId || !isValidObjectId(subscriptionId)) {
      return res.status(http400).json({
        success,
        message: "Invalid subscription ID",
      });
    }

    if (!customerId || !isValidObjectId(customerId)) {
      return res.status(http400).json({
        success,
        message: "Invalid customer ID",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(http400).json({
        success,
        message: "Invalid amount",
      });
    }

    // Find the subscription and related data
    const subscription = await Reservations.findOne({
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

    // Initialize Jazz Cash service
    const jazzCash = new JazzCash(subscription.placeId);

    // Generate transaction ID
    const transactionId = `JC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment request
    const paymentData = {
      amount: amount,
      billReference: `SUB_${subscription._id}`,
      description: description || "Subscription payment via Jazz Cash",
      customerEmail: subscription.customerId.email,
      customerMobile: subscription.customerId.mobile,
      txnRefNo: transactionId,
      returnUrl: returnUrl || `${process.env.FRONT_DOMAIN}payment/jazzcash/callback`
    };

    const paymentResult = await jazzCash.createPaymentRequest(paymentData);

    if (!paymentResult.success) {
      return res.status(http400).json({
        success: false,
        message: paymentResult.message || "Failed to create Jazz Cash payment request",
      });
    }

    // Create transaction record
    const transactionObject = {
      transactionId: transactionId,
      locationId: subscription.placeId._id,
      status: "pending",
      userId: req.user ? req.user._id : null,
      paymentGateway: "jazz_cash",
      lotCode: subscription.placeId.lotCode || "",
      transactionDate: new Date(),
    };

    const transaction = await Transaction.create(transactionObject);

    // Create payment record
    const paymentObject = {
      customerId: subscription.customerId._id,
      purpose: "SUBSCRIPTION",
      subscriptionId: subscription._id,
      shortlyId: shortlyId || subscription.shortlyId,
      paymentMethodType: "jazz_cash",
      paymentStatus: "pending",
      placeId: subscription.placeId._id,
      licensePlate: subscription.licensePlate || [],
      baseRate: subscription.baseRate || 0,
      tax: subscription.tax || 0,
      serviceFee: subscription.serviceFee || 0,
      ownerPayout: subscription.ownerPayout || 0,
      applicationFee: subscription.applicationFee || 0,
      paymentGatewayFee: subscription.paymentGatewayFee || 0,
      totalAmount: amount,
      transactionId: transactionId,
      transactionDate: new Date(),
      paymentInfo: {
        jazzCashRequestData: paymentResult.requestData,
        paymentUrl: paymentResult.data.pp_RedirectURL || paymentResult.data.redirect_url
      },
    };

    const payment = await Payments.create(paymentObject);

    // Update subscription with payment ID
    await Reservations.findByIdAndUpdate(subscription._id, {
      paymentId: payment._id,
      transactionId: transactionId,
      paymentStatus: "pending"
    });

    return res.status(http200).json({
      success: true,
      message: "Jazz Cash payment request created successfully",
      data: {
        transactionId: transactionId,
        paymentUrl: paymentResult.data.pp_RedirectURL || paymentResult.data.redirect_url,
        paymentId: payment._id,
        amount: amount,
        currency: "PKR"
      },
    });

  } catch (error) {
    console.error("Jazz Cash payment error:", error);
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
}; 