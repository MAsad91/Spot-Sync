const GeneralEventCollection = require("../../models/generalEvents");
const moment = require("moment");

const {
  Types: { ObjectId },
} = require("mongoose");
const axios = require("axios");

const ExecuteEvent = async () => {
  try {
    const now = moment().utc();
    const query = {
      status: "pending",
      executionDate: { $lt: now },
    };
    const events = await GeneralEventCollection.find(query).lean();
    if (!events || events.length === 0) {
      return { success: true, message: "No events to execute." };
    }

    let successCount = 0;
    const executionPromises = events.map(async (event) => {
      try {
        const { _id, APIEndPoint, requestPayload } = event;
        const response = await axios.post(APIEndPoint, requestPayload);
        let updateObject = {
          $inc: { executeCount: 1 },
          response: response,
        };
        if (response.status === 200) {
          updateObject = {
            status: "executed",
            $inc: { executeCount: 1 },
            response: response?.data,
          };
          successCount++;
        }
        await GeneralEventCollection.findOneAndUpdate(
          { _id: ObjectId(_id) },
          updateObject
        );
        return {
          success: true,
          message: response.data?.message || "Event executed",
        };
      } catch (error) {
        console.error(
          `Error executing event with ID ${event._id}:`,
          error.message
        );
        await GeneralEventCollection.findOneAndUpdate(
          { _id: ObjectId(event._id) },
          { $inc: { executeCount: 1 }, response: error.message }
        );
        return { success: false, message: error.message };
      }
    });
    await Promise.all(executionPromises);

    return {
      success: true,
      message: `Executed ${successCount} out of ${events.length} events successfully.`,
    };
  } catch (error) {
    console.error("Error in executing events:", error);
    return {
      success: false,
      message: error.message || "Something went wrong!",
    };
  }
};

module.exports = ExecuteEvent;
