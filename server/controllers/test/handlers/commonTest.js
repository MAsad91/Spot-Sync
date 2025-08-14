const { http200, http400 } = require("../../../global/errors/httpCodes");
const moment = require("moment");

module.exports = async (req, res) => {
  try {
    const {
      body: { records },
    } = req;

    const groupByEmailOrMobile = async (arr) => {
      const groupedData = {};

      arr.forEach((obj) => {
        const key = obj.email || obj.mobile;
        if (!groupedData[key]) {
          groupedData[key] = {
            email: obj.email ? obj.email.toLowerCase() : null,
            mobile: obj.mobile || null,
            firstName: obj.firstName,
            lastName: obj.lastName,
            paymentMethodType: obj.paymentMethodType,
            baseRate: 0,
            licensePlate: [],
            isApplyTax: obj.isApplyTax,
            isApplyServiceFee: obj.isApplyServiceFee,
            isAutoRenew: obj.isAutoRenew,
            isDirectCharge: obj.isDirectCharge,
            startDate: moment
              .utc(obj.endDate)
              .subtract(30, "days")
              .format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
            endDate: moment.utc(obj.endDate).format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
          };
        }

        groupedData[key].baseRate += parseFloat(obj.baseRate);
        groupedData[key].paymentMethodType =
          obj.paymentMethodType === "ACH" ? "ACH" : "card";
        groupedData[key].licensePlate.push({
          licensePlateNumber: obj.licensePlate,
          assignName: obj.assignName || "",
          price: obj.baseRate * 100,
        });
      });

      const outputArray = Object.values(groupedData);
      return outputArray;
    };

    const groupedData = await groupByEmailOrMobile(records);
    console.log("groupedData ===>", groupedData);

    return res.status(http200).json({
      success: true,
      message: "Successfully grouped records!",
      count: groupedData.length,
      groupedData,
    });
  } catch (error) {
    return res.status(http400).json({
      success: false,
      message: error?.message || "Something went wrong!",
    });
  }
};
