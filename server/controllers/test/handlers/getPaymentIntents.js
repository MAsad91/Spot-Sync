const { http200, http400 } = require("../../../../global/errors/httpCodes");
const { ObjectId } = require("mongoose").Types;
const Subscription = require("../../../../models/subscriptions");

module.exports = async (req, res) => {
  try {
    const { subscriptionIds } = req.body;

    if (!subscriptionIds || !Array.isArray(subscriptionIds)) {
      return res.status(http400).json({
        success: false,
        message: "Subscription IDs array is required!",
      });
    }

    // Mock payment intents data for testing
    const paymentIntents = [
      {
        id: "pi_3PMrEvKCEdwqS3NJ1Y5MVDBb",
        object: "payment_intent",
        amount: 2100,
        amount_capturable: 0,
        amount_details: {
          tip: {},
        },
        amount_received: 2100,
        application: null,
        application_fee_amount: 91,
        automatic_payment_methods: null,
        canceled_at: null,
        cancellation_reason: null,
        capture_method: "automatic",
        client_secret:
          "pi_3PMrEvKCEdwqS3NJ1Y5MVDBb_secret_OhrmxNTv8n3vLBr2o79Aiii0S",
        confirmation_method: "automatic",
        created: 1717245653,
        currency: "usd",
        customer: "cus_PU3Yclf0fTwqXd",
        description: null,
        invoice: null,
        last_payment_error: null,
        latest_charge: "ch_3PMrEvKCEdwqS3NJ1pDNgyoe",
        livemode: true,
        metadata: {
          Purpose: "SUBSCRIPTION",
          email: "",
          mobile: "7089403746",
          parkingCode: "Mission Inn",
          paymentMethodType: "card",
          shortlyId: "",
          statement_descriptor: "Drive Hospitality",
          subscriptionId: "6631304e064eb29e8cc011e5",
        },
        next_action: null,
        on_behalf_of: null,
        payment_method: "pm_1OhPyFKCEdwqS3NJit2p9KVq",
        payment_method_configuration_details: null,
        payment_method_options: {
          card: {
            installments: null,
            mandate_options: null,
            network: null,
            request_three_d_secure: "automatic",
          },
        },
        payment_method_types: ["card"],
        processing: null,
        receipt_email: null,
        review: null,
        setup_future_usage: null,
        shipping: null,
        source: null,
        statement_descriptor: "Drive Hospitality",
        statement_descriptor_suffix: null,
        status: "succeeded",
        transfer_data: {
          destination: "acct_1OcaRSGaIshux8bl",
        },
        transfer_group: "group_pi_3PMrEvKCEdwqS3NJ1Y5MVDBb",
      },
    ];

    const response = subscriptionIds.map((subscriptionId) => {
      const paymentInfo = paymentIntents.find(
        (intent) => intent.metadata.subscriptionId === subscriptionId
      );
      return { subscriptionId, paymentInfo };
    });

    // Example of how to use Stripe with environment variables
    // const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    // const paymentIntents = await stripe.paymentIntents.search({
    //   query: "amount=2100",
    //   limit: 100,
    //   page: "next_page"
    // });

    return res.status(http200).json({
      success: true,
      message: "successfully!",
      total: subscriptionIds.length,
      response,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
}; 