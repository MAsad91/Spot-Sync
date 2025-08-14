import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const SettingPermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.Setting_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        Setting_view: true,
        Setting_plivo: true,
        Setting_payment_gateway: true,
        Setting_slack: true,
        Setting_automation: true,
        Setting_extension: true,
      }));
    }
  }, [modules, setModules]);

  console.log("modules ====>", modules);

  const handleSettingViewChange = (event) => {
    const isSettingViewEnabled = event.target.checked;
    setModules({
      ...modules,
      Setting_view: isSettingViewEnabled,
      ...(isSettingViewEnabled
        ? {}
        : {
          Setting_plivo: false,
          Setting_payment_gateway: false,
          Setting_slack: false,
          Setting_automation: false,
          Setting_extension: false,
        }),
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
                Setting Module
              </MDTypography>
              <Tooltip
                title={`${modules.Setting_view ? "Disable" : "Enable"
                  } Setting module`}
                placement="top"
              >
                <Switch
                  checked={modules.Setting_view}
                  onChange={handleSettingViewChange}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Plivo Setting
                  </MDTypography>

                  <Switch
                    checked={modules.Setting_plivo}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Setting_plivo: event.target.checked,
                      })
                    }
                    disabled={!modules.Setting_view}
                  />
                </Grid>

                <Grid item xs={6} md={5}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Payment Gateway Setting
                  </MDTypography>
                  <Switch
                    checked={modules.Setting_payment_gateway}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Setting_payment_gateway: event.target.checked,
                      })
                    }
                    disabled={!modules.Setting_view}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Slack Setting
                  </MDTypography>
                  <Switch
                    checked={modules.Setting_slack}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Setting_slack: event.target.checked,
                      })
                    }
                    disabled={!modules.Setting_view}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Automation Setting
                  </MDTypography>
                  <Switch
                    checked={modules.Setting_automation}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Setting_automation: event.target.checked,
                      })
                    }
                    disabled={!modules.Setting_view}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Extension Setting
                  </MDTypography>
                  <Switch
                    checked={modules.Setting_extension}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Setting_extension: event.target.checked,
                      })
                    }
                    disabled={!modules.Setting_view}
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

export default SettingPermissionCard;
