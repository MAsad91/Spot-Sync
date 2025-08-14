import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const AssignRatePermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.Assign_rate_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        Assign_rate_view: true,
      }));
    }
  }, [modules, setModules]);

  console.log("modules ====>", modules);

  const handleAssignRateViewChange = (event) => {
    const isAssignRateViewEnabled = event.target.checked;
    setModules({
      ...modules,
      Assign_rate_view: isAssignRateViewEnabled,
    });
  };

  return (
    <>
      <Card sx={{ minWidth: 275, boxShadow: 3 }}>
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
                AssignRate Module
              </MDTypography>
              
              <Tooltip
                title={`${
                  modules.Assign_rate_view ? "Disable" : "Enable"
                } AssignRate module`}
                placement="top"
              >
                <Switch
                  checked={modules.Assign_rate_view}
                  onChange={handleAssignRateViewChange}
                />
              </Tooltip>
            </Grid>
           
          </Grid>
        </MDBox>
      </Card>
    </>
  );
};

export default AssignRatePermissionCard;
