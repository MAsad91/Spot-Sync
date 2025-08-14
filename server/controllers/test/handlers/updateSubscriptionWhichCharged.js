const moment = require("moment");
const { http200, http400 } = require("../../../global/errors/httpCodes");
const Subscription = require("../../../models/subscriptions");
const {
  Types: { ObjectId },
} = require("mongoose");

module.exports = async (req, res) => {
  try {
    const { body } = req;
    const subscriptionIds = [
      "663130aa064eb29e8cc01302",
      "663130cb064eb29e8cc0136b",
      "6631309c064eb29e8cc012d5",
      "663130bd064eb29e8cc0133e",
      "66313111064eb29e8cc01441",
      "663130ef064eb29e8cc013d4",
      "663130c1064eb29e8cc0134d",
      "66313116064eb29e8cc01450",
      "663130f8064eb29e8cc013f2",
      "663130f3064eb29e8cc013e3",
      "663130e9064eb29e8cc013c5",
      "66313108064eb29e8cc01423",
      "66313040064eb29e8cc011b8",
      "6631310d064eb29e8cc01432",
      "663130af064eb29e8cc01311",
      "663130a1064eb29e8cc012e4",
      "663130b4064eb29e8cc01320",
      "663130cf064eb29e8cc0137a",
      "663130b9064eb29e8cc0132f",
      "663130da064eb29e8cc01398",
      "6631304a064eb29e8cc011d6",
      "663130c6064eb29e8cc0135c",
      "6631306f064eb29e8cc0124e",
      "663130df064eb29e8cc013a7",
      "6631302b064eb29e8cc0117c",
      "6631305c064eb29e8cc01212",
      "66313035064eb29e8cc0119a",
      "663130a6064eb29e8cc012f3",
      "663130fd064eb29e8cc01401",
      "66313080064eb29e8cc0127b",
      "66313085064eb29e8cc0128a",
      "66313053064eb29e8cc011f4",
      "6631304e064eb29e8cc011e5",
      "66313061064eb29e8cc01221",
      "66313097064eb29e8cc012c6",
      "6631306a064eb29e8cc0123f",
      "66313066064eb29e8cc01230",
      "66313030064eb29e8cc0118b",
      "6631303c064eb29e8cc011a9",
      "66313089064eb29e8cc01299",
      "66313024064eb29e8cc01169",
      "6631308e064eb29e8cc012a8",
      "6631301b064eb29e8cc0114b",
      "66313079064eb29e8cc0126c",
      "66313045064eb29e8cc011c7",
      "6631301f064eb29e8cc0115a",
      "66313093064eb29e8cc012b7",
      "66313016064eb29e8cc0113c",
      "66313074064eb29e8cc0125d",
      "663130e4064eb29e8cc013b6",
      "66312fed064eb29e8cc010c4",
      "66312ff3064eb29e8cc010d3",
      "66312ff8064eb29e8cc010e2",
      "66312fe8064eb29e8cc010b5",
      "66312fe3064eb29e8cc010a6",
      "66313002064eb29e8cc01100",
      "66313010064eb29e8cc0112d",
      "66312fdf064eb29e8cc01097",
      "66313006064eb29e8cc0110f",
      "66312ffd064eb29e8cc010f1",
      "66312fc9064eb29e8cc0104c",
      "66312fdb064eb29e8cc01088",
      "66312fa4064eb29e8cc00fd4",
      "66312fd7064eb29e8cc01079",
      "66312fc4064eb29e8cc0103d",
      "66312fc0064eb29e8cc0102e",
      "66312fb6064eb29e8cc01010",
      "66312fa8064eb29e8cc00fe3",
      "66312fad064eb29e8cc00ff2",
      "66312fbb064eb29e8cc0101f",
      "66312f8b064eb29e8cc00f89",
      "66312f73064eb29e8cc00f3e",
      "66312f95064eb29e8cc00fa7",
      "66312eec064eb29e8cc00d9a",
      "66312f86064eb29e8cc00f7a",
      "66312f81064eb29e8cc00f6b",
      "66312f9a064eb29e8cc00fb6",
      "66312f90064eb29e8cc00f98",
      "66312f7c064eb29e8cc00f5c",
      "66312f9e064eb29e8cc00fc5",
      "66312f5b064eb29e8cc00ef3",
      "66312f64064eb29e8cc00f11",
      "66312f43064eb29e8cc00ea8",
      "66312f60064eb29e8cc00f02",
      "66312f6e064eb29e8cc00f2f",
      "66312f4d064eb29e8cc00ec6",
      "66312f48064eb29e8cc00eb7",
      "66312f3f064eb29e8cc00e99",
      "66312f52064eb29e8cc00ed5",
      "66312f68064eb29e8cc00f20",
      "66312f1d064eb29e8cc00e30",
      "66312f22064eb29e8cc00e3f",
      "66312f30064eb29e8cc00e6c",
      "66312f2b064eb29e8cc00e5d",
      "66312f17064eb29e8cc00e21",
      "66312f04064eb29e8cc00de5",
      "66312f26064eb29e8cc00e4e",
      "66312f0d064eb29e8cc00e03",
      "66312f13064eb29e8cc00e12",
      "66312eff064eb29e8cc00dd6",
    ];

    console.log("subscriptionIds ========>", subscriptionIds.length);
    const subscriptionObjectIds = subscriptionIds.map((id) => ObjectId(id));
    const query = {
      _id: { $in: subscriptionObjectIds },
    };
    const update = {
      isCharged: true,
    };

    const subscriptions = await Subscription.updateMany(query, update);

    // const subscriptionList = await Subscription.updateMany(query);
    console.log("subscriptions ====>", subscriptions);

    return {
      success: true,
      message: "Success",
    };
  } catch (error) {
    console.error("Error in reminder email send:", error);
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
