import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const ReportPermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.Report_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        Report_view: true,
      }));
    }
  }, [modules, setModules]);

  console.log("modules ====>", modules);

  const handleReportViewChange = (event) => {
    const isReportViewEnabled = event.target.checked;
    setModules({
      ...modules,
      Report_view: isReportViewEnabled,
    });
  };

  return (
    <>
      <Card sx={{ minWidth: 275, boxShadow: 3, width: 'inherit' }}>
        <MDBox p={2}>
          <Grid container spacing={1}>
            <Grid item lg={12} md={12} xs={12} container alignItems="center">
              <MDTypography
                color="dark"
                display="block"
                variant="subtitle2"
                fontWeight="bold"
                sx={{ flex: 1 }}
              >
                Report Module
              </MDTypography>
              
              <Tooltip
                title={`${
                  modules.Report_view ? "Disable" : "Enable"
                } Report module`}
                placement="top"
              >
                <Switch
                  checked={modules.Report_view}
                  onChange={handleReportViewChange}
                />
              </Tooltip>
            </Grid>
           
          </Grid>
        </MDBox>
      </Card>
    </>
  );
};

export default ReportPermissionCard;
