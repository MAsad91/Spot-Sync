import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const ValidationPermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.Validation_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        Validation_view: true,
        Validation_add: true, 
        Validation_update: true, 
        Validation_delete: true
      }));
    }
  }, [modules, setModules]);

  console.log("modules ====>", modules);

  const handleValidationViewChange = (event) => {
    const isValidationViewEnabled = event.target.checked;
    setModules({
      ...modules,
      Validation_view: isValidationViewEnabled,
      ...(isValidationViewEnabled
        ? {}
        : { Validation_add: false, Validation_update: false, Validation_delete: false }),
    });
  };

  return (
    <>
      <Card sx={{ minWidth: 275, boxShadow: 3 }}>
        <MDBox p={2}>
          <Grid container spacing={1}>
            <Grid item xs={12} container alignItems="center">
              <MDTypography
                color="dark"
                display="block"
                variant="subtitle2"
                fontWeight="bold"
                sx={{ flex: 1 }}
              >
                Validation Module
              </MDTypography>
              <Tooltip
                title={`${
                  modules.Validation_view ? "Disable" : "Enable"
                } Validation module`}
                placement="top"
              >
                <Switch
                  checked={modules.Validation_view}
                  onChange={handleValidationViewChange}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Add Validation
                  </MDTypography>

                  <Switch
                    checked={modules.Validation_add}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Validation_add: event.target.checked,
                      })
                    }
                    disabled={!modules.Validation_view}
                  />
                </Grid>

                <Grid item xs={6} md={5}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Active / Deactive Validation
                  </MDTypography>
                  <Switch
                    checked={modules.Validation_update}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Validation_update: event.target.checked,
                      })
                    }
                    disabled={!modules.Validation_view}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Delete Validation
                  </MDTypography>
                  <Switch
                    checked={modules.Validation_delete}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Validation_delete: event.target.checked,
                      })
                    }
                    disabled={!modules.Validation_view}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </MDBox>
      </Card>
    </>
  );
};

export default ValidationPermissionCard;
