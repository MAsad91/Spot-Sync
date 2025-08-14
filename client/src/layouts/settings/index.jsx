import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import breakpoints from "assets/theme/base/breakpoints";
import Header from "layouts/settings/components/Header";
import Plivo from "layouts/settings/components/Plivo";
import PaymentGateway from "layouts/settings/components/PaymentGateway";
import Slack from "layouts/settings/components/Slack";
import Discord from "layouts/settings/components/Discord"

import { useLocation, useNavigate } from "react-router-dom";

import AutomatedValidationCode from "./components/AutomatedValidationCode";
import { useSelector } from "react-redux";
import Extension from "./components/Extension";

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

function Overview() {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab");
  const userData = useSelector((state) => state.users?.meInfo);
  const roleModules = userData?.roleModules || {};
  const [tabValue, setTabValue] = useState(
    activeTab ? activeTab : roleModules.Setting_view ? "plivoNumber" : ""
  );

  console.log('roles',roleModules)

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
                  <Tab
                    label="Plivo Number"
                    value="plivoNumber"
                    disabled={!roleModules.Setting_plivo}
                  />
                  <Tab
                    label="Payment Gateway"
                    value="paymentGateway"
                    disabled={!roleModules.Setting_payment_gateway}
                  />
                  <Tab
                    label="Slack"
                    value="slack"
                    disabled={!roleModules.Setting_slack}
                  />
                  <Tab
                    label="Discord"
                    value="discord"
                    disabled={!roleModules.Setting_slack}
                  />
                  {/* <Tab
                    label="Flow Type"
                    value="flowType"
                    disabled={!roleModules.Setting_flowType}
                  /> */}

                  {/* <Tab
                    label="LPR Settings"
                    value="lpr"
                    disabled={!roleModules.Setting_integration}
                  /> */}
                  {/* <Tab
                    label="Automations"
                    value="automations"
                    disabled={!roleModules.Setting_automation}
                  /> */}
                   <Tab
                    label="Extension"
                    value="extension"
                    disabled={!roleModules.Setting_extension}
                  />
                </Tabs>
              </AppBar>
              <TabPanel value={tabValue} index={"plivoNumber"}>
                <Plivo />
              </TabPanel>
              <TabPanel value={tabValue} index="paymentGateway">
                <PaymentGateway />
              </TabPanel>
              <TabPanel value={tabValue} index="slack">
                <Slack />
              </TabPanel>
              <TabPanel value={tabValue} index="discord">
                <Discord />
              </TabPanel>
              {/* <TabPanel value={tabValue} index="flowType">
                <FlowType />
              </TabPanel> */}

              {/* <TabPanel value={tabValue} index="lpr">
                <LPR />
              </TabPanel> */}
              {/* <TabPanel value={tabValue} index="automations">
                <AutomatedValidationCode />
              </TabPanel> */}
              <TabPanel value={tabValue} index="extension">
                <Extension />
              </TabPanel>
            </Grid>
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
