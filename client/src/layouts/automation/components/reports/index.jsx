import { Card, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import React, { useState, useEffect } from "react";
import { useMaterialUIController } from "context";
import { useDispatch, useSelector } from "react-redux";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import MDSnackbar from "components/MDSnackbar";
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
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handleGetReports = () => {
    dispatch(getAllAutomatedReports())
      .unwrap()
      .then((res) => {
        if (res?.success) {
          setReportData(res?.report ?? []);
        }
      });
  };

  useEffect(() => {
    handleGetReports();
  }, [placesData?._id]);

  return (
    <>
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />

      <MDBox>
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
                {/* <MDBox pt={3} sx={{ mx: 3 }}>
                  <PlacePicker />
                </MDBox> */}
                <MDBox pt={3}>
                  <AutomatedReportTable
                    reportData={reportData}
                    updateParentData={handleGetReports}
                  />
                  <CreateAutomatedReport
                    updateParentData={handleGetReports}
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
      </MDBox>
    </>
  );
};

export default AutomatedReports;
