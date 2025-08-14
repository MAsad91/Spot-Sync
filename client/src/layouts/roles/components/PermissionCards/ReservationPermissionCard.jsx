import React, { useEffect } from "react";
import { Grid, Card, Switch, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const ReservationPermissionCard = (props) => {
  const { modules, setModules } = props;
  useEffect(() => {
    if (modules.Reservation_view === undefined) {
      setModules((prevModules) => ({
        ...prevModules,
        Reservation_view: true,
        Reservation_report: true, 
        Reservation_refund: true
      }));
    }
  }, [modules, setModules]);

  console.log("modules ====>", modules);

  const handleReservationViewChange = (event) => {
    const isReservationViewEnabled = event.target.checked;
    setModules({
      ...modules,
      Reservation_view: isReservationViewEnabled,
      ...(isReservationViewEnabled
        ? {}
        : { Reservation_report: false, Reservation_refund: false }),
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
                Reservation Module
              </MDTypography>
              <Tooltip
                title={`${
                  modules.Reservation_view ? "Disable" : "Enable"
                } Reservation module`}
                placement="top"
              >
                <Switch
                  checked={!!modules.Reservation_view}
                  onChange={handleReservationViewChange}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>

                

                <Grid item xs={6} md={3}>
                  <MDTypography variant="caption" fontWeight="regular">
                    Refund Reservation
                  </MDTypography>
                  <Switch
                    checked={modules.Reservation_refund}
                    onChange={(event) =>
                      setModules({
                        ...modules,
                        Reservation_refund: event.target.checked,
                      })
                    }
                    disabled={!modules.Reservation_view}
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

export default ReservationPermissionCard;
