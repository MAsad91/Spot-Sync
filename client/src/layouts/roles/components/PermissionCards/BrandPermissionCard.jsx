import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const BrandPermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.Brand_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        Brand_view: true,
        Brand_add: true, 
        Brand_update: true, 
        Brand_delete: true, 
        Brand_impersonate: true
      }));
    }
  }, [modules, setModules]);

  console.log("modules ====>", modules);

  const handleBrandViewChange = (event) => {
    const isBrandViewEnabled = event.target.checked;
    setModules({
      ...modules,
      Brand_view: isBrandViewEnabled,
      ...(isBrandViewEnabled
        ? {}
        : { Brand_add: false, Brand_update: false, Brand_delete: false, Brand_impersonate: false }),
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
                Brand Module
              </MDTypography>
              <Tooltip
                title={`${
                  modules.Brand_view ? "Disable" : "Enable"
                } Brand module`}
                placement="top"
              >
                <Switch
                  checked={modules.Brand_view}
                  onChange={handleBrandViewChange}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Add Brand
                  </MDTypography>

                  <Switch
                    checked={modules.Brand_add}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Brand_add: event.target.checked,
                      })
                    }
                    disabled={!modules.Brand_view}
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Active / Deactive Brand
                  </MDTypography>
                  <Switch
                    checked={modules.Brand_update}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Brand_update: event.target.checked,
                      })
                    }
                    disabled={!modules.Brand_view}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Delete Brand
                  </MDTypography>
                  <Switch
                    checked={modules.Brand_delete}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Brand_delete: event.target.checked,
                      })
                    }
                    disabled={!modules.Brand_view}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Impersonate Brand
                  </MDTypography>
                  <Switch
                    checked={modules.Brand_impersonate}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Brand_impersonate: event.target.checked,
                      })
                    }
                    disabled={!modules.Brand_view}
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

export default BrandPermissionCard;
