const Counter = require("../../models/counters");

const increaseCounter = async ({ type }) => {
  try {
    if (!type || type.trim() === "") {
      return {
        success: false,
        message: "Type is required.",
      };
    }
    const allowedTypes = ["invoice", "receipt", "subscription", "transient", "permit"];
    if (!allowedTypes.includes(type)) {
      return {
        success: false,
        message:
          "Invalid type. Allowed types are 'invoice', 'receipt', and 'subscription'.",
      };
    }

    const incField = `${type}Counter`;
    const updateQuery = {
      $inc: { [incField]: 1, totalCounter: 1 },
    };

    const counter = await Counter.findOneAndUpdate(
      { status: true },
      updateQuery,
      { upsert: true, new: true }
    );

    if (!counter) {
      return {
        success: false,
        message: "Unable to find or create the counter document.",
      };
    }

    const responseCounter = counter[incField] || 0;
    return {
      success: true,
      message: "Counter incremented successfully",
      counter: responseCounter,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    };
  }
};

module.exports = increaseCounter;
