import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import moment from "moment";
// Material UI components
import {
  Card,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
  IconButton,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TableViewIcon from "@mui/icons-material/TableView";
// Custom components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import MDDropDown from "components/MDDropDown";
import AssignRatesToPlace from "./components/AssignRatesToPlace";
import AssignRatesTable from "./components/AssignRatesTable";
import BlackoutDateRatesToPlace from "./components/BlackoutDateRatesToPlace";
import SpecialEventsRates from "./components/SpecialEventRatesToPlace";
import CalenderView from "./components/CalenderView";
// Redux actions
import {
  getRatesByPlaceId,
  getAssignRatesByPlaceId,
  getCalenderDataByPlaceId,
  getAssignRatesTableDataByPlaceId
} from "store/slice/rates/rateSlice";
import { useMaterialUIController } from "context";

const AssignRates = () => {
  // State management using hooks
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const dispatch = useDispatch();
  const location = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blackoutDialogOpen, setBlackoutDialogOpen] = useState(false);
  const [specialEventDialogOpen, setSpecialEventDialogOpen] = useState(false);
  const [calenderView, setCalenderView] = useState(false);
  const currentDay = moment().format("dddd").toLowerCase();
  const [selectedDay, setSelectedDay] = useState(currentDay);

  // Redux store data
  const placesData = useSelector((state) => state.places?.selectedPlace);
  const ratesData = useSelector((state) => state.rates?.ratesByPlace);
  const assignRatesData = useSelector((state) => state.rates?.assignRates);
  const calenderData = useSelector((state) => state.rates?.calendarAssignRates);
  let placeId =
    placesData?._id || new URLSearchParams(location.search).get("placeId");

  useEffect(() => {
    dispatch(getRatesByPlaceId(placeId));
    dispatch(getAssignRatesByPlaceId(placeId));
    dispatch(getCalenderDataByPlaceId(placeId));
    dispatch(getAssignRatesTableDataByPlaceId(placeId))
  }, [dispatch, placeId]);

  // Handler for changing the selected day
  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={2} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={1}
                mt={2}
                py={1}
                px={1}
                bgColor={sidenavColor}
                borderRadius="lg"
                coloredShadow={sidenavColor}
                className="d-flex align-items-center gap-2"
              >
                <MDTypography
                  variant="h6"
                  color="white"
                  className="flex-grow-1"
                >
                  Assign Rates
                </MDTypography>

                {placeId && (
                  <>
                    <MDButton
                      variant="outlined"
                      size="small"
                      onClick={() => setDialogOpen(true)}
                    >
                      Assign Rates
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      size="small"
                      onClick={() => setSpecialEventDialogOpen(true)}
                    >
                      Special Events
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      size="small"
                      onClick={() => setBlackoutDialogOpen(true)}
                    >
                      Blackout Dates
                    </MDButton>
                  </>
                )}

                <IconButton
                  onClick={() => setCalenderView(!calenderView)}
                  color="white" // Changed to "inherit" to apply the white color from parent
                  disabled={!calenderData}
                >
                  {calenderView ? <TableViewIcon /> : <CalendarMonthIcon />}
                </IconButton>
              </MDBox>
              <MDBox pt={3} sx={{ mx: 3 }}>
                <Grid container spacing={2}>
                  <Grid
                    item
                    xs={12}
                    md={calenderView ? 12 : 9}
                    lg={calenderView ? 12 : 9}
                  >
                    <PlacePicker />
                  </Grid>
                  {!calenderView && (
                    <Grid item xs={12} md={3} lg={3}>
                      <FormControl fullWidth>
                        <InputLabel id="day-select-label">
                          Select Day
                        </InputLabel>
                        <MDDropDown
                          labelId="day-select-label"
                          id="day-select"
                          label="Select Day"
                          value={selectedDay}
                          onChange={handleDayChange}
                        >
                          {[
                            "sunday",
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                          ].map((day) => (
                            <MenuItem key={day} value={day}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </MenuItem>
                          ))}
                        </MDDropDown>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </MDBox>
              <MDBox pt={3}>
                {/* Dialogs for assigning rates, managing blackout dates, and special events */}
                <AssignRatesToPlace
                  placeId={placeId}
                  dialogOpen={dialogOpen}
                  ratesData={ratesData}
                  onClose={() => setDialogOpen(false)}
                  occupancy={placesData?.spaces}
                />
                <BlackoutDateRatesToPlace
                  placeId={placeId}
                  dialogOpen={blackoutDialogOpen}
                  updateParentData={ratesData}
                  onClose={() => setBlackoutDialogOpen(false)}
                />
                <SpecialEventsRates
                  placeId={placeId}
                  ratesData={ratesData}
                  dialogOpen={specialEventDialogOpen}
                  onClose={() => setSpecialEventDialogOpen(false)}
                  occupancy={placesData?.spaces}
                />
              </MDBox>
              <MDBox>
                {calenderView ? (
                  <CalenderView calenderData={calenderData} />
                ) : (
                  <AssignRatesTable
                    placeId={placeId}
                    selectedDay={selectedDay}
                    assignRatesData={assignRatesData || []}
                    
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default AssignRates;
