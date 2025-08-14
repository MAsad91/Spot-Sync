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
          <>
            <Grid item md={3} xs={12}>
              <DefaultSortInfoCard
                color={sidenavColor}
                icon="book_online"
                title="Attempts"
                value={`${data?.totalAttempts || 0}`}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DefaultSortInfoCard
                color={sidenavColor}
                icon="attach_money"
                title="Successed"
                value={`${data?.totalSuccess || 0}`}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DefaultSortInfoCard
                color={sidenavColor}
                icon="money_off_icon"
                title="Failed"
                value={`${data?.totalFailed || 0}`}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DefaultSortInfoCard
                color={sidenavColor}
                icon="pending_icon"
                title="Refunded"
                value={`${data?.totalRefunded || 0}`}
              />
            </Grid>

            <Grid item md={3} xs={12}>
              <DefaultSortInfoCard
                color={sidenavColor}
                icon="book_online"
                title="Total Amount"
                value={`$${centsToDollars(data?.totalAmount || 0)}`}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DefaultSortInfoCard
                color={sidenavColor}
                icon="attach_money"
                title="Successed Amount"
                value={`$${centsToDollars(data?.totalSuccessAmount || 0)}`}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DefaultSortInfoCard
                color={sidenavColor}
                icon="money_off_icon"
                title="Failed Amount"
                value={`$${centsToDollars(data?.totalFailedAmount || 0)}`}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DefaultSortInfoCard
                color={sidenavColor}
                icon="pending_icon"
                title="Refunded Amount"
                value={`$${centsToDollars(data?.totalRefundedAmount || 0)}`}
              />
            </Grid>

            <Grid item md={3} xs={12}>
              <DefaultSortInfoCard
                color={sidenavColor}
                icon="account_balance_wallet"
                title="# Card Payments"
                value={`${data?.totalCardPayments || 0}`}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DefaultSortInfoCard
                color={sidenavColor}
                icon="account_balance_wallet"
                title="# ACH Payments"
                value={`${data?.totalACHPayments || 0}`}
              />
            </Grid>
          </>
        </Grid>
      </MDBox>
    </>
  );
};

export default Statistics;
