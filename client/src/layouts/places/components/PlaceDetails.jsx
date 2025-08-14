import { useEffect, useState } from "react";
import { Card, Grid, Icon } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DefaultSortInfoCard from "examples/Cards/InfoCards/DefaultInfoCard/DefaultSortInfoCard";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useDispatch } from "react-redux";
import { useMaterialUIController } from "context";
import AssignRateTable from "./AssignRateTable";
import { useLocation } from "react-router-dom";
import { getPlaceById } from "store/slice/places/placeSlice";
import CircularIndeterminate from "components/MDLoading";
import { getAssignRatesByPlaceId } from "store/slice/rates/rateSlice";

const PlaceDetails = () => {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [placeData, setPlaceData] = useState({});
  const [assignRatesData, setAssignRatesData] = useState([]);
  const placeId = new URLSearchParams(location?.search).get("placeId");

  function getPlaceData() {
    setIsLoading(true);
    dispatch(getPlaceById(placeId))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          setPlaceData(res?.place);
          setIsLoading(false);
        }
      });
  }
  const handleGetAssignRates = () => {
    setIsLoading(true);
    dispatch(getAssignRatesByPlaceId(placeId))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          setAssignRatesData(res?.assignRates ?? []);
          setIsLoading(false);
        }
      });
  };

  useEffect(() => {
    getPlaceData();
    handleGetAssignRates();
  }, [placeId]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={2}>
                <MDBox
                  className="d-flex align-items-center justify-content-between"
                  flexDirection={{ md: "row", xs: "column" }}
                  gap={1}
                  mb={2}
                >
                  <MDBox
                    className="d-flex align-items-center gap-1"
                    order={{ md: 1, xs: 2 }}
                    width={{ md: "auto", xs: "100%" }}
                  >
                    <Icon>location_on</Icon>
                    <MDTypography variant="h6">
                      {`${placeData?.parkingCode || "-"} - ${
                        placeData?.google?.formatted_address || "-"
                      }`}
                    </MDTypography>
                  </MDBox>
                </MDBox>
                <MDBox mb={2}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item md={3} sm={6} xs={12}>
                      <DefaultSortInfoCard
                        color={sidenavColor}
                        icon="schedule"
                        title="Time Zone"
                        value={placeData?.timeZoneId || "Not Available"}
                      />
                    </Grid>
                    <Grid item md={3} sm={6} xs={12}>
                      <DefaultSortInfoCard
                        color={sidenavColor}
                        icon="event_seat"
                        title="Number of Spaces"
                        value={placeData.spaces}
                      />
                    </Grid>
                    <Grid item md={3} sm={6} xs={12}>
                      <DefaultSortInfoCard
                        color={sidenavColor}
                        icon="diversity_2"
                        title="Brand"
                        value="Amazon"
                      />
                    </Grid>
                  </Grid>
                </MDBox>
                <MDBox container>
                  <AssignRateTable assignRates={assignRatesData} />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <CircularIndeterminate
        type="full"
        size={20}
        text={"Please Wait.."}
        open={isLoading}
      />
      <Footer />
    </DashboardLayout>
  );
};

export default PlaceDetails;
