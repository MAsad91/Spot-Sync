
module.exports = {
  $check_book_slot: function ({startTime, endTime}) {
    return {
      $or: [
        { 
          $and: [
            { startTime: { $lte: endTime } },  // Check if the start time is before or equal to the new rate's end time
            { endTime: { $gte: startTime} }     // Check if the end time is after or equal to the new rate's start time
          ]
        },
        {
          $and: [
            { startTime: { $gte: startTime} },  // Check if the start time is after or equal to the new rate's start time
            { endTime: { $lte: endTime } }    // Check if the end time is before or equal to the new rate's end time
          ]
        },
        {
          $and: [
            { startTime: { $lte: startTime } },  // Check if the start time is before or equal to the new rate's start time
            { endTime: { $gte: endTime } }    // Check if the end time is after or equal to the new rate's end time
          ]
        }
      ]
    }
  } 
  
}