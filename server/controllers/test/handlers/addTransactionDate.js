const { get } = require("lodash");
const { http200, http400 } = require("../../../global/errors/httpCodes");
const PaymentCollection = require("../../../models/payments");
const moment = require("moment");

module.exports = async (req, res) => {
  try {
    const findQuery = {
      transactionDate: { $exists: false, $eq: null },
      paymentStatus: "failed",
    };

    const payments = await PaymentCollection.find(findQuery).limit(500);
    console.log("Records ====>", payments.length);
    if (payments.length === 0) {
      return res.status(http200).json({
        success: true,
        message: "No payments found",
      });
    }
    let count = 0;
    let transactionDate = moment().utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    for (const payment of payments) {
      const { paymentStatus, paymentInfo } = payment;
      if (paymentStatus === "failed") {
        const unixDate = get(paymentInfo, "payment_intent.created", false);
        if (unixDate) {
          transactionDate = moment
            .unix(unixDate)
            .utc()
            .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
          console.log("transactionDate ===>", transactionDate);
          payment.transactionDate = transactionDate;
          await payment.save();
          count++;
        }
      }
    }

    return res.status(http200).json({
      success: true,
      message: "Success",
      updatedCount: payments.length,
      count,
    });
  } catch (error) {
    console.log("error ---->", error);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
