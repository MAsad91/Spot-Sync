const Discord = require("../../../../../models/discord");
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

const API_TYPES_ENUM = ["ACTIVE", "INACTIVE", "UPDATE"];

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

    let { type, discordId, ...rest } = body;
    type = String(type).toUpperCase();

    if (!API_TYPES_ENUM.includes(type))
      return res.status(http400).json({
        success,
        message: "Invalid request type!",
      });

    const filter = { _id: ObjectId(discordId), placeId: placeId };
    const status = type === "ACTIVE" ? 10 : 1;
    update = { $set: { status } };

    const updatedDiscord = await Discord.updateOne(filter, update);

    if (updatedDiscord.nModified === 0)
      return res.status(http200).json({
        success,
        message: "Discord already updated!",
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
