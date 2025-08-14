import { Card, Grid, Icon, AppBar, Tabs, Tab } from "@mui/material";
import breakpoints from "assets/theme/base/breakpoints";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useMaterialUIController } from "context";

import { useEffect, useState } from "react";
import TransactionReports from "./components/TransactionReport";
import ReservationReports from "./components/ReservationReport";
import SubscriptionReports from "./components/SubscriptionReport";
import AutomatedReports from "layouts/automation/components/reports";
import RevenueSummary from "./components/RevenueSummary"

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
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const location = useLocation();
  const navigate = useNavigate();
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab");
  const [tabValue, setTabValue] = useState(
    activeTab ? activeTab : "transaction"
  );

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
                  Reports
                </MDTypography>
              </MDBox>

              <MDBox p={2} my={2}>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={12} lg={12} sx={{ ml: "auto" }}>
                    <AppBar position="static">
                      <Tabs
                        orientation={tabsOrientation}
                        value={tabValue}
                        onChange={handleSetTabValue}
                      >
                        <Tab
                          label="Transactional Report"
                          icon={
                            <Icon fontSize="small" sx={{ mt: -0.25 }}></Icon>
                          }
                          value="transaction"
                        />
                        <Tab
                          label="Transient Report"
                          icon={
                            <Icon fontSize="small" sx={{ mt: -0.25 }}></Icon>
                          }
                          value="reservation"
                        />
                        <Tab
                          label="Subscription"
                          icon={
                            <Icon fontSize="small" sx={{ mt: -0.25 }}></Icon>
                          }
                          value="subscription"
                        />
                        <Tab
                          label="Automated Report"
                          icon={
                            <Icon fontSize="small" sx={{ mt: -0.25 }}></Icon>
                          }
                          value="automatedReport"
                        />
                        <Tab
                          label="Revenue Summary"
                          icon={
                            <Icon fontSize="small" sx={{ mt: -0.25 }}></Icon>
                          }
                          value="revenueSummary"
                        />
                      </Tabs>
                    </AppBar>
                    <TabPanel value={tabValue} index="transaction">
                      <TransactionReports />
                    </TabPanel>
                    <TabPanel value={tabValue} index="reservation">
                      <ReservationReports />
                    </TabPanel>
                    <TabPanel value={tabValue} index="subscription">
                      <SubscriptionReports />
                    </TabPanel>
                    <TabPanel value={tabValue} index="automatedReport">
                    <AutomatedReports/>
                    </TabPanel>
                    <TabPanel value={tabValue} index="revenueSummary">
                    <RevenueSummary/>
                    </TabPanel>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default Reservation;
