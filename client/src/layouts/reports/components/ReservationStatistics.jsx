import MDBox from "components/MDBox";
import DefaultSortInfoCard from "examples/Cards/InfoCards/DefaultInfoCard/DefaultSortInfoCard";
import React from "react";
import { useMaterialUIController } from "context";
import Grid from "@mui/material/Grid";

const Statistics = ({ type, data }) => {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;

  return (
    <>
      <MDBox>
        <Grid container alignItems="center" spacing={2}>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="book_online"
              title="Total Reservations"
              value={data.totalReservations === 0 ? "0" : data.totalReservations}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="real_estate_agent"
              title="Total Paid"
              value={data.totalPaid === 0 ? "0" : data.totalPaid}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="real_estate_agent"
              title="Total Failed"
              value={data.totalFailed === 0 ? "0" : data.totalFailed}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="settings_account_box"
              title="Total Refunded"
              value={data.totalRefunded === 0 ? "0" : data.totalRefunded}
            />
          </Grid>
        </Grid>
      </MDBox>
    </>
  );
};

export default Statistics;
