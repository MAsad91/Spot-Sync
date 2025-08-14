import MDBox from "components/MDBox";
import DefaultSortInfoCard from "examples/Cards/InfoCards/DefaultInfoCard/DefaultSortInfoCard";
import React from "react";
import { useMaterialUIController } from "context";
import Grid from "@mui/material/Grid";
import { centsToUSD } from "global/functions";

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
              title="Total Revenue"
              value={`${centsToUSD(data.totalRevenue || 0)}`}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="real_estate_agent"
              title="Total Sales Tax"
              value={`${centsToUSD(data.totalTax || 0)}`}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="real_estate_agent"
              title="Total City Tax"
              value={`${centsToUSD(data.totalCityTax || 0)}`}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="real_estate_agent"
              title="Total County Tax"
              value={`${centsToUSD(data.totalCountyTax || 0)}`}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="settings_account_box"
              title="Service Fee"
              value={`${centsToUSD(data.totalServiceFee || 0)}`}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="settings_account_box"
              title="Payment Gateway Fee"
              value={`${centsToUSD(data.totalPaymentGatewayFee || 0)}`}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="book_online"
              title="Owner Payout"
              value={`${centsToUSD(data.totalOwnerPayout || 0)}`}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="book_online"
              title="ISBParking Revenue"
              value={`${centsToUSD(data.totalIsbpRevenue || 0)}`}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="book_online"
              title="Total Refunds"
              value={`${centsToUSD(data.totalRefunds || 0)}`}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="book_online"
              title="Pending Payments"
              value={`${centsToUSD(data.totalPendingPayments || 0)}`}
            />
          </Grid>
          <Grid item md={4} sm={6} xs={12}>
            <DefaultSortInfoCard
              color={sidenavColor}
              icon="book_online"
              title="Failed Payments"
              value={`${centsToUSD(data.totalFailedPayments || 0)}`}
            />
          </Grid>
        </Grid>
      </MDBox>
    </>
  );
};

export default Statistics;
