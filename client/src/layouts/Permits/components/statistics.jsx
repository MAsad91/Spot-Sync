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
          <Grid item md={3} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="pending"
              title="Requested"
              value={`${data?.requestedPermits || 0}`}
            />
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="book_online"
              title="Expired"
              value={`${data?.expiredPermits || 0}`}
            />
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="real_estate_agent"
              title="Active"
              value={`${data?.activePermits || 0}`}
            />
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="settings_account_box"
              title="Active License Plate"
              value={`${data?.activeLicensePlates || 0}`}
            />
          </Grid>
        </Grid>
      </MDBox>
    </>
  );
};

export default Statistics;
