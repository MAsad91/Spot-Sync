import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { get } from "lodash";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useMaterialUIController } from "context";
import bookedImg from "../../assets/images/booked.svg";
import MDButton from "components/MDButton";
// import moment from "moment";
import { amountToShow } from "global/functions";

const PaymentSuccessPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const { darkMode } = controller;
  useEffect(() => {
    if (!state || !state?.status) {
      navigate("/");
    }
  }, [dispatch, navigate, state]);

  console.log("Data =====>", state.data);

  useEffect(() => {
    setTimeout(() => {
      console.log("close window (useEffect)----->");
      if (typeof window.postMessage !== "undefined") {
        console.log("enter if ====>");
        const responseObj = {
          eventData: {
            data: state?.data,
            sessionId: state?.data?.sessionId,
            errorMessage: state?.data?.message,
          },
          eventName:
            state?.status === "paid"
              ? state?.data?.isMonthlyReservation
                ? "paymentsuccess_monthly"
                : "paymentsuccess"
              : "paymentfailed",
        };
        window.parent.postMessage(responseObj, "*");
      }
    }, 1000);
  }, []);

  const renderSubscriptionInfo = () => {
    if (state?.status !== "paid") return null;
    return (
      <Grid item xs={12} md={8} lg={5}>
        <Paper variant="outlined" className="mb-2">
          <CardContent>
            {renderStack(
              "Subscription ID :",
              get(state, "data.subscriptionNumber", "")
            )}
            {renderStack(
              "Total :",
              ` $${
                state.data.isMonthly
                  ? amountToShow(state.data.firstMonthTotalAmount)
                  : amountToShow(state.data.totalAmount)
              } `
            )}
          </CardContent>
        </Paper>
      </Grid>
    );
  };

  const renderStack = (label, value) => (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="space-between"
      className="mb-2"
    >
      <Typography variant="subtitle1">{label}</Typography>
      <Typography variant="h6" color="secondary" className="fw-bold">
        {value}
      </Typography>
    </Stack>
  );

  const handelDownload = () => {
    const receiptURL = get(state, "data.receiptURL", false);
    if (receiptURL) {
      window.location.href = receiptURL; // Navigate to receiptURL
    }
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
              {/* Payment{" "} */}
              {state?.status === "paid"
                ? "Yay! Payment Successfully Done!"
                : state?.status === "expired"
                ? "Oops! Sorry this payment link was expired. Please try again!"
                : state?.status === "invalid"
                ? "Oops! Invalid Payment Link!"
                : state?.status === "failed"
                ? "Oops! Your Payment was Failed!"
                : state?.status === "inProcess"
                ? "Your Payment was in process. "
                : ""}
            </Typography>
            <Typography
              variant="subtitle2"
              color={darkMode ? "#ffffff" : "#1c1c1c"}
            >
              {state?.status === "paid" || state?.status === "inProcess"
                ? "One's we receive the payment we will update your subscription status and notify you via email/SMS"
                : state?.status === "expired"
                ? "Oops! Sorry this payment link was expired. Please try again!"
                : state?.status === "invalid"
                ? "Oops! Invalid Payment Link!"
                : state?.status === "failed"
                ? `${state.data.message}`
                : ""}
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
              {state?.status === "paid" && (
                <>
                  <MDButton
                    color={sidenavColor}
                    variant="contained"
                    sx={{ width: { xs: "230px", md: "250px" } }}
                    onClick={handelDownload}
                  >
                    Download Receipt
                  </MDButton>
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
                </>
              )}
              {state?.status === "failed" && (
                <MDButton
                  color={sidenavColor}
                  variant="contained"
                  sx={{ width: { xs: "230px", md: "250px" } }}
                  onClick={() => {
                    navigate(-1);
                  }}
                >
                  Go back to pay again
                </MDButton>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PaymentSuccessPage;
