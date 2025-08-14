import React, { useState, useEffect } from "react";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { Link } from "@mui/material";
import { Paper } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Formik } from "formik";
import { get } from "lodash";
import CreditCard from "./Card";
import PaymentSkeleton from "../PaymentSkelton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ChoosePaymentCard from "../ChoosePaymentCard";
import { useMaterialUIController } from "context";
import {
  amountToShow,
  getStripePublicKey
} from "global/functions";
import { getParkingShortlyData } from "store/slice/payment/paymentSlice";
import { getCardDetails } from "store/slice/payment/paymentSlice";
import GooglePay from "./GooglePay";

const ParkingPayment = () => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [shortlyData, setShortlyData] = useState({});
  const [processLoading, setProcessLoading] = useState(false);
  const shortlyId = new URLSearchParams(location?.search).get("sId");
  const cardDetails = useSelector((state) => state.payment.cardDetails);

  let stripePromise = null;
  if (get(shortlyData, "placeId", "") !== "") {
    const PUBLISHABLE_KEY = getStripePublicKey(shortlyData.placeId);
    stripePromise = loadStripe(PUBLISHABLE_KEY);
  }

  const [selectPayment, setSelectPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");

  useEffect(() => {
    if (!shortlyId) {
      navigate("payment/result", {
        state: { status: "invalid" },
      });
    } else {
      handleGetShortlyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortlyId]);

  async function handleGetShortlyData() {
    try {
      setProcessLoading(true);
      const res = await dispatch(getParkingShortlyData(shortlyId)).unwrap();
      if (!res?.success) {
        handleErrorResponse(res);
        return;
      }
      setShortlyData(res?.shortlyData);
      const customerId = res?.shortlyData?.customerId;
      console.log("customerId ====?", customerId);
      if (customerId) {
        await dispatch(getCardDetails({ id: customerId, placeId: res?.shortlyData?.placeId?._id }));
      }
    } catch (error) {
      console.error("Failed to get shortly data:", error);
    } finally {
      setProcessLoading(false);
    }
  }

  function handleErrorResponse(res) {
    const statusMap = {
      "Payment Link Expired": "expired",
      "Invalid Payment": "invalid",
      "Payment Already Paid": {
        status: "paid",
        data: res?.shortlyData,
      },
    };
    const status = statusMap[res?.message];
    if (!status) return;
    navigate("/parking/payment/result", {
      state: typeof status === "object" ? status : { status },
    });
  }

  console.log("shortlyData ===>", shortlyData);

  return (
    <>
      <Elements stripe={stripePromise}>
        <MDBox component="section">
          <Container maxWidth={false}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} md={8} lg={6} xl={4}>
                <Paper variant="outlined" height="100vh">
                  {!selectPayment ? (
                    <>
                      {processLoading ? (
                        <PaymentSkeleton />
                      ) : (
                        <>
                          <MDBox>
                            <Grid
                              height="100vh"
                              container
                              sx={{
                                background: darkMode ? "#1a2035" : "#FAF9F6",
                              }}
                            >
                              <MDBox
                                mt={2}
                                style={{
                                  height: "70px",
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                variant="contained"
                                color={darkMode ? "#ffffff" : "#000000"}
                                fontSize="25px"
                              >
                                {`$${amountToShow(shortlyData.totalAmount)}`}
                              </MDBox>
                              <Grid item xs={12}>
                                <MDBox mt={3} p={2}>
                                  <MDTypography
                                    sx={{ textAlign: "center" }}
                                    variant="h6"
                                    fontSize="14px"
                                  >
                                    Please Choose Your Payment Method to Confirm
                                    Your Parking Session
                                  </MDTypography>
                                </MDBox>
                              </Grid>
                              <Grid item xs={12}>
                                <>
                                {shortlyData.brandId?.isPaymentByCard && (
                                  <ChoosePaymentCard
                                    iconName="card"
                                    label="Card"
                                    selectPayment={selectPayment}
                                    setSelectPayment={setSelectPayment}
                                    setSelectedMethod={setSelectedMethod}
                                  />
                                )}
                                  {!shortlyData.isPayNowValidationLaterFlow && (
                                    <>
                                    {shortlyData.brandId?.isPaymentByGooglePay && (
                                      <ChoosePaymentCard
                                        iconName="googlePay"
                                        label="Google Pay"
                                        selectPayment={selectPayment}
                                        setSelectPayment={setSelectPayment}
                                        setSelectedMethod={setSelectedMethod}
                                      />
                                    )}
                                      {shortlyData.brandId?.isPaymentByApplePay && (
                                      <ChoosePaymentCard
                                        iconName="applePay"
                                        label="Apple Pay"
                                        selectPayment={selectPayment}
                                        setSelectPayment={setSelectPayment}
                                        setSelectedMethod={setSelectedMethod}
                                      />
                                    )}
                                    </>
                                  )}
                                </>
                              </Grid>

                              <Grid item xs={12}></Grid>
                              <Grid item xs={12}>
                                <MDBox
                                  mt={3}
                                  display="flex"
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <MDBox
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="center"
                                    alignItems="center"
                                  >
                                    <MDTypography
                                      variant="caption"
                                      color="text"
                                    >
                                      Payments Powered By
                                    </MDTypography>
                                    <MDBox>
                                      <img
                                        src={shortlyData.brandLogo}
                                        alt="card"
                                        style={{
                                          width: "80px",
                                          height: "50px",
                                          marginTop: "15px",
                                          objectFit: "contain",
                                          backgroundColor: "#FAF9F6",
                                        }}
                                      />
                                    </MDBox>
                                  </MDBox>
                                </MDBox>
                              </Grid>
                              <Grid xs={12}>
                                <MDBox p={2} textAlign="center">
                                  <MDTypography
                                    variant="caption"
                                    fontWeight="bold"
                                    fontSize="10px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    By tapping pay, you agree to the&nbsp;
                                    <Link
                                      href="https://www.spotsync.com/terms-of-use/"
                                      color="primary"
                                      fontWeight="bold"
                                      fontSize="10px"
                                    >
                                      Terms of use
                                    </Link>
                                    &nbsp; and&nbsp;
                                    <Link
                                      href="https://www.spotsync.com/privacy-policy/"
                                      color="primary"
                                      fontWeight="bold"
                                      fontSize="10px"
                                    >
                                      Privacy Policy
                                    </Link>
                                  </MDTypography>
                                </MDBox>
                              </Grid>
                            </Grid>
                          </MDBox>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <MDBox
                        style={{ overflowX: "hidden", height: "100vh" }}
                        sx={{ background: darkMode ? "#1a2035" : "#FAF9F6" }}
                      >
                        <MDTypography
                          variant="h5"
                          className="px-3 py-2"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            marginTop: "20px",
                          }}
                        >
                          Payment Information
                        </MDTypography>
                        <Divider light />
                        <CardContent sx={{ p: 2 }}>
                          {processLoading ? (
                            <PaymentSkeleton />
                          ) : (
                            <>
                              {selectedMethod === "card" && (
                                <Formik
                                  initialValues={{
                                    saveLater: true,
                                    selectedCard: get(
                                      cardDetails,
                                      "[0].id",
                                      ""
                                    ),
                                  }}
                                  onSubmit={async (values) => {
                                    console.log("values===", values);
                                  }}
                                >
                                  {(props) => (
                                    <form onSubmit={props.handleSubmit}>
                                      <CreditCard
                                        shortlyData={shortlyData}
                                        formikProps={props}
                                      />

                                      <Divider light className="my-3" />
                                    </form>
                                  )}
                                </Formik>
                              )}
                              {selectedMethod === "googlePay" && (
                                <>
                                  <GooglePay shortlyData={shortlyData} />
                                </>
                              )}
                              {selectedMethod === "applePay" && (
                                <>
                                  <GooglePay shortlyData={shortlyData} />
                                </>
                              )}
                            </>
                          )}

                          <MDBox
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                          >
                            <MDBox
                              style={{ cursor: "pointer" }}
                              variant="outlined"
                              color="text"
                              fontSize="small"
                              onClick={() => {
                                setSelectPayment(false);
                              }}
                            >
                              Choose Another Way To Pay
                            </MDBox>
                          </MDBox>
                          <Divider dark className="my-3" />

                          <MDBox
                            mt={3}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                          >
                            <MDBox
                              display="flex"
                              flexDirection="column"
                              justifyContent="center"
                              alignItems="center"
                            >
                              <MDTypography variant="caption" color="text">
                                Payments Powered By
                              </MDTypography>
                              <MDBox>
                                <img
                                  src={shortlyData.brandLogo}
                                  alt="card"
                                  style={{
                                    width: "80px",
                                    height: "40px",
                                    marginTop: "15px",
                                    objectFit: "contain",
                                    backgroundColor: "#FAF9F6",
                                  }}
                                />
                              </MDBox>
                            </MDBox>
                          </MDBox>
                          <MDBox>
                            <MDTypography
                              variant="caption"
                              fontWeight="bold"
                              fontSize="10px"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              marginTop="15px"
                            >
                              By tapping pay, you agree to the&nbsp;
                              <Link
                                href="https://www.spotsync.com/terms-of-use/"
                                color="primary"
                                fontWeight="bold"
                                fontSize="10px"
                              >
                                Terms of use
                              </Link>
                              &nbsp; and&nbsp;
                              <Link
                                href="https://www.spotsync.com/privacy-policy/"
                                color="primary"
                                fontWeight="bold"
                                fontSize="10px"
                              >
                                Privacy Policy
                              </Link>
                            </MDTypography>
                          </MDBox>
                        </CardContent>
                      </MDBox>
                    </>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </MDBox>
      </Elements>
    </>
  );
};

export default ParkingPayment;
