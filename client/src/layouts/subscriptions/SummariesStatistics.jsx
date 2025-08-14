import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import breakpoints from "assets/theme/base/breakpoints";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useMaterialUIController } from "context";
import { useEffect, useMemo, useState } from "react";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import PendingIcon from "@mui/icons-material/Pending";
import { getSubscriptionsSummaries } from "../../store/slice/subscriptions/subscriptionSlice";
import Statistics from "./summaryComponents/statistics";
import SubscriptionSummaryTable from "./summaryComponents/SubscriptionSummaryTable";
import { isEmpty } from "lodash";
import { FormControl } from "@mui/material";
import SummarySearchBar from "./summaryComponents/SummarySearchBar";
import SummaryFilterByDate from "./summaryComponents/SummaryFilterByDate";
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

function SubscriptionsStatistics() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [summaryList, setSummaryList] = useState([])
  const userData = useSelector((state) => state.users?.meInfo);
  const roleModules = userData?.roleModules || {};
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab");
  const [tabValue, setTabValue] = useState(activeTab ? activeTab : "failed");
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  const isLoading = useSelector((state) => state.subscriptions.loading);
  const subscriptionsSummaries = useSelector(
    (state) => state.subscriptions?.subscriptionsSummaries
  );
  let placeId = selectedPlace?._id;
  if (!placeId) {
    placeId = localStorage.getItem("placeId");
  }

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

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
    queryParams.set("tab", newValue);
    const updatedQueryString = queryParams.toString();
    navigate(`?${updatedQueryString}`);
  };

  useEffect(() => {
    dispatch(getSubscriptionsSummaries(placeId));
  }, [placeId, activeTab]);



  useEffect(() => {
    if (subscriptionsSummaries?.subscriptionsSummaries) {
      const summaryDetails = 
        subscriptionsSummaries?.subscriptionsSummaries?.flatMap((item) => {
          return [...(item?.paymentIds || []).map((id) => id)];
        }) || [];

      // Compare the new summaryDetails with the current summaryList
      if (summaryDetails.length !== summaryList.length || !summaryDetails.every((val, index) => val === summaryList[index])) {
        setSummaryList(summaryDetails);
      }
    }
  }, [subscriptionsSummaries?.subscriptionsSummaries]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
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
                  className="d-flex align-items-center gap-2"
                >
                  <MDTypography
                    variant="h6"
                    color="white"
                    className="flex-grow-1"
                  >
                    Subscriptions Statistics
                  </MDTypography>
                </MDBox>
                <MDBox p={2}>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                      <PlacePicker />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <SummaryFilterByDate
                          summaryList={summaryList}
                          setFilteredDetails={setFilteredDetails}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <SummarySearchBar
                          summaryList={summaryList}
                          setFilteredDetails={setFilteredDetails}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </MDBox>
                <MDBox p={2}>
                  <Statistics
                    data={subscriptionsSummaries?.summaryStatistics}
                  />
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
                            label="Failed Payment"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <MoneyOffIcon />
                              </Icon>
                            }
                            value="failed"
                          />
                          <Tab
                            label="Refunded Payment"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <PendingIcon />
                              </Icon>
                            }
                            value="refunded"
                          />
                        </Tabs>
                      </AppBar>
                      <TabPanel value={tabValue} index="failed">
                        <SubscriptionSummaryTable
                          summaryList={
                            !isEmpty(filteredDetails)
                              ? filteredDetails.filter(
                                (item) => item.paymentStatus === "failed"
                              )
                              : []
                          }
                          activeTab={activeTab}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="refunded">
                        <SubscriptionSummaryTable
                          isLoading={isLoading}
                          summaryList={
                            !isEmpty(filteredDetails)
                              ? filteredDetails.filter(
                                (item) => item.paymentStatus === "refunded"
                              )
                              : []
                          }
                          activeTab={activeTab}

                        />
                      </TabPanel>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default SubscriptionsStatistics;
