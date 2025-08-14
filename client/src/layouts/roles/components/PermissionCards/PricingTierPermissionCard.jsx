import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const PricingPermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.Pricing_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        Pricing_view: true,
        Pricing_add: true, 
        Pricing_update: true, 
        Pricing_delete: true
      }));
    }
  }, [modules, setModules]);

  console.log("modules ====>", modules);

  const handlePricingViewChange = (event) => {
    const isPricingViewEnabled = event.target.checked;
    setModules({
      ...modules,
      Pricing_view: isPricingViewEnabled,
      ...(isPricingViewEnabled
        ? {}
        : { Pricing_add: false, Pricing_update: false, Pricing_delete: false }),
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
                Pricing Tier Module
              </MDTypography>
              <Tooltip
                title={`${
                  modules.Pricing_view ? "Disable" : "Enable"
                } Pricing Tire module`}
                placement="top"
              >
                <Switch
                  checked={modules.Pricing_view}
                  onChange={handlePricingViewChange}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={2.5}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Add Pricing
                  </MDTypography>

                  <Switch
                    checked={modules.Pricing_add}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Pricing_add: event.target.checked,
                      })
                    }
                    disabled={!modules.Pricing_view}
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Active / Deactive Pricing
                  </MDTypography>
                  <Switch
                    checked={modules.Pricing_update}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Pricing_update: event.target.checked,
                      })
                    }
                    disabled={!modules.Pricing_view}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Update Pricing
                  </MDTypography>
                  <Switch
                    checked={modules.Pricing_update}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Pricing_update: event.target.checked,
                      })
                    }
                    disabled={!modules.Pricing_view}
                  />
                </Grid>
                <Grid item xs={6} md={2.5}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Delete Pricing
                  </MDTypography>
                  <Switch
                    checked={modules.Pricing_delete}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Pricing_delete: event.target.checked,
                      })
                    }
                    disabled={!modules.Pricing_view}
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

export default PricingPermissionCard;
