const { get } = require("lodash");

const getWithDefault = (object, path, defaultValue) => {
    const value = get(object, path, defaultValue);
    return value === undefined || value === null || value === "" ? defaultValue : value;
};

module.exports = {
    getWithDefault,
}
