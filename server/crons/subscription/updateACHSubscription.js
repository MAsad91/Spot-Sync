const moment = require("moment");
const SubscriptionCollection = require("../../models/subscriptions");
const PaymentCollection = require("../../models/payments");
const ReservationCollection = require("../../models/reservations");
const { DOC_STATUS } = require("../../constants");
const { get } = require("lodash");
const { getPaymentIntentDetails } = require("../../services/stripe");

const UpdateACHSubscriptions = async () => {
  try {
    const currentDate = moment().toDate();
    const query = {
      status: DOC_STATUS.ACTIVE,
      paymentMethodType: "ACH",
      subscriptionStatus: "initialize",
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    };

    const subscriptions = await SubscriptionCollection.find(query, {
      paymentId: 1,
      placeId: 1,
    })
      .populate({ path: "placeId" })
      .populate({ path: "paymentId", select: "transactionId" })
      .lean();

    if (!subscriptions.length) {
      console.log("No subscriptions to update.");
      return {
        success: true,
        message: "No subscriptions found for the current date.",
      };
    }

    const updates = subscriptions.map(async (subscription) => {
      const transactionId = get(subscription, "paymentId.transactionId");
      if (!transactionId) return null;

      try {
        const paymentDetails = await getPaymentIntentDetails({
          transactionId,
          place: subscription.placeId,
        });

        if (paymentDetails?.status === "succeeded") {
          await Promise.all([
            PaymentCollection.findByIdAndUpdate(
              subscription.paymentId._id,
              { paymentStatus: "success" },
              { new: true }
            ),
            ReservationCollection.findOneAndUpdate(
              { paymentId: subscription.paymentId._id },
              { status: "success" },
              { new: true }
            ),
          ]);

          await SubscriptionCollection.findByIdAndUpdate(
            subscription._id,
            {
              subscriptionStatus: "active",
              isReminderEmailSend: false,
            },
            { new: true }
          );
        }
      } catch (err) {
        console.error(
          `Error processing subscription ID: ${subscription._id}, Transaction ID: ${transactionId}`
        );
      }
    });

    await Promise.all(updates);

    return {
      success: true,
      message: "Subscriptions updated successfully!",
    };
  } catch (error) {
    console.error("Error in Update ACH Subscriptions:", error);
    return {
      success: false,
      message: error?.message || "Something went wrong!",
    };
  }
};

module.exports = UpdateACHSubscriptions;
