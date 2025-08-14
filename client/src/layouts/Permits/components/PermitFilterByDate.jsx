import React, { useState, useEffect } from "react";
import { DateRangePicker } from "rsuite";
import moment from "moment";

const PermitFilterByDate = ({
  permitList,
  setFilteredPermit,
}) => {
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    const filterpermits = () => {
      const filtered = permitList.filter((item) => {
        if (!dateRange || dateRange.length < 2) return true; // Return all if no date range is selected or invalid

        // Assuming dateRange contains valid Date objects
        const rangeStart = moment(dateRange[0]).startOf("day"); // Ensures comparison at start of the day
        const rangeEnd = moment(dateRange[1]).endOf("day"); // Ensures comparison at end of the day

        // Parse dates from item; assume they are in ISO format for moment
        const itemStart = moment(item.startDate);
        const itemEnd = moment(item.endDate);

        return (
          itemStart.isSameOrAfter(rangeStart) &&
          itemEnd.isSameOrBefore(rangeEnd)
        );
      });

      setFilteredPermit(filtered);
    };

    filterpermits();
  }, [dateRange, setFilteredPermit, permitList]);

  const handleDateRangeChange = (value) => {
    setDateRange(value);
  };

  const clearDateRange = () => {
    setDateRange(null);
  };

  return (
    <>
      <DateRangePicker
        id="duration"
        placeholder="Start Date - End Date"
        character=" - "
        showOneCalendar={false}
        size="md"
        format="dd/MM/yyyy"
        ranges={[]}
        clearButton={true}
        value={dateRange}
        onChange={handleDateRangeChange}
        onOk={handleDateRangeChange}
        onClear={clearDateRange} // Add onClear prop
      />
    </>
  );
};

export default PermitFilterByDate;
