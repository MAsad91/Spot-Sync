const {
    Types: { ObjectId },
} = require("mongoose");
const { http200, http400 } = require("../../../../global/errors/httpCodes");
const Subscriptions = require("../../../../models/subscriptions");

module.exports = async (req, res) => {
    try {
        const { userId, body } = req;
        const { subscriptionIds, isSubscriptionPaused, resumeDate } = body;

        if (!userId || !ObjectId.isValid(userId)) throw new Error("Invalid Token");

        const updateObject = isSubscriptionPaused
            ? { $set: { isSubscriptionPaused: false, resumeDate: null } } 
            : { $set: { isSubscriptionPaused: true, resumeDate: new Date(resumeDate) } };

        const result = await Subscriptions.updateMany(
            { _id: { $in: subscriptionIds.map(id => ObjectId(id)) } },
            updateObject
        );

        if (result.nModified === 0) {
            throw new Error("No subscriptions were updated");
        }

        return res
            .status(http200)
            .json({ success: true, message: `Subscription ${isSubscriptionPaused ? "Resumed" : "Paused"} successfully` });
    } catch (error) {
        return res.status(http400).json({
            success: false,
            message: error?.message ?? "Something went wrong!",
        });
    }
};
