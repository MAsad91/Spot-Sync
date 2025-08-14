const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const createConnectAccount = require('./handlers/create-connected-account')
module.exports = async (request, response) => {
  try {
    const event = request.body;
    console.log('Stripe webhook connection established!');
    switch (event.type) {
      case 'account.updated':
        await createConnectAccount(event.data.object)
        console.log(`Connected account created: ${event.data.object}`);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return response.sendStatus(400);
  }

};
