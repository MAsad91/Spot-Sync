const { DOC_STATUS: { ACTIVE, INACTIVE, DELETE } } = require("../../constants")

module.exports = {
    $set: function (obj) { return { $set: obj } },
    $active: function ({ status }) { return { status: status ? status : ACTIVE } },
    $inactive: function ({ status }) { return { status: status ? status : INACTIVE } },
    $delete: function ({ status }) { return { status: status ? status : DELETE } }
}