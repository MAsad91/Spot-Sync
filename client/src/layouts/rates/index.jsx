// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
// PMS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
// PMS example components
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// Data
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { useState, useEffect } from "react";
import CreateRates from "./components/CreateRates";
import RatesTable from "./components/RatesTable";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import { getRatesByPlaceId } from "store/slice/rates/rateSlice";
import { isEmpty } from "lodash";
import { FormControl } from "@mui/material";
import RatesSearchBar from "./components/RatesSearchBar";

const Rates = () => {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const dispatch = useDispatch();
  const location = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filteredRates, setFilteredRates] = useState([]);
  const userData = useSelector((state) => state.users?.meInfo);
  const roleModules = userData?.roleModules || {};
  const ratesData = useSelector((state) => state.rates?.ratesByPlace);
  const placesData = useSelector((state) => state.places?.selectedPlace);
  let placeId =
    placesData?._id || new URLSearchParams(location?.search).get("placeId");

  useEffect(() => {
    dispatch(getRatesByPlaceId(placeId));
  }, [dispatch, placeId]);

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
                className="d-flex align-items-center gap-2"
              >
                <MDTypography
                  variant="h6"
                  color="white"
                  className="flex-grow-1"
                >
                  Rates
                </MDTypography>

                {placeId && roleModules.Rate_add && (
                  <MDButton
                    variant="outlined"
                    size="small"
                    onClick={() => setDialogOpen(true)}
                  >
                    Create Rates
                  </MDButton>
                )}
              </MDBox>
              <MDBox p={2}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
                    <PlacePicker />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <RatesSearchBar
                        ratesData={ratesData}
                        setFilteredRates={setFilteredRates}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </MDBox>
              <MDBox pt={3}>
                <RatesTable
                  ratesData={!isEmpty(filteredRates) ? filteredRates : []}
                  roleModules={roleModules}
                  placeId={placeId}
                />
                <CreateRates
                  ratesData={ratesData}
                  dialogOpen={dialogOpen}
                  placeId={placeId}
                  onClose={() => {
                    setDialogOpen(false);
                  }}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default Rates;
