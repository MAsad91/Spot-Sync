import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  Stack,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { get } from "lodash";
import MDTypography from "components/MDTypography";
import { amountToShow } from "global/functions";
import { useDispatch } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { dateToShow } from "global/functions";
import { getPaymentHistory } from "store/slice/customer/customerSlice";
import {
  capitalizeFirstLetter,
  getStripePublicKey
} from "global/functions";
import MDBox from "components/MDBox";
import PaymentMethod from "./PaymentMethod";

const PaymentAccordion = ({ customerId }) => {
  const [paymentHistory, setPaymentHistory] = useState([]);

  let stripePromise = null;
  if (paymentHistory.length > 0 && get(paymentHistory[0], "placeId", "") !== "") {
    const PUBLISHABLE_KEY = getStripePublicKey(paymentHistory[0].placeId);
    stripePromise = loadStripe(PUBLISHABLE_KEY);
  }

  const dispatch = useDispatch();
  console.log("customerId ===>", customerId);

  useEffect(() => {
    dispatch(getPaymentHistory(customerId))
      .unwrap()
      .then((result) => {
        if (result.success) {
          setPaymentHistory(result.data);
        }
      })
      .catch((err) => {
        throw err;
      });
  }, [dispatch, customerId]);

  const handelDownload = ({ receiptURL }) => {
    if (receiptURL) {
      window.location.href = receiptURL;
    }
  };

  console.log("paymentHistory ---->", paymentHistory);

  return (
    <>
      <Elements stripe={stripePromise}>
        {paymentHistory.map((item, index) => (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Stack>
                    <MDTypography variant="caption" fontWeight="bold">
                      {item?.subscriptionNumber}
                    </MDTypography>
                    <Stack direction="row" alignItems={"center"} bgColor="red">
                      <MDTypography variant="caption" fontWeight="regular">
                        Payment Status :
                      </MDTypography>
                      <MDTypography
                        variant="caption"
                        fontWeight="regular"
                        sx={{
                          marginLeft: "5px",
                          color: `${
                            item.paymentStatus === "success" ? "green" : "red"
                          }`,
                        }}
                      >
                        {capitalizeFirstLetter(item.paymentStatus)}
                      </MDTypography>
                    </Stack>
                    <MDTypography variant="caption" fontWeight="bold">
                      {item.transactionId
                        ? item.transactionId
                        : "Not Available"}
                    </MDTypography>

                    {item.paymentStatus === "failed" && (
                      <MDTypography
                        variant="caption"
                        fontWeight="regular"
                        sx={{ color: "red" }}
                      >
                        {item.paymentInfo?.message ? item.paymentInfo?.message : get(item, "paymentInfo.messages.message.0.text", "")}
                      </MDTypography>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack>
                    <MDTypography variant="caption" fontWeight="bold">
                      Transaction Date:
                    </MDTypography>
                    <MDTypography variant="caption" fontWeight="regular">
                      {dateToShow(get(item, "transactionDate", false))}
                    </MDTypography>
                  </Stack>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Stack gap={2}>
                <Stack
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                  bgColor="red"
                >
                  <MDTypography variant="body2" fontWeight="bold">
                    Payment Method Type
                  </MDTypography>
                  <MDTypography variant="body2" fontWeight="bold" color="gray">
                    {`${
                      item.paymentMethodType === "card"
                        ? "Credit card"
                        : item.paymentMethodType
                    }`}
                  </MDTypography>
                </Stack>
                {item?.licensePlate?.map((item, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <MDBox display="flex" gap={1}>
                      <MDTypography variant="body2" fontWeight="bold">
                        {item.licensePlateNumber}
                      </MDTypography>
                    </MDBox>
                    <MDBox>
                      <MDTypography
                        variant="body2"
                        fontWeight="bold"
                        color="gray"
                      >
                        {`$${amountToShow(item.price)}`}
                      </MDTypography>
                    </MDBox>
                  </Stack>
                ))}
                <Stack
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                  bgColor="red"
                >
                  <MDTypography variant="body2" fontWeight="bold">
                    Base Rate
                  </MDTypography>

                  <MDTypography variant="body2" fontWeight="bold" color="gray">
                    {`$${amountToShow(item?.baseRate)}`}
                  </MDTypography>
                </Stack>
                <Stack
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                  bgColor="red"
                >
                  <MDTypography variant="body2" fontWeight="bold">
                    Service Fee
                  </MDTypography>
                  <MDTypography variant="body2" fontWeight="bold" color="gray">
                    {`$${amountToShow(item?.serviceFee)}`}
                  </MDTypography>
                </Stack>
                <Stack
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                  bgColor="red"
                >
                  <MDTypography variant="body2" fontWeight="bold">
                    Tax
                  </MDTypography>

                  <MDTypography variant="body2" fontWeight="bold" color="gray">
                    {`$${amountToShow(item?.tax)}`}
                  </MDTypography>
                </Stack>

                {item?.cityTax > 0 && (
                  <Stack
                    direction="row"
                    alignItems={"center"}
                    justifyContent="space-between"
                    bgColor="red"
                  >
                    <MDTypography variant="body2" fontWeight="bold">
                      City Tax
                    </MDTypography>

                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      color="gray"
                    >
                      {`$${amountToShow(item?.cityTax)}`}
                    </MDTypography>
                  </Stack>
                )}

                {item?.countyTax > 0 && (
                  <Stack
                    direction="row"
                    alignItems={"center"}
                    justifyContent="space-between"
                    bgColor="red"
                  >
                    <MDTypography variant="body2" fontWeight="bold">
                      County Tax
                    </MDTypography>

                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      color="gray"
                    >
                      {`$${amountToShow(item?.countyTax)}`}
                    </MDTypography>
                  </Stack>
                )}

                {item?.paymentGatewayFeePayBy === "customer" && (
                  <Stack
                    direction="row"
                    alignItems={"center"}
                    justifyContent="space-between"
                    bgColor="red"
                  >
                    <MDTypography variant="body2" fontWeight="bold">
                      {` Payment Gateway Fee (${item?.paymentGatewayFeePayBy})`}
                    </MDTypography>

                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      color="gray"
                    >
                      {`$${amountToShow(item?.paymentGatewayFee)}`}
                    </MDTypography>
                  </Stack>
                )}

                <Stack
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                  bgColor="red"
                >
                  <MDTypography variant="body2" fontWeight="bold">
                    Net Paid Amount
                  </MDTypography>

                  <MDTypography variant="body2" fontWeight="bold" color="gray">
                    {`$${amountToShow(item?.totalAmount)}`}
                  </MDTypography>
                </Stack>
              </Stack>
              <MDBox>
                <PaymentMethod
                  paymentData={item}
                  paymentMethodId={item?.paymentMethodId}
                  customerId={item?.stripeCustomerId}
                  isACHPayment={item.paymentMethodType === "ACH" ? true : false}
                  isDirectCharge={item.isDirectCharge}
                />
              </MDBox>
              {item.paymentStatus === "success" && (
                <MDBox>
                  <Button
                    fullWidth
                    color="white"
                    variant="contained"
                    size="small"
                    onClick={() =>
                      handelDownload({ receiptURL: item.receiptURL })
                    }
                  >
                    Download Receipt
                  </Button>
                </MDBox>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Elements>
    </>
  );
};

export default PaymentAccordion;
