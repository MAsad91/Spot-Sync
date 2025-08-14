import React, { useState } from "react";

import {
  Card,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
  Stack,
  Chip,
  LinearProgress,
} from "@mui/material";
// import { map } from "lodash";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// import DataTable from "examples/Tables/DataTable";

import { useMaterialUIController } from "context";
import moment from "moment";
import MDDropDown from "components/MDDropDown";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";

export default function AssignRateTable(props) {
  const { assignRates } = props;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [rowHight, setRowHight] = useState(30);
  const currentDay = moment().format("dddd").toLocaleLowerCase();
  const [selectedDay, setSelectedDay] = useState(currentDay);
  console.log("assignRates ====>", assignRates);

  const flattenedData = assignRates.flatMap((assignment) =>
    assignment.data.map((data) => ({
      rate: data.rate.displayName,
      rateType: data.rate.rateType,
      amount: data.rate.amount,
      hours: data.rate.hours,
      day: assignment.day,
      placeId: assignment.placeId,
      _id: data.rate._id,
      time: data.time,
    }))
  );

  const renderTimingChips = (timings) => {
    setRowHight(30 * timings.length);
    return (
      <Stack style={{ height: "100%", display: "flex", alignItems: "center" }}>
        {timings.map((t, index) => (
          <Chip
            key={index}
            label={`${moment(t.startTime, "hh:mm").format(
              "hh:mm A"
            )} - ${moment(t.endTime, "hh:mm").format("hh:mm A")}`}
            color={sidenavColor}
            style={{ margin: "2px" }}
          />
        ))}
      </Stack>
    );
  };

  const columnsData = [
    {
      field: "rate",
      headerName: "Rate",
      width: 150,
      editable: false,
    },
    {
      field: "rateType",
      headerName: "Rate Type",
      width: 150,
      editable: false,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 150,
      editable: false,
    },
    {
      field: "hours",
      headerName: "Hours",
      width: 150,
      editable: false,
    },
    {
      field: "time",
      headerName: "Timings",
      width: 250,
      editable: false,
      renderCell: (params) => renderTimingChips(params?.row.time),
    },
  ];

  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  return (
    <MDBox pt={2} pb={3}>
      <Grid container>
        <Grid item xs={12}>
          <Card>
            <MDBox
              mx={1}
              mt={-2}
              py={1}
              px={1}
              variant="gradient"
              borderRadius="lg"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            ></MDBox>
            <MDBox
              mx={1}
              mt={-2}
              py={2}
              px={1}
              variant="gradient"
              bgColor={sidenavColor}
              borderRadius="lg"
              coloredShadow={sidenavColor}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MDTypography variant="h6" color="white">
                Assign Rates
              </MDTypography>
              <FormControl>
                <InputLabel id="demo-simple-select-label">
                  Select Day
                </InputLabel>
                <MDDropDown
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  name="day"
                  variant="outlined"
                  value={selectedDay}
                  label="Select Day"
                  onChange={handleDayChange}
                >
                  <MenuItem value={"sunday"}>Sunday</MenuItem>
                  <MenuItem value={"monday"}>Monday</MenuItem>
                  <MenuItem value={"tuesday"}>Tuesday</MenuItem>
                  <MenuItem value={"wednesday"}>Wednesday</MenuItem>
                  <MenuItem value={"thursday"}>Thursday</MenuItem>
                  <MenuItem value={"friday"}>Friday</MenuItem>
                  <MenuItem value={"saturday"}>Saturday</MenuItem>
                </MDDropDown>
              </FormControl>
            </MDBox>
            <MDBox pt={2}>
              <MDDataGrid
                rows={flattenedData.filter(
                  (row) => selectedDay === "all" || row.day === selectedDay
                )}
                columns={columnsData}
                getRowId={(row) => row.day}
                pagination
                rowHeight={rowHight}
                page={page}
                pageSize={pageSize}
                paginationMode="server"
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                disableSelectionOnClick={true}
                components={{
                  LoadingOverlay: LinearProgress,
                }}
              />
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}
