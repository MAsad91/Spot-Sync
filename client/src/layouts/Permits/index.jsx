import {
  Card,
  Grid,
  FormControl,
} from "@mui/material";
import { isEmpty } from "lodash";
import breakpoints from "assets/theme/base/breakpoints";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useMaterialUIController } from "context";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import Statistics from "./components/statistics";
import { useEffect, useState } from "react";
import PermitsTable from "./components/permitsTable";
import PermitSearch from "../reservations/ReservationSearch";
import PermitFilterByDate from "../reservations/ReservationFilterByDate";
import { getPermitsByPlaceId } from "store/slice/permits/permitSlice";
import { getPermitStatistics } from "store/slice/permits/permitSlice";
import CreatePermit from "./components/createPermit"
import PermitSettings from "./components/permitSettings"
import MDButton from "components/MDButton";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import moment from "moment";
import Icon from "@mui/material/Icon";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CancelIcon from "@mui/icons-material/Cancel";
import UpcomingIcon from "@mui/icons-material/Upcoming";
import ExploreOffIcon from "@mui/icons-material/ExploreOff";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import PendingIcon from "@mui/icons-material/Pending";
import { getRatesByPlaceId } from "store/slice/rates/rateSlice";
import { getPermitsOptions } from "store/slice/permitsOptions/permitsOptionSlice";
import ReceipentTable from "./components/ReceipentTable";
import { getAutomatedReports } from "store/slice/automatedReports/automatedSlice";

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

const Permit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [filteredPermit, setFilteredPermit] = useState([]);
  const [receipentData, setReceipentData] = useState([]);
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  const permitList = useSelector((state) => state?.permit?.permitList);
  const permitStatistics = useSelector((state) => state?.permit?.statistics);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab");
  const [tabValue, setTabValue] = useState(activeTab ? activeTab : "all");
  const [page, setPage] = useState(0);

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

  useEffect(() => {
    dispatch(getRatesByPlaceId(placeId))
  }, [dispatch, placeId]);

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
    if (selectedPlace && selectedPlace._id) {
      dispatch(getPermitsOptions({
        placeId: selectedPlace._id
      }));
    }
  }, [dispatch, selectedPlace]);

  const handleGetReceipents = () => {
    dispatch(getAutomatedReports(placeId))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          setReceipentData(res?.reports ?? []);
        }
      });
  };

  useEffect(() => {
    // dispatch(getPermitsByPlaceId(placeId));
    dispatch(getPermitStatistics(placeId))
    handleGetReceipents();
  }, [dispatch, placeId]);

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
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
                  Permits
                </MDTypography>

                {selectedPlace && selectedPlace._id && (
                  <MDBox>
                    <MDButton
                      variant="outlined"
                      size="small"
                      className="me-2"
                      onClick={() => setSettingsDialogOpen(true)}
                    >
                      Settings
                    </MDButton>

                    <MDButton
                      variant="outlined"
                      size="small"
                      onClick={() => setDialogOpen(true)}
                    >
                      Create
                    </MDButton>
                  </MDBox>
                )}

              </MDBox>
              <MDBox p={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <PlacePicker />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <PermitFilterByDate
                        filterOptions={filterOptions}
                        setFilterOptions={setFilterOptions}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <PermitSearch
                        filterOptions={filterOptions}
                        setFilterOptions={setFilterOptions}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </MDBox>
              <MDBox p={2}>
                <Statistics data={permitStatistics} />
              </MDBox>

              <MDBox p={2}>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={12} lg={12} sx={{ ml: "auto" }}>
                    <AppBar position="static">
                      <Tabs
                        orientation={tabsOrientation}
                        value={tabValue}
                        onChange={handleSetTabValue}
                      >
                        <Tab
                          label="All"
                          value="all"
                        />
                        <Tab
                          label="Active"
                          value="active"
                        />

                        <Tab
                          label="Requested"
                          value="requested"
                        />

                        <Tab
                          label="Expired"
                          value="expired"
                        />
                        <Tab
                          label="Receipent Email"
                          value="receipent"
                        />
                      </Tabs>
                    </AppBar>
                    <TabPanel value={tabValue} index="all">
                      {placeId &&
                        <Grid item xs={12} md={12} lg={12} sx={{ ml: "auto" }}>
                          <PermitsTable
                            placeId={placeId}
                            startDate={filterOptions.startDate}
                            endDate={filterOptions.endDate}
                            search={filterOptions.search}
                            activeTab={tabValue}
                            tz={tz}
                          // permitList={!isEmpty(filteredPermit)? filteredPermit : []}
                          />
                        </Grid>
                      }
                    </TabPanel>
                    <TabPanel value={tabValue} index="active">
                      {placeId &&
                        <Grid item xs={12} md={12} lg={12} sx={{ ml: "auto" }}>
                          <PermitsTable
                            placeId={placeId}
                            startDate={filterOptions.startDate}
                            endDate={filterOptions.endDate}
                            search={filterOptions.search}
                            activeTab={tabValue}
                            tz={tz}
                          /* permitList={
                             !isEmpty(filteredPermit)
                               ? filteredPermit.filter(
                                   (item) => item.status?.toLowerCase() === "active"
                                 )
                               : []
                             }*/
                          />
                        </Grid>
                      }
                    </TabPanel>
                    <TabPanel value={tabValue} index="requested">
                      {placeId &&
                        <Grid item xs={12} md={12} lg={12} sx={{ ml: "auto" }}>
                          <PermitsTable
                            placeId={placeId}
                            startDate={filterOptions.startDate}
                            endDate={filterOptions.endDate}
                            search={filterOptions.search}
                            activeTab={tabValue}
                            tz={tz}
                          /* permitList={
                             !isEmpty(filteredPermit)
                               ? filteredPermit.filter(
                                   (item) => item.status?.toLowerCase() === "requested"
                                 )
                               : []
                             }*/
                          />
                        </Grid>
                      }
                    </TabPanel>
                    <TabPanel value={tabValue} index="expired">
                      {placeId &&
                        <Grid item xs={12} md={12} lg={12} sx={{ ml: "auto" }}>
                          <PermitsTable
                            placeId={placeId}
                            startDate={filterOptions.startDate}
                            endDate={filterOptions.endDate}
                            search={filterOptions.search}
                            activeTab={tabValue}
                            tz={tz}
                          /* permitList={
                             !isEmpty(filteredPermit)
                               ? filteredPermit.filter(
                                   (item) => {
                                     const end = moment(item.endDate);
                                     const yesterday = moment().add(-1, 'day');;
                                     return end.isBefore(yesterday);
                                   }
                                 )
                               : []
                             }*/
                          />
                        </Grid>
                      }
                    </TabPanel>
                    <TabPanel value={tabValue} index="receipent">
                      {placeId &&
                        <Grid item xs={12} md={12} lg={12} sx={{ ml: "auto" }}>
                          <ReceipentTable
                            receipentData={receipentData}
                            updateParentData={handleGetReceipents}
                          />
                        </Grid>
                      }
                    </TabPanel>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <CreatePermit
        placeId={placeId}
        dialogOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        startDate={filterOptions.startDate}
        endDate={filterOptions.endDate}
        search={filterOptions.search}
        activeTab={tabValue}
        tz={tz}
      />

      <PermitSettings
        dialogOpen={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
      />
      <Footer />
    </DashboardLayout>
  );
};

export default Permit;
