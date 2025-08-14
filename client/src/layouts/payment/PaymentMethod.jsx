import React, { useEffect, useState } from "react";
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
import PaymentSkeleton from "./PaymentSkelton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useLocation, useNavigate } from "react-router-dom";
import { getShortlyData } from "store/slice/payment/paymentSlice";
import { useDispatch, useSelector } from "react-redux";
import { getCardDetails } from "store/slice/payment/paymentSlice";
import ChoosePaymentCard from "./ChoosePaymentCard";
import { useMaterialUIController } from "context";
import ACHPaymentForm from "./ACHPaymentForm";
import CashPaymentForm from "./CashPaymentForm";
import {
  amountToShow,
  getStripePublicKey
} from "global/functions";
import { generateClientSecret } from "store/slice/payment/paymentSlice";

const PaymentMethod = () => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [subscriptionData, setSubscriptionData] = useState({});
  const [brandLogo, setBrandLogo] = useState("");
  const [processLoading, setProcessLoading] = useState(false);
  const shortlyId = new URLSearchParams(location?.search).get("shortlyId");
  const cardDetails = useSelector((state) => state.payment.cardDetails);
  let loading = useSelector((state) => state.payment.loading);
  const paymentMethodsLoading = useSelector(
    (state) => state.payment.paymentMethodsLoading
  );

  let stripePromise = null;
  if (get(subscriptionData, "placeId", null)) {
    const PUBLISHABLE_KEY = getStripePublicKey(subscriptionData.placeId);
    stripePromise = loadStripe(PUBLISHABLE_KEY);
  }

  const [selectPayment, setSelectPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const totalPayAmount = subscriptionData.isMonthly
    ? get(subscriptionData, "firstMonthTotalAmount", 0)
    : get(subscriptionData, "totalAmount", 0);
  useEffect(() => {
    console.log("shortlyId ====>", shortlyId);
    if (!shortlyId) {
      navigate("/");
    } else {
      handleGetShortlyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortlyId]);

  async function handleGetShortlyData() {
    try {
      setProcessLoading(true);
      const res = await dispatch(getShortlyData(shortlyId)).unwrap();
      if (!res?.success) {
        handleErrorResponse(res);
        return;
      }
      if (!res.shortlyData?.subscriptionId) {
        setProcessLoading(false);
        return;
      }
      const { subscriptionId, brandLogo, clientSecretACH } = res.shortlyData;
      setSubscriptionData(subscriptionId || {});
      setBrandLogo(brandLogo || "");
      if (clientSecretACH && clientSecretACH !== undefined) {
        setClientSecret(clientSecretACH || "");
      } else {
        setProcessLoading(true);
        const payload = {
          subscriptionId: subscriptionId._id,
          shortlyId: shortlyId,
        };
        await dispatch(generateClientSecret(payload))
          .unwrap()
          .then((result) => {
            console.log("result =====>", result);
            if (result.success && result.clientSecret) {
              setClientSecret(result.clientSecret);
              setProcessLoading(false);
            }
          })
          .catch((err) => {
            setProcessLoading(false);
            console.log("err =======>", err);
          });
      }

      const customerId = subscriptionId.customerId;
      if (customerId?._id) {
        await dispatch(getCardDetails({ id: customerId._id, placeId: subscriptionId.placeId._id }));
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
      "Payment In Process": "inProcess",
      "Payment Already Paid": {
        status: "paid",
        data: res?.shortlyData?.subscriptionId,
      },
    };

    const status = statusMap[res?.message];
    if (!status) return;

    navigate("payment-result", {
      state: typeof status === "object" ? status : { status },
    });
  }

  console.log("clientSecret =====>", clientSecret);

  const options = {
    clientSecret: clientSecret,
  };
  return (
    <>
      <MDBox component="section">
        <Container maxWidth={false}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={8} lg={6} xl={4}>
              <Paper variant="outlined" height="100vh">
                {!selectPayment ? (
                  <>
                    {processLoading || loading || paymentMethodsLoading ? (
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
                              {`$${amountToShow(totalPayAmount)}`}
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
                              {subscriptionData.isAutoRenew ? (
                                <>
                                {subscriptionData.brandId?.isPaymentByCard && (
                                  <ChoosePaymentCard
                                    iconName="card"
                                    label="Card"
                                    selectPayment={selectPayment}
                                    setSelectPayment={setSelectPayment}
                                    setSelectedMethod={setSelectedMethod}
                                  />
                                )}
                                {subscriptionData.brandId?.isPaymentByAch && (
                                  <ChoosePaymentCard
                                    iconName="ach"
                                    label="ACH"
                                    selectPayment={selectPayment}
                                    setSelectPayment={setSelectPayment}
                                    setSelectedMethod={setSelectedMethod}
                                  />
                                )}
                                </>
                              ) : (
                                <>
                                {subscriptionData.brandId?.isPaymentByCard && (
                                  <ChoosePaymentCard
                                    iconName="card"
                                    label="Card"
                                    selectPayment={selectPayment}
                                    setSelectPayment={setSelectPayment}
                                    setSelectedMethod={setSelectedMethod}
                                  />
                                )}
                                {subscriptionData.brandId?.isPaymentByGooglePay && (
                                  <ChoosePaymentCard
                                    iconName="googlePay"
                                    label="Google Pay"
                                    selectPayment={selectPayment}
                                    setSelectPayment={setSelectPayment}
                                    setSelectedMethod={setSelectedMethod}
                                  />
                                )}
                                {subscriptionData.brandId?.isPaymentByApplePay && (
                                  <ChoosePaymentCard
                                    iconName="applePay"
                                    label="Apple Pay"
                                    selectPayment={selectPayment}
                                    setSelectPayment={setSelectPayment}
                                    setSelectedMethod={setSelectedMethod}
                                  />
                                )}
                                {subscriptionData.brandId?.isPaymentByCash && (
                                  <ChoosePaymentCard
                                    iconName="cash"
                                    label="Cash"
                                    selectPayment={selectPayment}
                                    setSelectPayment={setSelectPayment}
                                    setSelectedMethod={setSelectedMethod}
                                  />
                                )}
                                </>
                              )}
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
                                  <MDTypography variant="caption" color="text">
                                    Payments Powered By
                                  </MDTypography>
                                  <MDBox>
                                    <img
                                      src={brandLogo}
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
                                    href="https://www.ISBParking.pk/terms-of-use/"
                                    color="primary"
                                    fontWeight="bold"
                                    fontSize="10px"
                                  >
                                    Terms of use
                                  </Link>
                                  &nbsp; and&nbsp;
                                  <Link
                                    href="https://www.ISBParking.pk/privacy-policy/"
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
                        {processLoading || loading || paymentMethodsLoading ? (
                          <PaymentSkeleton />
                        ) : (
                          <>
                            {selectedMethod === "card" && (
                              <Formik
                                initialValues={{
                                  saveLater: true,
                                  selectedCard: get(cardDetails, "[0].id", ""),
                                }}
                                onSubmit={async (values) => {
                                  console.log("values===", values);
                                }}
                              >
                                {(props) => (
                                  <form onSubmit={props.handleSubmit}>
                                    <Elements stripe={stripePromise}>
                                      <CreditCard
                                        subscriptionData={subscriptionData}
                                        formikProps={props}
                                      />
                                    </Elements>
                                    <Divider light className="my-3" />
                                  </form>
                                )}
                              </Formik>
                            )}
                            {selectedMethod === "ach" && (
                              <Formik
                                initialValues={{
                                  subscriptionId: subscriptionData._id,
                                  customerId: get(
                                    subscriptionData,
                                    "customerId._id",
                                    false
                                  ),
                                }}
                                onSubmit={async (values) => {
                                  console.log("values===", values);
                                }}
                              >
                                {(props) => (
                                  <form
                                    id="payment-form"
                                    onSubmit={props.handleSubmit}
                                  >
                                    <Elements
                                      stripe={stripePromise}
                                      options={options}
                                    >
                                      <ACHPaymentForm
                                        clientSecret={clientSecret}
                                        setClientSecret={setClientSecret}
                                        subscriptionData={subscriptionData}
                                        formikProps={props}
                                      />
                                    </Elements>
                                    <Divider light className="my-3" />
                                  </form>
                                )}
                              </Formik>
                            )}
                            {selectedMethod === "cash" && (
                              <CashPaymentForm
                                subscriptionData={subscriptionData}
                                formikProps={{}}
                              />
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
                                src={brandLogo}
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
                              href="https://www.ISBParking.pk/terms-of-use/"
                              color="primary"
                              fontWeight="bold"
                              fontSize="10px"
                            >
                              Terms of use
                            </Link>
                            &nbsp; and&nbsp;
                            <Link
                              href="https://www.ISBParking.pk/privacy-policy/"
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
    </>
  );
};

export default PaymentMethod;
