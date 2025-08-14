const { get } = require("lodash");
const {
  Types: { ObjectId },
} = require("mongoose");
const User = require("../../models/users");
const Notification = require("../../models/notifications");
const UserNotification = require("../../models/userNotifications");
const Place = require("../../models/places");
const { publishEvent } = require("./publisherService");


const SUPER_ADMIN = "Super Admin";
const BRAND_ADMIN = "Brand Admin";
const ADMIN = "Admin";
const ALL_USERS = "All Users";

// This function is used to create a notification object
// The notification object is created with the following parameters:
// title: The title of the notification
// content: The content of the notification
// placeId: The placeId of the notification
// userId: The userId of the notification, will be null if the notification is because of a customer event
//          i.e LicensePlate update, payment, etc.
// notificationObject: The object of the notification i.e Rate, LicensePlate, NewPayment
const createNotification = async ({ title, content, type, placeId, userId, notificationObject }) => {
  const roleLevel = await getUserRoleLevel(userId);
  const notificationScope = getNotificationScope(notificationObject, roleLevel);

  if (!notificationScope) {
    console.log("Action is taken by super admin so not creating any notification");
    return;
  }

  const notification = await Notification.create({
    title,
    content,
    type,
    placeId,
    notificationScope,
    linkOut: generateLink(notificationObject, placeId),
  });

  await createNotificationForUsers(notification, placeId, notificationScope);
};

const generateLink = (notificationObject, placeId) => {
  let link = "";
  switch (notificationObject) {
    case "Rate":
      link = `/rates`;
      break;
    case "LicensePlate":
      link = `/dashboard/license-plate/${placeId}`;
      break;
    default:
      link = null;
      break;
  }

  if (link) {
    link = link + `?placeId=${placeId}`;
  }

  return link;
}

const fetchNotificationObject = async (notificationId) => {
  const notification = await Notification.aggregate([
    {
      $match: { _id: notificationId }
    },
    {
      $lookup: {
        from: "places",
        localField: "placeId",
        foreignField: "_id",
        as: "place"
      }
    },
    {
      $unwind: "$place"
    },
    {
      $lookup: {
        from: "brands",
        localField: "place.brandId",
        foreignField: "_id",
        as: "brand"
      }
    },
    {
      $unwind: "$brand"
    },
    {
      $addFields: {
        brandName: "$brand.brandName",
        brandLogo: "$brand.brandLogo",
      }
    },
    {
      $project: {
        "place": 0,
        "brand": 0
      }
    }
  ]);

  return notification[0];
}

const createNotificationForUsers = async (notification, placeId, notificationScope) => {
  switch (notificationScope) {
    case SUPER_ADMIN:
      createNotificationForSuperAdmins(notification, placeId);
      break;
    case BRAND_ADMIN:
      createNotificationForBrandAdmins(notification, placeId);
      createNotificationForSuperAdmins(notification, placeId);
      break;
    case ADMIN:
      createNotificationForAdmins(notification, placeId);
      createNotificationForBrandAdmins(notification, placeId);
      createNotificationForSuperAdmins(notification, placeId);
      break;
    case ALL_USERS:
      createNotificationForAllUsers(notification, placeId);
      createNotificationForBrandAdmins(notification, placeId);
      createNotificationForSuperAdmins(notification, placeId);
      break;
  }
}

const createNotificationForSuperAdmins = async (notification, placeId) => {
  const superAdmins = await User.aggregate([
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "_id",
        as: "role"
      }
    },
    {
      $unwind: "$role"
    },
    {
      $match: {
        "role.level": 100
      }
    }
  ])

  superAdmins.forEach(async (superAdmin) => {
    await createNotificationForUser(superAdmin._id, notification, placeId);
  });
}

const createNotificationForBrandAdmins = async (notification, placeId) => {
  const place = await Place.findOne({ 
    _id: placeId 
  });

  await createNotificationForUser(place.userId, notification, placeId);
}

const createNotificationForAdmins = async (notification, placeId) => {
  const users = await User.aggregate([
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "_id",
        as: "role"
      }
    },
    {
      $unwind: "$role"
    },
    {
      $match: {
        "role.level": 100,
        "role.placeId": ObjectId(placeId),
      }
    }
  ])

  users.forEach(async (user) => {
    await createNotificationForUser(user._id, notification, placeId);
  });
}

const createNotificationForAllUsers = async (notification, placeId) => {
  const users = await User.aggregate([
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "_id",
        as: "role"
      }
    },
    {
      $unwind: "$role"
    },
    {
      $match: {
        "role.placeId": ObjectId(placeId),
      }
    }
  ])

  users.forEach(async (user) => {
    await createNotificationForUser(user._id, notification, placeId);
  });
}

const createNotificationForUser = async (userId, notification, placeId) => {
  const userNotification = await UserNotification.create({
    notificationId: notification._id,
    userId,
    placeId,
  });

  const notificationEntity = await fetchNotificationObject(notification._id);
  const publishableNotification = {
    _id: userNotification._id,
    status: userNotification.status,
    notification: notificationEntity,
  };

  publishEvent(publishableNotification, "push-notification-" + userId.toString());
}

const getUserRoleLevel = async (userId) => {
  const userData = await User.findOne(
    { _id: ObjectId(userId) },
    { roleId: 1 }
  ).populate("roleId");

  console.log("userData -->>>>>", userData);
  
  return get(userData, "roleId.level", null);
}

const getNotificationScope = (notificationObject, roleLevel) => {
  if (roleLevel === 100)
    return null;
  else if (roleLevel === 90)
    return SUPER_ADMIN;
  else if (roleLevel === 80)
    return BRAND_ADMIN;
  else if (roleLevel && roleLevel < 80)
    return ADMIN;
  else
    return ALL_USERS;

  // switch (notificationObject) {
  //   case "Rate":
  //     return getRateNotificationScope(roleLevel);
  //   case "LicensePlate":
  //     return getLicensePlateNotificationScope(roleLevel);
  //   default:
  //     return "all";
  // }
}

// const getRateNotificationScope = (userRole) => {
//   if (userRole === "Super Admin")
//     return null;
//   else if (userRole === "Brand Admin")
//     return "superAdmin";
//   else
//     return "Admin";
// }

// const getLicensePlateNotificationScope = (userRole) => {
//   return "all";
// }

module.exports = {
  createNotification,
}
