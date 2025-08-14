// @mui material components
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import RuleIcon from "@mui/icons-material/Rule";
import MDBox from "components/MDBox";

// PMS example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
// PMS base styles
import breakpoints from "assets/theme/base/breakpoints";
// Overview page components
import Header from "layouts/settings/components/Header";
import { useLocation, useNavigate } from "react-router-dom";
import AutomatedReports from "./components/reports";
import AutomatedValidationCode from "./components/validationCode";
// import AutomatedValidationCode from "../settings/components/AutomatedValidationCode/index";
// import AutomatedReports from "layouts/automatedReports";

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

function Automation() {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab");
  const [tabValue, setTabValue] = useState(activeTab ? activeTab : "report");

  useEffect(() => {
    // A function that sets the orientation state of the tabs.
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    /** 
     The event listener that's calling the handleTabsOrientation function when resizing the window.
    */
    window.addEventListener("resize", handleTabsOrientation);

    // Call the handleTabsOrientation function to set the state with the initial value.
    handleTabsOrientation();

    // Remove event listener on cleanup
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
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={12} lg={12} sx={{ ml: "auto" }}>
              <AppBar position="static">
                <Tabs
                  orientation={tabsOrientation}
                  value={tabValue}
                  onChange={handleSetTabValue}
                >
                  {/* <Tab
                    label="Report"
                    icon={
                      <Icon fontSize="small" sx={{ mt: -0.25 }}>
                        <AssessmentIcon />
                      </Icon>
                    }
                    value="report"
                  /> */}
                  <Tab
                    label="Validation"
                    icon={
                      <Icon fontSize="small" sx={{ mt: -0.25 }}>
                        <RuleIcon />
                      </Icon>
                    }
                    value="validation"
                  />
                </Tabs>
              </AppBar>
              <TabPanel value={tabValue} index="report">
                <AutomatedReports />
              </TabPanel>
              <TabPanel value={tabValue} index="validation">
                <AutomatedValidationCode />
              </TabPanel>
            </Grid>
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Automation;
