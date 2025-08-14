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
          {type === "active" ? (
            <>
              <Grid item  md={3} xs={12}>
                <DefaultSortInfoCard
                  color={sidenavColor}
                  icon="book_online"
                  title="Expired"
                  value={`${data?.expiredSubscriptions || 0}`}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DefaultSortInfoCard
                  color={sidenavColor}
                  icon="real_estate_agent"
                  title="Active"
                  value={`${data?.activeSubscriptions || 0}`}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DefaultSortInfoCard
                  color={sidenavColor}
                  icon="settings_account_box"
                  title="Active License Plate"
                  value={`${data?.activeLicensePlates || 0}`}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DefaultSortInfoCard
                  color={sidenavColor}
                  icon="book_online"
                  title="Total Revenue"
                  value={`$${centsToDollars(data?.totalRevenue || 0)}`}
                />
              </Grid>
              {/* <Grid item md={3} sm={6} xs={12}>
                <DefaultSortInfoCard
                  color={sidenavColor}
                  icon="account_balance"
                  title="Total Renew Count"
                  value={`${data?.totalRenewalCount || 0}`}
                />
              </Grid> */}
            </>
          ) : (
            <>
              <Grid item md={3} sm={6} xs={12}>
                <DefaultSortInfoCard
                  color={sidenavColor}
                  icon="settings_account_box"
                  title="Total Users"
                  value="160"
                />
              </Grid>
              <Grid item md={3} sm={6} xs={12}>
                <DefaultSortInfoCard
                  color={sidenavColor}
                  icon="book_online"
                  title="Total License Plate"
                  value="591"
                />
              </Grid>
              <Grid item md={3} sm={6} xs={12}>
                <DefaultSortInfoCard
                  color={sidenavColor}
                  icon="real_estate_agent"
                  title="Payment Success"
                  value="135"
                />
              </Grid>
              <Grid item md={3} sm={6} xs={12}>
                <DefaultSortInfoCard
                  color={sidenavColor}
                  icon="book_online"
                  title="Total Payment Failed"
                  value="150"
                />
              </Grid>
            </>
          )}
        </Grid>
      </MDBox>
    </>
  );
};

export default Statistics;
