const { http400 } = require("../global/errors/httpCodes");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const fields = {};
    const fieldsObj = {};
    error.details.forEach((detail) => {
      let message = detail.message;
      message = message.replace("{#limit}", detail.context.limit);
      if (
        detail.context.key === "password_confirmation" &&
        detail.type === "any.allowOnly"
      ) {
        message = `${detail.message}.password_confirmation`;
      }
      if (detail.path.length <= 1) {
        fields[detail.context.key] = message;
      } else {
        fieldsObj[detail.context.key] = message;
        fields[detail.path[0]] = fieldsObj;
      }
    });
    return res
      .status(http400)
      .json({ success: false, message: "Bad Request!", fields });
  } else {
    next();
  }
};
module.exports = validate;
