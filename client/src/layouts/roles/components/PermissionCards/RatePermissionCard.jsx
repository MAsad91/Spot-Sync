import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const RatePermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.Rate_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        Rate_view: true,
        Rate_add: true, 
        Rate_update: true, 
        Rate_delete: true,
      }));
    }
  }, [modules, setModules]);

  console.log("modules ====>", modules);

  const handleRateViewChange = (event) => {
    const isRateViewEnabled = event.target.checked;
    setModules({
      ...modules,
      Rate_view: isRateViewEnabled,
      ...(isRateViewEnabled
        ? {}
        : { Rate_add: false, Rate_update: false, Rate_delete: false }),
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
                Rate Module
              </MDTypography>
              <Tooltip
                title={`${
                  modules.Rate_view ? "Disable" : "Enable"
                } Rate module`}
                placement="top"
              >
                <Switch
                  checked={modules.Rate_view}
                  onChange={handleRateViewChange}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={2.5}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Add Rates
                  </MDTypography>
                  <Switch
                    checked={modules.Rate_add}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Rate_add: event.target.checked,
                      })
                    }
                    disabled={!modules.Rate_view}
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Active / Deactive Rate
                  </MDTypography>
                  <Switch
                    checked={modules.Rate_update}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Rate_update: event.target.checked,
                      })
                    }
                    disabled={!modules.Rate_view}
                  />
                </Grid>

                <Grid item xs={6} md={2.5}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Delete Rate
                  </MDTypography>
                  <Switch
                    checked={modules.Rate_delete}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Rate_delete: event.target.checked,
                      })
                    }
                    disabled={!modules.Rate_view}
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

export default RatePermissionCard;
