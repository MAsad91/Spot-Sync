import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { useEffect, useState } from "react";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ValidationTable from "./components/ValidationTable";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getRatesByPlaceId } from "store/slice/rates/rateSlice";
import CreateValidation from "./components/CreateValidation";
import { getValidationsByPlaceId } from "store/slice/validation/validationSlice";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import { FormControl } from "@mui/material";
import ValidationSearchBar from "./components/ValidationSearchBar";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";

function Validation() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [validationsData, setValidationsData] = useState([]);
  const [filteredValidation, setFilteredValidation] = useState([]);
  const [ratesData, setRatesData] = useState([]);
  const userData = useSelector((state) => state.users?.meInfo);
  const roleModules = userData?.roleModules || {};

  const placesData = useSelector((state) => state.places?.selectedPlace);
  let placeId =
    placesData?._id || new URLSearchParams(location?.search).get("placeId");

  const handleGetRates = () => {
    dispatch(getRatesByPlaceId(placeId))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          setRatesData(res?.rates ?? []);
        }
      });
  };
  const handleGetValidations = () => {
    dispatch(getValidationsByPlaceId(placeId))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          setValidationsData(res?.validation ?? []);
        }
      });
  };
  useEffect(() => {
    handleGetRates();
    handleGetValidations();
  }, [placeId]);

  const updateData = () => {
    handleGetValidations();
  };
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
                    Validation
                  </MDTypography>

                  <MDButton
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      navigate("/automation?tab=validation");
                    }}
                  >
                    Automated Validation code
                  </MDButton>
                  {roleModules.Validation_add && (
                    <MDButton
                      variant="outlined"
                      size="small"
                      onClick={() => setDialogOpen(true)}
                    >
                      Create
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
                        <ValidationSearchBar
                          validationData={validationsData}
                          setFilteredValidation={setFilteredValidation}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </MDBox>
                <MDBox pt={3}>
                  <ValidationTable
                    validationData={
                      !isEmpty(filteredValidation) ? filteredValidation : []
                    }
                    updateParentData={updateData}
                    roleModules={roleModules}
                  />
                  <CreateValidation
                    placeId={placeId}
                    rateData={ratesData}
                    dialogOpen={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    updateParentData={updateData}
                  />
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

export default Validation;
