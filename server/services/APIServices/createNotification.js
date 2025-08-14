const Notification = require("../../models/notifications");
const { http200, http400 } = require("../../global/errors/httpCodes");
const { isValidObjectId } = require("mongoose");
const Emitter = require("../../services/emitter");

const createNotification = async (params) => {
  let success = false;
  const adminId = process.env.SUPER_ADMIN_MONGOOSE_ID;
  try {
    const notification = await Notification.create(params);
    if (!notification)
      return {
        success,
        message: "Something went wrong!",
      };
    // if (params.isSuperAdminOnly) Emitter.emit(`notification`, {});
    Emitter.emit(`notification`, {});

    return {
      success: true,
      message: "Notification created successfully!",
    };
  } catch (error) {
    return {
      success,
      message: error?.message || "Something went wrong!",
    };
  }
};

module.exports = createNotification;
