import {
  Card,
  Grid,
  Icon,
  AppBar,
  Tabs,
  Tab,
  FormControl,
  Button,
} from "@mui/material";
import breakpoints from "assets/theme/base/breakpoints";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMaterialUIController } from "context";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import { useEffect, useState } from "react";
import ReservationsTable from "./reservationTable";
import ReservationSearch from "./ReservationSearch";
import ReservationFilterByDate from "./ReservationFilterByDate";
import { getReservationStatistics } from "store/slice/reservation/reservationSlice";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import RadialSeparators from "./RadialSeparators";
import OccupancyDialog from "./OccupancyDialog";
import CreateReservation from "./CreateReservationDialog";
import MDButton from "components/MDButton";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <MDBox sx={{ p: 3 }}>{children}</MDBox>}
    </div>
  );
}

const Reservation = () => {
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const location = useLocation();
  const navigate = useNavigate();
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab");
  const [tabValue, setTabValue] = useState(activeTab ? activeTab : "all");
  const [page, setPage] = useState(0);
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  const occupiedPercentage = selectedPlace?.occupiedPercentage || 0;
  const [occupancyDialogOpen, setOccupancyDialogOpen] = useState(false);
  const [createReservationDialogOpen, setCreateReservationDialogOpen] = useState(false);

  let placeId = selectedPlace?._id;
  const tz = selectedPlace?.timeZoneId || "America/Los_Angeles";
  if (!placeId) {
    placeId = localStorage.getItem("placeId");
  }
  const [filterOptions, setFilterOptions] = useState({
    pageNo: page,
    status: "all",
    placeId,
    startDate: "",
    endDate: "",
    search: "",
  });

  const [isRefundIssued, setIsRefundIssued] = useState(false);
  useEffect(() => {
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    window.addEventListener("resize", handleTabsOrientation);
    handleTabsOrientation();
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  useEffect(() => {
    dispatch(getReservationStatistics(placeId));
  }, [dispatch, tabValue, isRefundIssued, placeId]);

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    queryParams.set("tab", newValue);
    const updatedQueryString = queryParams.toString();
    navigate(`?${updatedQueryString}`);
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
                mt={-2}
                py={1}
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
                  Reservation
                </MDTypography>
                <MDButton
                  variant="outlined"
                  size="small"
                  onClick={() => setCreateReservationDialogOpen(true)}
                >
                  Create
                </MDButton>
              </MDBox>
              <MDBox p={2}>
                <Grid container display="flex" justifyContent="space-around">
                  <Grid item xs={12} md={8}>
                    <>
                      <FormControl fullWidth>
                        <PlacePicker />
                      </FormControl>
                      <FormControl fullWidth sx={{ my: 1 }}>
                        <ReservationFilterByDate
                          filterOptions={filterOptions}
                          setFilterOptions={setFilterOptions}
                        />
                      </FormControl>
                      <FormControl fullWidth>
                        <ReservationSearch
                          filterOptions={filterOptions}
                          setFilterOptions={setFilterOptions}
                        />
                      </FormControl>
                    </>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDBox display="flex" justifyContent="space-around">
                      <MDBox
                        component="button"
                        sx={{
                          mt: 1,
                          width: 120,
                          height: 120,
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setOccupancyDialogOpen(true);
                          console.log("clicked ====>");
                        }}
                      >
                        <CircularProgressbarWithChildren
                          value={occupiedPercentage}
                          text={`${occupiedPercentage}%`}
                          strokeWidth={10}
                          styles={buildStyles({
                            strokeLinecap: "butt",
                          })}
                        >
                          <div style={{ fontSize: 10, marginTop: 40 }}>
                            <strong>Occupancy</strong>
                          </div>
                          <RadialSeparators
                            count={12}
                            style={{
                              background: "#fff",
                              width: "2px",
                              height: `${10}%`,
                            }}
                          />
                        </CircularProgressbarWithChildren>
                      </MDBox>
                      <MDBox
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                      >
                        <MDTypography variant="caption" fontWeight="regular">
                          Space : {selectedPlace?.spaces || 0}
                        </MDTypography>
                        <MDTypography variant="caption" fontWeight="regular">
                          Parked Vehicles :
                          {selectedPlace?.activeLicensePlateCount || 0}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>

              <MDBox p={2}>
                <Grid container spacing={1}>
                  {placeId && (
                    <Grid item xs={12} md={12} lg={12} sx={{ ml: "auto" }}>
                      <AppBar position="static">
                        <Tabs
                          orientation={tabsOrientation}
                          value={tabValue}
                          onChange={handleSetTabValue}
                        >
                          <Tab
                            label="All"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}></Icon>
                            }
                            value="all"
                          />
                          <Tab
                            label="Paid"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}></Icon>
                            }
                            value="success"
                          />
                          <Tab
                            label="Failed"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}></Icon>
                            }
                            value="failed"
                          />
                          <Tab
                            label="Refunded"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}></Icon>
                            }
                            value="refunded"
                          />
                        </Tabs>
                      </AppBar>
                      <TabPanel value={tabValue} index="all">
                        <ReservationsTable
                          placeId={placeId}
                          startDate={filterOptions.startDate}
                          endDate={filterOptions.endDate}
                          searchText={filterOptions.search}
                          activeTab={tabValue}
                          tz={tz}
                          setIsRefundIssued={setIsRefundIssued}
                          isRefundIssued={isRefundIssued}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="success">
                        <ReservationsTable
                          placeId={placeId}
                          startDate={filterOptions.startDate}
                          endDate={filterOptions.endDate}
                          searchText={filterOptions.search}
                          activeTab={tabValue}
                          tz={tz}
                          setIsRefundIssued={setIsRefundIssued}
                          isRefundIssued={isRefundIssued}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="failed">
                        <ReservationsTable
                          placeId={placeId}
                          startDate={filterOptions.startDate}
                          endDate={filterOptions.endDate}
                          searchText={filterOptions.search}
                          activeTab={tabValue}
                          tz={tz}
                          setIsRefundIssued={setIsRefundIssued}
                          isRefundIssued={isRefundIssued}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="refunded">
                        <ReservationsTable
                          placeId={placeId}
                          startDate={filterOptions.startDate}
                          endDate={filterOptions.endDate}
                          searchText={filterOptions.search}
                          activeTab={tabValue}
                          tz={tz}
                          setIsRefundIssued={setIsRefundIssued}
                          isRefundIssued={isRefundIssued}
                        />
                      </TabPanel>
                    </Grid>
                  )}
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <OccupancyDialog
        dialogOpen={occupancyDialogOpen}
        onClose={() => setOccupancyDialogOpen(false)}
        data={{
          numberOfSpaces: selectedPlace?.spaces || 0,
          occupancy: selectedPlace?.activeLicensePlateCount || 0,
        }}
      />
      <CreateReservation
        dialogOpen={createReservationDialogOpen}
        onClose={() => setCreateReservationDialogOpen(false)}
        placeData={selectedPlace}
        onSuccess={() => {
          setCreateReservationDialogOpen(false);
          // Refresh the table
          window.location.reload();
        }}
      />
    </DashboardLayout>
  );
};

export default Reservation;
