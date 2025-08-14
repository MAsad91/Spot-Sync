// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// PMS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import AutomatedValidationTable from "./components/AutomatedValidationTable";
import CreateAutomatedValidation from "./components/CreateAutomatedValidation";
import { getAutomatedValidations } from "store/slice/automatedValidations/automatedValidationSlice";
import { getRatesByPlaceId } from "store/slice/rates/rateSlice";

function AutomatedValidationCode() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const [ratesData, setRatesData] = useState([]);
  const [validationData, setValidationData] = useState([]);
  const placesData = useSelector((state) => state.places?.selectedPlace);
  let placeId =
    placesData?._id || new URLSearchParams(location?.search).get("placeId");

  const handleGetValidations = () => {
    dispatch(getAutomatedValidations(placeId))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          setValidationData(res?.validations ?? []);
        }
      });
  };

  const handleGetRates = () => {
    dispatch(getRatesByPlaceId(placeId))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          setRatesData(res?.rates ?? []);
        }
      });
  };

  useEffect(() => {
    handleGetValidations();
    handleGetRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesData?._id]);

  return (
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
                  Automated Validation code
                </MDTypography>

                <MDButton
                  variant="outlined"
                  size="small"
                  onClick={() => setDialogOpen(true)}
                >
                  Create Validation
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                <AutomatedValidationTable
                ratesData={ratesData}
                  validationData={validationData}
                  updateParentData={handleGetValidations}
                />
                <CreateAutomatedValidation
                  ratesData={ratesData}
                  dialogOpen={dialogOpen}
                  onClose={() => setDialogOpen(false)}
                  updateParentData={handleGetValidations}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
}

export default AutomatedValidationCode;
