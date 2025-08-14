const moment = require("moment-timezone");
const Reservation = require("../models/reservations");
const {
  Types: { ObjectId },
} = require("mongoose");

module.exports = {
  async getRateDuration({ rate, tz, hours, parentReservationId, isExtension }) {
    try {
      const rateType = rate.rateType;
      let currentDate = moment().tz(tz);

      if (isExtension) {
        const reservation = await Reservation.findOne({
          _id: ObjectId(parentReservationId),
        });
        currentDate = moment(reservation.endDate).tz(tz);
      }

      const isPass = rate.isPass;
      let startDate = currentDate;
      let endDate;

      const getNextDayOfWeek = (dayOfWeek, currentDate) => {
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const todayIndex = moment(currentDate).day();
        const targetIndex = daysOfWeek.indexOf(dayOfWeek);
        const diff = (targetIndex - todayIndex + 7) % 7;
        return moment(currentDate).add(diff, "days").startOf("day");
      };

      const addCustomDays = (endDay, currentDate) => {
        switch (endDay) {
          case "Next Day":
            return moment(currentDate).add(1, "day");
          case "Same Day":
            return moment(currentDate);
          case "Day after Tomorrow":
            return moment(currentDate).add(2, "days");
          default:
            return getNextDayOfWeek(endDay, currentDate);
        }
      };

      if (isPass) {
        const startTime = rate.startTime;
        const startDay = rate.startDay;
        startDate = addCustomDays(startDay, currentDate);
        startDate = moment(startDate).set({
          hour: parseInt(startTime.split(":")[0], 10),
          minute: parseInt(startTime.split(":")[1], 10),
          second: 0,
          millisecond: 0,
        });
      } else {
        startDate = moment(currentDate);
      }

      switch (rateType) {
        case "hourly":
          endDate = moment(currentDate).add(hours, "hours");
          break;

        case "daily":
          const rateHours = rate.hours;
          endDate = moment(currentDate).add(rateHours, "hours");
          break;

        case "custom":
          const timeType = rate?.timeType;
          const durationUnit = rate.hourUnit;
          const duration = rate.hours;

          if (timeType === "Fixed End Time") {
            const endTime = rate.endTime;
            const endDay = rate.endDay;
            endDate = addCustomDays(endDay, isPass ? startDate : currentDate);
            endDate = moment(endDate).set({
              hour: parseInt(endTime.split(":")[0], 10),
              minute: parseInt(endTime.split(":")[1], 10),
              second: 0,
              millisecond: 0,
            });
          } else if (timeType === "Custom Duration") {
            startDate = moment(rate.customStartDate).utc().tz(tz, true);
            endDate = moment(rate.customEndDate).utc().tz(tz, true);
          } else {
            endDate = moment(isPass ? startDate : currentDate);
            if (durationUnit === "MINUTES") {
              endDate.add(duration, "minutes");
            } else if (durationUnit === "HOURS") {
              endDate.add(duration, "hours");
            }
          }
          break;

        case "all_day":
          const endTime = rate.endTime;
          let fcd = moment.tz(moment(), tz).format("YYYY-MM-DD");
          endDate = moment.tz(
            `${fcd} ${endTime}`,
            "YYYY-MM-DD HH:mm",
            tz
          );
          /* const allDayEndTime = rate.endTime;
          endDate = moment(currentDate).startOf("day");
          endDate = moment.tz(
            `${endDate.format("YYYY-MM-DD")} ${allDayEndTime}`,
            "YYYY-MM-DD HH:mm",
            tz
          ); */
          break;

        case "overnight":
          const ET = rate.endTime;
          endDate = moment(currentDate).add(
            rate.endDay === "next_day" ? 1 : 0,
            "day"
           );
          endDate = moment.tz(endDate, tz).format("YYYY-MM-DD");
          endDate = moment.tz(`${endDate} ${ET}`, "YYYY-MM-DD HH:mm", tz);
          /* const overnightEndTime = rate.endTime;
          endDate = addCustomDays(rate.endDay);
          endDate = moment.tz(
            `${endDate.format("YYYY-MM-DD")} ${overnightEndTime}`,
            "YYYY-MM-DD HH:mm",
            tz
          ); */
          break;

        case "monthly":
          endDate = rate.isCustomSubscription ? moment(currentDate).clone().add(1, "month").add(-1, "day") : moment(currentDate).clone().endOf("month");
          break;

        default:
          throw new Error(`Unsupported rate type: ${rateType}`);
      }

      return {
        startDate: moment(startDate).format("MM/DD/YYYY hh:mm A"),
        endDate: moment(endDate).format("MM/DD/YYYY hh:mm A"),
        utcStartDate: moment(startDate).utc().format(),
        utcEndDate: moment(endDate).utc().format(),
      };
    } catch (error) {
      console.log("Error in getRateDuration --->", error.message);
      throw new Error("Failed to get rate duration");
    }
  },
}; 