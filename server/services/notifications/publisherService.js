const { get } = require("lodash");
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

const publishEvent = (notification, channelName) => {
  console.log("channel", channelName);
  console.log("Going to publish event", notification);
  pusher.trigger(channelName, "push-notification", notification);
  console.log("Event published");
};

module.exports = {
  publishEvent,
}
