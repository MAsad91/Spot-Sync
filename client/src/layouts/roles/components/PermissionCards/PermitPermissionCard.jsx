import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const PermitPermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.Permit_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        Permit_view: true,
      }));
    }
  }, [modules, setModules]);

  console.log("modules ====>", modules);

  const handlePermitViewChange = (event) => {
    const isPermitViewEnabled = event.target.checked;
    setModules({
      ...modules,
      Permit_view: isPermitViewEnabled,
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
                Permit Module
              </MDTypography>
              
              <Tooltip
                title={`${
                  modules.Permit_view ? "Disable" : "Enable"
                } Permit module`}
                placement="top"
              >
                <Switch
                  checked={modules.Permit_view}
                  onChange={handlePermitViewChange}
                />
              </Tooltip>
            </Grid>
           
          </Grid>
        </MDBox>
      </Card>
    </>
  );
};

export default PermitPermissionCard;
