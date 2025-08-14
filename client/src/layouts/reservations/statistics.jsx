import MDBox from "components/MDBox";
import DefaultSortInfoCard from "examples/Cards/InfoCards/DefaultInfoCard/DefaultSortInfoCard";
import React from "react";
import { useMaterialUIController } from "context";
import Grid from "@mui/material/Grid";
import { centsToDollars } from "global/functions";

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
              icon="book_online"
              title="Total Revenue"
              value={`$${centsToDollars(data.totalRevenue || 0)}`}
            />
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="real_estate_agent"
              title="Total Sales Tax"
              value={`$${centsToDollars(data.totalTax || 0)}`}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="real_estate_agent"
              title="Total City Tax"
              value={`${centsToDollars(data.totalCityTax || 0)}`}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="real_estate_agent"
              title="Total County Tax"
              value={`${centsToDollars(data.totalCountyTax || 0)}`}
            />
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="settings_account_box"
              title="Service Fee"
              value={`$${centsToDollars(data.totalServiceFee || 0)}`}
            />
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="book_online"
              title="Total Net Revenue"
              value={`$${centsToDollars(data.totalOwnerPayout || 0)}`}
            />
          </Grid>
        </Grid>
      </MDBox>
    </>
  );
};

export default Statistics;
