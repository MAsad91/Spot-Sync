const ConnectedAccount = require("../../../../../models/connectAccounts");
const handleCreateConnectAccount = async (requestData) => {
    try {
        const createConnectAccountObject = {
            status: 10,
            paymentGateway: "Stripe SpotSync",
            title: requestData?.business_profile?.name,
            connectAccountId: requestData?.id
        };

        const existingAccount = await ConnectedAccount.findOne({ connectAccountId: requestData?.id });
        if (!existingAccount) {
            await ConnectedAccount.create(createConnectAccountObject);
        }
        return { success: true };
    } catch (error) {
        console.log("error in failed ----->", error);
        return {
            success: false,
            message: error?.message || "Something went wrong!",
        };
    }
};



module.exports = handleCreateConnectAccount;
