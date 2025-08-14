const {
  isValidObjectId,
  Types: { ObjectId },
} = require("mongoose");
const {
  http200,
  http400,
  http401,
} = require("../../../../global/errors/httpCodes");
const RawSubscription = require("../../../../models/rawSubscriptions");

module.exports = async (req, res) => {
  try {
    const { userId, body } = req;

    if (!userId || !isValidObjectId(userId))
      return res
        .status(http401)
        .json({ success: false, message: "Invalid Token" });

    if (!body?.records || !Array.isArray(body?.records))
      return res.status(http401).json({
        success: false,
        message: "Invalid request",
      });

    let rawSubscriptionsRecords = [];

    body.records?.forEach((record) => {
      const licensePlateArray = record?.licensePlate
        ? record.licensePlate
            .split(",")
            .map((plateNumber) => ({ licensePlateNumber: plateNumber?.trim() }))
        : [];

      const obj = {
        name: record?.name || "",
        email: record?.email || "",
        phoneNumber: record?.mobile || "",
        licensePlate: licensePlateArray,
        amount: record?.amount || 0,
        userId: ObjectId(userId),
        isApplyTax: record?.applyTax === "" ? false : record?.applyTax,
        isApplyServiceFee:
          record?.applyServiceFee === "" ? false : record?.applyServiceFee,
        isAutoRenew: record?.isRecurring === "" ? false : record?.isRecurring,
        placeId: ObjectId(body?.placeId),
      };

      rawSubscriptionsRecords.push(RawSubscription.create(obj));
    });

    const data = await Promise.all(rawSubscriptionsRecords);
    return res
      .status(http200)
      .json({ success: true, message: "Bulk upload successfully" });
  } catch (error) {
    console.log("Error ====>", error);
    return res.status(http400).json({
      success: false,
      message: error?.message ?? "Something went wrong!",
    });
  }
};
