import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const QRCodePermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.QRCode_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        QRCode_view: true,
        QRCode_add: true, 
        QRCode_update: true, 
        QRCode_delete: true
      }));
    }
  }, [modules, setModules]);

  console.log("modules ====>", modules);

  const handleQRCodeViewChange = (event) => {
    const isQRCodeViewEnabled = event.target.checked;
    setModules({
      ...modules,
      QRCode_view: isQRCodeViewEnabled,
      ...(isQRCodeViewEnabled
        ? {}
        : { QRCode_add: false, QRCode_update: false, QRCode_delete: false }),
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
                QRCode Module
              </MDTypography>
              <Tooltip
                title={`${
                  modules.QRCode_view ? "Disable" : "Enable"
                } QRCode module`}
                placement="top"
              >
                <Switch
                  checked={modules.QRCode_view}
                  onChange={handleQRCodeViewChange}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Add QRCode
                  </MDTypography>

                  <Switch
                    checked={modules.QRCode_add}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        QRCode_add: event.target.checked,
                      })
                    }
                    disabled={!modules.QRCode_view}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Update QRCode
                  </MDTypography>
                  <Switch
                    checked={modules.QRCode_update}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        QRCode_update: event.target.checked,
                      })
                    }
                    disabled={!modules.QRCode_view}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Delete QRCode
                  </MDTypography>
                  <Switch
                    checked={modules.QRCode_delete}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        QRCode_delete: event.target.checked,
                      })
                    }
                    disabled={!modules.QRCode_view}
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

export default QRCodePermissionCard;
