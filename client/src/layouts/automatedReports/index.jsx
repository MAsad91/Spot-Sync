import { Card, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useState, useEffect } from "react";
import { useMaterialUIController } from "context";
import { useDispatch, useSelector } from "react-redux";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import MDSnackbar from "components/MDSnackbar";
import CircularIndeterminate from "components/MDLoading";
import { useLocation } from "react-router-dom";
import CreateAutomatedReport from "./components/CreateAutomatedReport";
import AutomatedReportTable from "./components/AutomatedReportTable";
import { getAutomatedReports } from "store/slice/automatedReports/automatedSlice";
import { getAllAutomatedReports } from "store/slice/automatedReports/automatedSlice";

const AutomatedReports = () => {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const dispatch = useDispatch();
  const location = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportData, setReportData] = useState([]);
  const placesData = useSelector((state) => state.places?.selectedPlace);
  let placeId =
    placesData?._id || new URLSearchParams(location?.search).get("placeId");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handleGetReports = () => {
    setIsLoading(true);
    dispatch(getAllAutomatedReports())
      .unwrap()
      .then((res) => {
        if (res?.success) {
          setReportData(res?.reports ?? []);
        }
        setIsLoading(false);
      });
  };

  useEffect(() => {
    handleGetReports();
  }, [placesData?._id]);

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Loading automated report.. "
        open={isLoading}
      />
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />

      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={2} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <MDBox
                  mx={1}
                  mt={2}
                  py={1}
                  px={1}
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
                    Automated Report
                  </MDTypography>
                  <MDButton
                    variant="outlined"
                    size="small"
                    onClick={() => setDialogOpen(true)}
                  >
                    Create
                  </MDButton>
                </MDBox>
                <MDBox pt={3} sx={{ mx: 3 }}>
                  <PlacePicker />
                </MDBox>
                <MDBox pt={3}>
                  <AutomatedReportTable
                    reportData={reportData}
                    updateParentData={handleGetReports}
                  />
                  <CreateAutomatedReport
                    placeId={placeId}
                    dialogOpen={dialogOpen}
                    onClose={() => {
                      setDialogOpen(false);
                      handleGetReports();
                    }}
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </DashboardLayout>
    </>
  );
};

export default AutomatedReports;
