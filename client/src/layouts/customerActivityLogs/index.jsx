import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import breakpoints from "assets/theme/base/breakpoints";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useMaterialUIController } from "context";
import { useEffect, useState } from "react";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useSelector } from "react-redux";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import CustomerActivityLogsTable from "./components/CustomerActivityLogsTable";


function CustomerActivityLogs() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  let placeId = selectedPlace?._id;
  const tz = selectedPlace?.timeZoneId || "America/Los_Angeles";
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
                    Customer Activity Logs
                  </MDTypography>
                </MDBox>
                <MDBox p={2}>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <PlacePicker />
                    </Grid>
                  </Grid>
                </MDBox>

                <MDBox p={2}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={12} lg={12} sx={{ ml: "auto" }}>
                      <CustomerActivityLogsTable
                        placeId={placeId}
                        tz={tz}
                      />
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

export default CustomerActivityLogs;
