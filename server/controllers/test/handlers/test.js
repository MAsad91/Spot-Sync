const { http200, http400 } = require("../../../global/errors/httpCodes");
const subscriptions = require("../../../models/subscriptions");

function transformArray(currentArray) {
  return currentArray.map((item) => {
    const [firstName, lastName] = item["ParkerName "].split(" ");
    return {
      firstName: firstName,
      lastName: lastName,
      email: item["Parker Email"] || "",
      mobile: item["Parker Phone Number"] || "",
      baseRate: parseInt(item["Base Rate"]),
      isApplyServiceFee: item["Service Fee"] !== 0,
      isApplyTax: false,
      isDirectChargeSubscription: true,
      licensePlate: [
        {
          licensePlateNumber: item["License Plate"] || "",
          assignName: item["ParkerName "] || "",
          price: parseInt(item["Base Rate"]) * 100,
        },
      ],
    };
  });
}

module.exports = async (req, res) => {
  try {
    const subscriptionId = "6631593c48eb5bcb999cbff6";
    const subscriptionData = await subscription
      .findOne({
        _id: ObjectId(subscriptionId),
      })
      .populate("placeId customerId brandId");

    const baseRate = 150;
    const { customerId, placeId } = subscriptionData;
    const revenueModal = await getSubscriptionRevenueModel({
      baseRate: baseRate * 100,
      placeId: placeId._id,
      isApplyTax: get(subscriptionData, "isApplyTax", false),
      isApplyServiceFee: get(subscriptionData, "isApplyServiceFee", false),
      isApplyTaxOnServiceFee: get(
        subscriptionData,
        "isApplyTaxOnServiceFee",
        false
      ),
    });

    const licensePlate = [
      {
        status: 10,
        _id: "664c7837efecc705f065b2ca",
        licensePlateNumber: "375ZZV",
        assignName: "Daevin",
        price: 15000,
      },
    ];
    const duration = getSubscriptionDuration({
      startDate: subscriptionData.startDate,
      endDate: subscriptionData.endDate,
      timezone: getTimezoneName(),
    });
    const dates = getDatesFromDuration({ duration });
    const receiptNumber = await generateSerialNumber({ type: "receipt" });
    let receiptData = {
      transactionId: "pi_3PJGcwKCEdwqS3NJ1ZRc6W7T",
      serialNumber: receiptNumber,
      type: "receipt",
      subscriptionNumber: get(subscriptionData, "subscriptionNumber", ""),
      subscriptionType: get(subscriptionData, "isMonthly", false)
        ? "Monthly"
        : "Custom",
      toEmail: get(customerId, "email", ""),
      parkerName: `${get(customerId, "firstName", "")} ${get(
        customerId,
        "lastName",
        ""
      )}`,
      startDate: dates.startDate,
      endDate: dates.endDate,
      brandLogo: get(subscriptionData, "brandLogo", ""),
      tax: `${amountToShow(revenueModal.tax)}`,
      cityTax: `${amountToShow(revenueModal.cityTax)}`,
      countyTax: `${amountToShow(revenueModal.countyTax)}`,
      serviceFee: `${amountToShow(revenueModal.serviceFee)}`,
      total: `${amountToShow(revenueModal.totalAmount)}`,
      baseRate: `${amountToShow(revenueModal?.baseRate)}`,
      brandName: `${get(subscriptionData, "brandId.brandName", "")}`,
      brandAddress: `${get(subscriptionData, "brandId.brandAddress", "")}`,
      brandMobile: `${get(subscriptionData, "brandId.ownerMobileNumber", "")}`,
      companyName: `${get(subscriptionData, "customerId.companyName", "")}`,
      parkerEmail: `${get(subscriptionData, "customerId.email", "")}`,
      placeAddress: get(
        subscriptionData,
        "placeId.google.formatted_address",
        ""
      ),
      discount: 0,
      licensePlates: licensePlate,
      paymentDate: "05/22/2024",
    };
    console.log("receiptData ---->", receiptData);

    const update = await subscriptions.updateMany(
      {
        subscriptionStatus: "active",
      },
      [
        {
          $set: {
            invoiceURL: "$receiptURL",
          }
        }
      ]
    );
    

    const array = transformArray(currentArray);
    console.log("Array ===>", array);
    return res.status(http200).json({
      success: true,
      message: "successfully!",
      array,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
