const { http200, http400 } = require('../../../global/errors/httpCodes')
const Reservation = require('../../../models/reservations')
const payments = require('../../../models/payments')
const Place = require('../../../models/places')
const {
  Types: { ObjectId }
} = require('mongoose')
const { get, isEmpty } = require('lodash')
const { refund } = require('../../../services/stripe')
const JazzCash = require('../../../services/jazzCash');
const EasyPaisa = require('../../../services/easyPaisa');

module.exports = async (req, res) => {
  try {
    const { transactionId, isClientFault, purpose, fullRefund } = req?.body
    let amount = req?.body?.amount
    const paymentData = await payments.findOne({
      transactionId: transactionId
    }).populate('placeId');

    if (!paymentData) {
      return res.status(http400).json({
        success: false,
        message: 'Transaction not found!'
      })
    }

    const isChargeAndTransferPayment = get(paymentData, "paymentInfo.extraParams.isChargeAndTransferPayment", false);

    if (fullRefund) {
      amount = paymentData.totalAmount
    }

    const alreadyRefunded = await payments.find({
      refundedAgainst: paymentData._id
    })

    const totalRefundedAmount = alreadyRefunded.reduce(
      (total, refund) => total + refund.totalAmount,
      0
    )

    if (totalRefundedAmount >= paymentData.totalAmount) {
      return res.status(http400).json({
        success: false,
        message: 'Full amount already refunded!'
      })
    }

    const primaryConnectAccountPayout = get(paymentData, "paymentInfo.extraParams.transferMetadata.primaryConnectAccountPayout", 0) * 100;
    if (isChargeAndTransferPayment && !fullRefund && amount > primaryConnectAccountPayout - totalRefundedAmount) {
      return res.status(http400).json({
        success: false,
        message: `Partial Refund is greater than threshold, you must do a full refund`
      })
    }

    if (amount > paymentData.totalAmount - totalRefundedAmount) {
      return res.status(http400).json({
        success: false,
        message: `Your remaining amount to refund is ${Math.floor(
          (paymentData.totalAmount - totalRefundedAmount)) /
          100
        }!`
      })
    }

    const paymentObj = {
      refundedAgainst: get(paymentData, '_id', false),
      totalAmount: amount,
      isClientFault: isClientFault,
      paymentStatus: 'refunded',
      transactionId: transactionId,
      purpose
    }

    const {
      _id: paymentId,
      updatedAt: paymentUpdatedAt,
      createdAt: paymentCreatedAt,
      ...paymentDataWithoutId
    } = paymentData.toObject()

    const newData = { ...paymentDataWithoutId, ...paymentObj }

    const params = {
      paymentIntent: transactionId,
      amount: amount,
      metadata: {},
      isChargeAndTransferPayment,
      fullRefund,
      paymentData,
      place: paymentData.placeId,
    }

    let paymentRefund = {};
    if (isEmpty(get(paymentData, 'stripeCustomerId')) &&
      !isEmpty(get(paymentData, 'paymentInfo.transactionResponse.accountNumber'))) {
      console.log("trying Pakistan payment gateway refund ===>");
      // Refund Pakistan payment gateway payment
      const paymentGateway = get(paymentData, 'paymentMethodType', '');
      
      if (paymentGateway === 'jazz_cash') {
        const jazzCash = new JazzCash(paymentData.placeId);
        // Jazz Cash refund logic would go here
        console.log("Jazz Cash refund not implemented yet");
        return res.status(http400).json({
          success: false,
          message: "Jazz Cash refund not implemented yet",
        });
      } else if (paymentGateway === 'easy_paisa') {
        const easyPaisa = new EasyPaisa(paymentData.placeId);
        // EasyPaisa refund logic would go here
        console.log("EasyPaisa refund not implemented yet");
        return res.status(http400).json({
          success: false,
          message: "EasyPaisa refund not implemented yet",
        });
      } else {
        return res.status(http400).json({
          success: false,
          message: "Unsupported payment gateway for refund",
        });
      }
    } else {
      console.log("trying stripe refund ===>");
      // Refund Stripe payment
      paymentRefund = await refund(params);
      newData.transactionId = paymentRefund.response?.id
      console.log("paymentRefund ===>", paymentRefund);
      if (!paymentRefund.success) {
        return res.status(http400).json({
          success: false,
          message: paymentRefund?.response?.message ? paymentRefund?.response?.message : "Something went wrong",
        });
      }

      newData.transactionId = paymentRefund.response?.id
    }

    const newPayment = await payments.create(newData)
    const paymentIdforReservation = newPayment._id
    const isFullyRefunded =
      totalRefundedAmount + amount >= paymentData.totalAmount

    if (isFullyRefunded) {
      await payments.updateOne(
        { transactionId: transactionId },
        { $set: { isFullyRefunded: true } }
      )
    }

    if (purpose === 'PARKING') {
      const reservationData = await Reservation.findOne({
        transactionId: transactionId,
        status: 'success'
      })

      const refundPayments = reservationData.refundPayments || []
      refundPayments.push(paymentIdforReservation)

      let updateObj = {
        refundPayments: refundPayments
      }

      if (isFullyRefunded) {
        updateObj = {
          ...updateObj,
          status: 'refunded'
        }
      }

      await Reservation.updateOne(
        { transactionId: transactionId },
        {
          $set: updateObj
        }
      )
    }

    return res.status(http200).json({
      success: true,
      message: 'Refunded Successfully'
    })
  } catch (error) {
    console.log('refundPayment error.message ===>', error?.message)
    console.log('refundPayment error.stack ===>', error?.stack)
    return res.status(http400).json({
      success: false,
      message: error?.message || 'Something went wrong!'
    })
  }
}
