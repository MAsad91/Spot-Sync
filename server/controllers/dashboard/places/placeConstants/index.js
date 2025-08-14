const { $set, $active, $inactive } = require("./functions");

module.exports = {
    API_TYPES_ENUM: ['ACTIVE', 'INACTIVE', 'UPDATE'],
    API_TYPES: {
        ACTIVE:  $active,
        INACTIVE: $inactive,
        UPDATE: $set,
    }
}

