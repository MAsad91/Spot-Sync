import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const SubscriptionPermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.Subscription_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        Subscription_view: true,
        Subscription_add: true, 
        Subscription_refund: true, 
        Subscription_delete: true, 
        Subscription_report: true
      }));
    }
  }, [modules, setModules]);

  console.log("modules ====>", modules);

  const handleSubscriptionViewChange = (event) => {
    const isSubscriptionViewEnabled = event.target.checked;
    setModules({
      ...modules,
      Subscription_view: isSubscriptionViewEnabled,
      ...(isSubscriptionViewEnabled
        ? {}
        : { Subscription_add: false, Subscription_refund: false, Subscription_delete: false, Subscription_report: false }),
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
                Subscription Module
              </MDTypography>
              <Tooltip
                title={`${
                  modules.Subscription_view ? "Disable" : "Enable"
                } Subscription module`}
                placement="top"
              >
                <Switch
                  checked={modules.Subscription_view}
                  onChange={handleSubscriptionViewChange}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Add Subscription
                  </MDTypography>

                  <Switch
                    checked={modules.Subscription_add}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Subscription_add: event.target.checked,
                      })
                    }
                    disabled={!modules.Subscription_view}
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Refund Subscription
                  </MDTypography>
                  <Switch
                    checked={modules.Subscription_refund}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Subscription_refund: event.target.checked,
                      })
                    }
                    disabled={!modules.Subscription_view}
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Delete Subscription
                  </MDTypography>
                  <Switch
                    checked={modules.Subscription_delete}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Subscription_delete: event.target.checked,
                      })
                    }
                    disabled={!modules.Subscription_view}
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <MDTypography variant="caption" fontWeight="regular">
                   Export Subscription Report
                  </MDTypography>
                  <Switch
                    checked={modules.Subscription_report}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Subscription_report: event.target.checked,
                      })
                    }
                    disabled={!modules.Subscription_view}
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

export default SubscriptionPermissionCard;
