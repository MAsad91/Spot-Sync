const Slacks = require("../../../../../models/slacks");
const {
  http200,
  http400,
  http401,
  http403,
} = require("../../../../../global/errors/httpCodes");
const {
  Types: { ObjectId },
  isValidObjectId,
} = require("mongoose");
// const { API_TYPES, API_TYPES_ENUM } = require("../placeConstants");
const API_TYPES_ENUM = ["ACTIVE", "INACTIVE", "UPDATE"];
const API_TYPES = {
  ACTIVE: 10,
  INACTIVE: 1,
  // UPDATE: $set,
};

module.exports = async (req, res) => {
  let success = false;
  let update = {};
  try {
    const {
      userId,
      params: { placeId },
      body,
    } = req;
    if (!userId || !isValidObjectId(userId))
      return res.status(http403).json({
        success,
        message: "Invalid Token",
      });
    if (!placeId || !isValidObjectId(placeId))
      return res.status(http403).json({
        success,
        message: "Invalid place Id",
      });

    if (!body?.type)
      return res.status(http400).json({
        success,
        message: "type required!",
      });

    let { type, slackId, ...rest } = body;
    type = String(type).toUpperCase();

    if (!API_TYPES_ENUM.includes(type))
      return res.status(http400).json({
        success,
        message: "Invalid request type!",
      });

    // console.log(type, rest, "<<<<rest body");

    const filter = { _id: ObjectId(slackId), placeId: placeId };
    // update = API_TYPES[type](rest);
    const status = type === "ACTIVE" ? 10 : 1;
    update = { $set: { status } };


    const updatedSlack = await Slacks.updateOne(filter, update);

    if (updatedSlack.nModified === 0)
      return res.status(http200).json({
        success,
        message: "Slack already updated!",
      });

    return res.status(http200).json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error) {
    return res.status(http400).json({
      success,
      message: error?.message || "Something went wrong!",
    });
  }
};
