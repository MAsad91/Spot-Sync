const { $set, $active, $inactive, $delete } = require("./functions");

module.exports = {
    API_TYPES_ENUM: ['ACTIVE', 'INACTIVE', 'UPDATE', 'DELETE'],
    API_TYPES: {
        ACTIVE:  $active,
        INACTIVE: $inactive,
        DELETE: $delete,
        UPDATE: $set,
    }
}

