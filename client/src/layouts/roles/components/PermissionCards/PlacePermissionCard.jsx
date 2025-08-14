import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const PlacePermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.Place_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        Place_view: true,
        Place_add: true, 
        Place_update: true, 
        Place_delete: true, 
        Place_visibility: true
      }));
    }
  }, [modules, setModules]);

  console.log("modules ====>", modules);

  const handlePlaceViewChange = (event) => {
    const isPlaceViewEnabled = event.target.checked;
    setModules({
      ...modules,
      Place_view: isPlaceViewEnabled,
      ...(isPlaceViewEnabled
        ? {}
        : { Place_add: false, Place_update: false, Place_delete: false, Place_visibility: false }),
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
                Place Module
              </MDTypography>
              <Tooltip
                title={`${
                  modules.Place_view ? "Disable" : "Enable"
                } Place module`}
                placement="top"
              >
                <Switch
                  checked={modules.Place_view}
                  onChange={handlePlaceViewChange}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Add Place
                  </MDTypography>

                  <Switch
                    checked={modules.Place_add}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Place_add: event.target.checked,
                      })
                    }
                    disabled={!modules.Place_view}
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Active / Deactive Place
                  </MDTypography>
                  <Switch
                    checked={modules.Place_update}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Place_update: event.target.checked,
                      })
                    }
                    disabled={!modules.Place_view}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Delete Place
                  </MDTypography>
                  <Switch
                    checked={modules.Place_delete}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Place_delete: event.target.checked,
                      })
                    }
                    disabled={!modules.Place_view}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Place Visibility
                  </MDTypography>
                  <Switch
                    checked={modules.Place_visibility}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Place_visibility: event.target.checked,
                      })
                    }
                    disabled={!modules.Place_view}
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

export default PlacePermissionCard;
