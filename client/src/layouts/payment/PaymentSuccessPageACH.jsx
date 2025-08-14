import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import bookedImg from "../../assets/images/booked.svg";
import { useMaterialUIController } from "context";
import { amountToShow } from "global/functions";
import MDButton from "components/MDButton";
import { useNavigate } from "react-router-dom";
import { get } from "lodash";

const PaymentSuccessPageACH = () => {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const navigate = useNavigate();
  const { darkMode } = controller;

  const [subscriptionData, setSubscriptionData] = useState({
    subscriptionNumber: "",
    totalAmount: "",
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const subscriptionNumber = searchParams.get("SN");
    const totalAmount = searchParams.get("total");
    setSubscriptionData({ subscriptionNumber, totalAmount });
  }, []);

  const renderSubscriptionInfo = () => {
    return (
      <Grid item xs={12} md={8} lg={5}>
        <Paper variant="outlined" className="mb-2">
          <CardContent>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
              className="mb-2"
            >
             {/* <Typography variant="subtitle1">Subscription ID :</Typography>
              <Typography variant="h6" color="secondary" className="fw-bold">
                {`${get(subscriptionData, "subscriptionNumber", "Pending")}`}
              </Typography> */}
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
              className="mb-2"
            >
              <Typography variant="subtitle1">Total :</Typography>
              <Typography variant="h6" color="secondary" className="fw-bold">
                {`$${amountToShow(subscriptionData.totalAmount)}`}
              </Typography>
            </Stack>
          </CardContent>
        </Paper>
      </Grid>
    );
  };

  return (
    <Box
      component="section"
      sx={{ py: { sm: 6.4, xs: 4 } }}
      className="d-flex align-items-center justify-content-center flex-wrap w-100"
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={10} sm={8} md={6} lg={5} className="text-center">
            <Box component="img" src={bookedImg} className="img-fluid" />
          </Grid>
          <Grid item xs={12} md={8} className="text-center">
            <Typography variant="h4" color="success" className="mb-2">
              Payment Successfully Done!
            </Typography>
            <Typography
              variant="subtitle2"
              color={darkMode ? "#ffffff" : "#1c1c1c"}
            >
              Once your payment is fully processed, we will update your
              subscription status and notify you via email/SMS.
            </Typography>
          </Grid>
          {renderSubscriptionInfo()}
          <Grid item xs={12}>
            <Stack
              direction={{ sm: "row", xs: "column" }}
              spacing={1}
              alignItems="center"
              justifyContent="center"
            >
              <MDButton
                color={sidenavColor}
                variant="contained"
                sx={{ width: { xs: "230px", md: "250px" } }}
                onClick={() => {
                  navigate("/parker-login");
                }}
              >
                GO TO Parker Dashboard
              </MDButton>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PaymentSuccessPageACH;
