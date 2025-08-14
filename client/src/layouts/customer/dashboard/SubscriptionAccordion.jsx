import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Grid,
  Icon,
  IconButton,
  Stack,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { get } from "lodash";
import { getSubscriptionDuration } from "global/functions";
import { getDatesFromDuration } from "global/functions";
import MDTypography from "components/MDTypography";
import { amountToShow } from "global/functions";
import MDBox from "components/MDBox";
import PaymentMethod from "./PaymentMethod";
import { useDispatch } from "react-redux";
import { getPaymentMethod } from "store/slice/customer/customerSlice";
import UpdatePaymentMethod from "./UpdatePaymentMethod";
import UpdatePaymentMethodAuthorizenet from "./UpdatePaymentMethodAuthorizenet";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import ConfirmationDialog from "components/Common/ConfirmationDialog";
import { cancelSubscription } from "store/slice/customer/customerSlice";
import { getSubscriptionsList } from "store/slice/customer/customerSlice";
import CircularIndeterminate from "components/MDLoading";
import { dateToShow } from "global/functions";
import MDInput from "components/MDInput";
import { updateLicensePlate } from "store/slice/customer/customerSlice";
import { getTimezoneName } from "global/functions";
import { useMaterialUIController } from "context";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AddLicensePlateDialog from "./AddLicensePlateDialog";
import PendingMessageDialog from "./PendingMessageDialog";
import { deleteLicensePlate } from "store/slice/customer/customerSlice";
import { renewSubscription } from "store/slice/customer/customerSlice";
import {
  getStripePublicKey,
  getStripeCustomerId,
} from "global/functions";
import moment from "moment";

const SubscriptionAccordion = ({ subscription }) => {
  let stripePromise = null;
  if (get(subscription, "placeId", null)) {
    const PUBLISHABLE_KEY = getStripePublicKey(subscription.placeId);
    stripePromise = loadStripe(PUBLISHABLE_KEY);
  }

  const dispatch = useDispatch();
  const [PaymentMethodData, setPaymentMethodData] = useState({});
  const [paymentMethodEdit, setPaymentMethodEdit] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [licensePlateDialog, setLicensePlateDialog] = useState(false);
  const [pendingMessageDialog, setPendingMessageDialog] = useState(false);
  const [updateCard, setUpdateCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [cancelMessage, setCancelMessage] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLicensePlateNumber, setDeleteLicensePlateNumber] = useState("");
  const [licensePlateState, setLicensePlateState] = useState("");
  const [chargeDialogOpen, setChargeDialogOpen] = useState(false);
  const [reActiveDialogOpen, setReActiveDialogOpen] = useState(false);
  const [isReActivate, setIsReActivate] = useState(false);
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const [updateLicensePlateAlert, setUpdateLicensePlateAlert] = useState({
    isAlert: false,
    success: false,
    message: "",
  });

  const [editLicensePlate, setEditLicensePlate] = useState(() =>
    Array.from({ length: subscription.licensePlate.length }).fill(false)
  );
  const [licensePlateValue, setLicensePlateValue] = useState(
    new Array(subscription.licensePlate.length).fill("")
  );

  const duration = getSubscriptionDuration({
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    tz: getTimezoneName(),
  });
  const dates = getDatesFromDuration({ duration });

  useEffect(() => {
    const params = {
      customerId: getStripeCustomerId(subscription.customerId, subscription.placeId),
      paymentMethodId: get(subscription, "defaultPaymentMethodId", ""),
      authorizenetCustomerId: get(
        subscription,
        "paymentId.authorizenetCustomerId",
        ""
      ),
      placeId: get(subscription, "placeId", ""),
      subscriptionId: subscription._id,
    };
    dispatch(getPaymentMethod(params))
      .unwrap()
      .then((result) => {
        if (result.success) {
          setPaymentMethodData(result.data);
        }
      })
      .catch((err) => {
        throw err;
      });
  }, [dispatch, subscription, subscription.defaultPaymentMethodId]);

  const handelCancelSubscription = async () => {
    setLoading(true);
    await dispatch(cancelSubscription({
      subscriptionId:subscription._id,
      isReActive:isReActivate 
    }))
      .unwrap()
      .then(async (res) => {
        const success = res?.success;
        if (success) {
          await dispatch(getSubscriptionsList());
          setIsReActivate(false)
          setLoading(false);
          setDialogOpen(false);
        }
        setLoading(false);
        setDialogOpen(false);
      })
      .catch((err) => {
        console.error("Error getting cancel:", err);
      });
  };

  const handleEditLicensePlate = (index) => {
    setEditLicensePlate((prevEditLicensePlate) => {
      const newEditLicensePlate = [...prevEditLicensePlate];
      newEditLicensePlate[index] = !newEditLicensePlate[index];
      return newEditLicensePlate;
    });
    if (!editLicensePlate[index]) {
      setLicensePlateValue((prevLicensePlateValue) => {
        const newLicensePlateValue = [...prevLicensePlateValue];
        newLicensePlateValue[index] =
          subscription.licensePlate[index].licensePlateNumber;
        return newLicensePlateValue;
      });
    } else {
      setLicensePlateValue((prevLicensePlateValue) => {
        const newLicensePlateValue = [...prevLicensePlateValue];
        newLicensePlateValue[index] = "";
        return newLicensePlateValue;
      });
    }
  };

  const handleInputChange = (index, value) => {
    const newLicensePlateValue = [...licensePlateValue];
    newLicensePlateValue[index] = value;
    setLicensePlateValue(newLicensePlateValue);
  };

  const handleSaveChanges = async (index) => {
    if (
      subscription.licensePlate[index].licensePlateNumber ===
      licensePlateValue[index]
    ) {
      console.log("No changes to license plate number.");
      return;
    }

    const updatedLicensePlate = subscription.licensePlate.map((item, idx) =>
      idx === index
        ? { ...item, licensePlateNumber: licensePlateValue[index] }
        : item
    );

    const result = updatedLicensePlate.filter(
      (up) =>
        !subscription.licensePlate.some(
          (sp) => sp.licensePlateNumber === up.licensePlateNumber
        )
    );
    if (result.length === 0) {
      return;
    }
    const payload = {
      licensePlate: result.map(({ _id, licensePlateNumber }) => ({
        _id,
        licensePlateNumber,
      })),
    };

    setLoading(true);

    try {
      const res = await dispatch(
        updateLicensePlate({ subscriptionId: subscription._id, ...payload })
      ).unwrap();
      dispatch(getSubscriptionsList());
      setUpdateLicensePlateAlert({
        isAlert: true,
        success: res?.success,
        message: res.message,
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      setUpdateLicensePlateAlert({
        isAlert: true,
        success: false,
        message: "Failed to update license plate.",
      });
    } finally {
      setLoading(false);
      setEditLicensePlate((prev) =>
        prev.map((edit, idx) => (idx === index ? false : edit))
      );
    }
  };
  const handelDownload = ({ receiptURL }) => {
    if (receiptURL) {
      window.location.href = receiptURL;
    }
  };
  const handelDeleteLicensePlate = async () => {
    try {
      const payload = {
        licensePlateId: deleteLicensePlateNumber,
      };
      const res = await dispatch(
        deleteLicensePlate({ subscriptionId: subscription._id, ...payload })
      ).unwrap();
      dispatch(getSubscriptionsList());
      setUpdateLicensePlateAlert({
        isAlert: true,
        success: res?.success,
        message: res.message,
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      setDeleteDialogOpen(false);
      console.error("Error saving changes:", error);
      setUpdateLicensePlateAlert({
        isAlert: true,
        success: false,
        message: "Failed to delete license plate.",
      });
    }
  };

  const handelRenew = async () => {
    try {
      setLoading(true);
      const res = await dispatch(renewSubscription({
        subscriptionId:subscription._id,
        isReActive:isReActivate 
      })).unwrap();
      dispatch(getSubscriptionsList());
      setUpdateLicensePlateAlert({
        isAlert: true,
        success: res?.success,
        message: res.message,
      });
      isReActivate ? setReActiveDialogOpen(false) : setChargeDialogOpen(false);
      setIsReActivate(false);
      setLoading(false);
    } catch (error) {
      setChargeDialogOpen(false);
      setLoading(false);
      console.error("Error charging:", error);
      setUpdateLicensePlateAlert({
        isAlert: true,
        success: false,
        message: "Failed to Charge Subscription.",
      });
    }
  };

  let paymentGatewayFee = 0;
  if (
    get(subscription, "placeId.paymentGatewayFeePayBy", "isbp") === "customer"
  ) {
    if (subscription.renewalCount === 0 && subscription.isMonthly) {
      paymentGatewayFee = subscription.firstMonthPaymentGatewayFee;
    } else {
      paymentGatewayFee = subscription.paymentGatewayFee;
    }
  }

  const licensePlateArray = subscription?.licensePlate?.filter(
    (obj) => obj.status !== 0
  );

  return (
    <>
      <Elements stripe={stripePromise}>
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
                    {subscription.subscriptionNumber}
                  </MDTypography>
                  <MDTypography variant="caption" fontWeight="regular">
                    {get(subscription, "placeId.google.formatted_address", "")}
                  </MDTypography>
                  {subscription.subscriptionStatus === "cancel" && (
                    <MDTypography
                      variant="caption"
                      fontWeight="regular"
                      sx={{ color: "red" }}
                    >
                      {` Subscription has been canceled on : ${dateToShow(
                        subscription.subscriptionCancelDate
                      )}`}
                    </MDTypography>
                  )}
                  {subscription.isSubscriptionPaused && (
                    <MDTypography
                      variant="caption"
                      fontWeight="regular"
                      sx={{ color: "red" }}
                    >
                      {` Subscription is paused and will be resumed on : ${dateToShow(
                        subscription.resumeDate
                      )}`}
                    </MDTypography>
                  )}

                </Stack>
              </Grid>
              <Grid item xs={4}>
                <Stack>
                  <MDTypography variant="caption" fontWeight="bold">
                    {subscription.isAutoRenew
                      ? "Renewal Date"
                      : "Expiration Date"}
                  </MDTypography>
                  <MDTypography variant="caption" fontWeight="regular">
                    {dates.nextRenewalDate}
                  </MDTypography>
                </Stack>
              </Grid>
            </Grid>
          </AccordionSummary>

          <AccordionDetails>
            <MDBox py={2}>
              <Button
                style={{
                  backgroundColor: darkMode ? "#1a2035" : "#ffffff",
                }}
                color="white"
                variant="contained"
                size="small"
                onClick={() => setLicensePlateDialog(true)}
              >
                + License Plate
              </Button>
            </MDBox>

            <Stack gap={2}>
              {updateLicensePlateAlert.isAlert && (
                <Alert
                  severity={`${
                    updateLicensePlateAlert.success ? "success" : "error"
                  }`}
                  className="mb-2"
                  onClose={() => {
                    setUpdateLicensePlateAlert({ isAlert: false });
                  }}
                >
                  {updateLicensePlateAlert.message}
                </Alert>
              )}

              {licensePlateArray.map((item, index) => (
                <Stack
                  key={index}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <MDBox display="flex" gap={1}>
                    {editLicensePlate[index] ? (
                      <>
                        <MDInput
                          label="Plate Number"
                          value={licensePlateValue[index]}
                          onChange={(e) =>
                            handleInputChange(index, e.target.value)
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleEditLicensePlate(index)}
                        >
                          <Icon>cancel</Icon>
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleSaveChanges(index)}
                        >
                          <Icon>done</Icon>
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <MDTypography
                          variant="body2"
                          fontWeight="bold"
                          sx={{
                            color: `${item.status !== 10 ? "lightGray" : ""}`,
                          }}
                        >
                          {item.licensePlateNumber}
                        </MDTypography>
                        {item.status === 10 ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleEditLicensePlate(index)}
                            >
                              <Icon
                                style={{
                                  color: darkMode ? "#ffffff" : "#1c1c1c",
                                }}
                              >
                                edit
                              </Icon>
                            </IconButton>
                            {licensePlateArray.filter(
                              (plate) => plate.status === 10
                            ).length > 1 && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeleteLicensePlateNumber(item._id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Icon
                                  style={{
                                    color: darkMode ? "#ffffff" : "#1c1c1c",
                                  }}
                                >
                                  delete
                                </Icon>
                              </IconButton>
                            )}
                          </>
                        ) : item.status === 1 ? (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setLicensePlateState("pending");
                              setPendingMessageDialog(true);
                            }}
                          >
                            <Icon
                              style={{
                                color: "blue",
                              }}
                            >
                              <ErrorOutlineIcon />
                            </Icon>
                          </IconButton>
                        ) : item.status === 2 ? (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setLicensePlateState("decline");
                              setPendingMessageDialog(true);
                            }}
                          >
                            <Icon
                              style={{
                                color: "red",
                              }}
                            >
                              <ErrorOutlineIcon />
                            </Icon>
                          </IconButton>
                        ) : item.status === 3 ? (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setLicensePlateState("refunded");
                              setPendingMessageDialog(true);
                            }}
                          >
                            <Icon
                              style={{
                                color: "orange",
                              }}
                            >
                              <ErrorOutlineIcon />
                            </Icon>
                          </IconButton>
                        ) : null}
                      </>
                    )}
                  </MDBox>
                  <MDBox>
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        color: `${item.status !== 10 ? "lightGray" : ""}`,
                      }}
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
                  Applied Tax On Service Fee
                </MDTypography>
                <MDTypography variant="body2" fontWeight="bold" color="gray">
                  {subscription.isApplyTaxOnServiceFee ? "Yes" : "No"}
                </MDTypography>
              </Stack>
              <Stack
                direction="row"
                alignItems={"center"}
                justifyContent="space-between"
                bgColor="red"
              >
                <MDTypography variant="body2" fontWeight="bold">
                  Base Rate
                </MDTypography>
                {subscription.isMonthly &&
                subscription.renewalCount === 0 &&
                subscription?.baseRate !== subscription?.firstMonthBaseRate ? (
                  <Stack direction="row" spacing={1}>
                    <MDTypography
                      variant="body2"
                      fontWeight="regular"
                      color="gray"
                      sx={{ textDecoration: "line-through" }}
                    >
                      {`$${amountToShow(subscription.baseRate)}`}
                    </MDTypography>
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      color="gray"
                    >
                      {`$${amountToShow(subscription.firstMonthBaseRate)}`}
                    </MDTypography>
                  </Stack>
                ) : (
                  <MDTypography variant="body2" fontWeight="bold" color="gray">
                    {`$${amountToShow(subscription.baseRate)}`}
                  </MDTypography>
                )}
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
                  {`$${amountToShow(
                    subscription.serviceFee + paymentGatewayFee
                  )}`}
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
                {subscription.isMonthly &&
                subscription.renewalCount === 0 &&
                subscription?.tax !== subscription?.firstMonthTax ? (
                  <Stack direction="row" spacing={1}>
                    <MDTypography
                      variant="body2"
                      fontWeight="regular"
                      color="gray"
                      sx={{ textDecoration: "line-through" }}
                    >
                      {`$${amountToShow(subscription.tax)}`}
                    </MDTypography>
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      color="gray"
                    >
                      {`$${amountToShow(subscription.firstMonthTax)}`}
                    </MDTypography>
                  </Stack>
                ) : (
                  <MDTypography variant="body2" fontWeight="bold" color="gray">
                    {`$${amountToShow(subscription.tax)}`}
                  </MDTypography>
                )}
              </Stack>

              {subscription.cityTax && subscription.cityTax > 0 ? (
                <Stack
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                  bgColor="red"
                >
                  <MDTypography variant="body2" fontWeight="bold">
                    City Tax
                  </MDTypography>
                  {subscription.isMonthly &&
                  subscription.renewalCount === 0 &&
                  subscription?.cityTax !== subscription?.firstMonthCityTax ? (
                    <Stack direction="row" spacing={1}>
                      <MDTypography
                        variant="body2"
                        fontWeight="regular"
                        color="gray"
                        sx={{ textDecoration: "line-through" }}
                      >
                        {`$${amountToShow(subscription.cityTax)}`}
                      </MDTypography>
                      <MDTypography
                        variant="body2"
                        fontWeight="bold"
                        color="gray"
                      >
                        {`$${amountToShow(subscription.firstMonthCityTax)}`}
                      </MDTypography>
                    </Stack>
                  ) : (
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      color="gray"
                    >
                      {`$${amountToShow(subscription.cityTax)}`}
                    </MDTypography>
                  )}
                </Stack>
              ) : (
                ""
              )}

              {subscription.countyTax && subscription.countyTax > 0 ? (
                <Stack
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                  bgColor="red"
                >
                  <MDTypography variant="body2" fontWeight="bold">
                    County Tax
                  </MDTypography>
                  {subscription.isMonthly &&
                  subscription.renewalCount === 0 &&
                  subscription?.countyTax !==
                    subscription?.firstMonthCountyTax ? (
                    <Stack direction="row" spacing={1}>
                      <MDTypography
                        variant="body2"
                        fontWeight="regular"
                        color="gray"
                        sx={{ textDecoration: "line-through" }}
                      >
                        {`$${amountToShow(subscription.countyTax)}`}
                      </MDTypography>
                      <MDTypography
                        variant="body2"
                        fontWeight="bold"
                        color="gray"
                      >
                        {`$${amountToShow(subscription.firstMonthCountyTax)}`}
                      </MDTypography>
                    </Stack>
                  ) : (
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      color="gray"
                    >
                      {`$${amountToShow(subscription.countyTax)}`}
                    </MDTypography>
                  )}
                </Stack>
              ) : (
                ""
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
                {subscription.isMonthly &&
                subscription.renewalCount === 0 &&
                subscription?.totalAmount !==
                  subscription?.firstMonthTotalAmount ? (
                  <Stack direction="row" spacing={1}>
                    <MDTypography
                      variant="body2"
                      fontWeight="regular"
                      color="gray"
                      sx={{ textDecoration: "line-through" }}
                    >
                      {`$${amountToShow(subscription.totalAmount)}`}
                    </MDTypography>
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      color="gray"
                    >
                      {`$${amountToShow(subscription.firstMonthTotalAmount)}`}
                    </MDTypography>
                  </Stack>
                ) : (
                  <MDTypography variant="body2" fontWeight="bold" color="gray">
                    {`$${amountToShow(subscription.totalAmount)}`}
                  </MDTypography>
                )}
              </Stack>
              <Stack
                direction="row"
                alignItems={"center"}
                justifyContent="space-between"
                bgColor="red"
              >
                <MDTypography variant="body2" fontWeight="bold">
                  Start Date
                </MDTypography>
                <MDTypography variant="body2" fontWeight="bold" color="gray">
                  {dates.startDate}
                </MDTypography>
              </Stack>
              <Stack
                direction="row"
                alignItems={"center"}
                justifyContent="space-between"
                bgColor="red"
              >
                <MDTypography variant="body2" fontWeight="bold">
                  End Date
                </MDTypography>
                <MDTypography variant="body2" fontWeight="bold" color="gray">
                  {dates.endDate}
                </MDTypography>
              </Stack>
              <Stack
                direction="row"
                alignItems={"center"}
                justifyContent="space-between"
                bgColor="red"
              >
                <MDTypography variant="body2" fontWeight="bold">
                  {subscription.isAutoRenew
                    ? "Next Renewal Date"
                    : "Expiration Date"}
                </MDTypography>
                <MDTypography variant="body2" fontWeight="bold" color="gray">
                  {dates.nextRenewalDate}
                </MDTypography>
              </Stack>
            </Stack>
            <MDBox>
              <Grid mt={2} container spacing={2}>
                {subscription.isReminderEmailSend && (
                  <Grid item xs={12}>
                    <Button
                      style={{
                        backgroundColor: darkMode ? "#1a2035" : "#ffffff",
                      }}
                      fullWidth
                      color="white"
                      variant="contained"
                      size="small"
                      onClick={() =>
                        handelDownload({
                          receiptURL: subscription.invoiceURL,
                        })
                      }
                    >
                      Download Invoice
                    </Button>
                  </Grid>
                )}
                {subscription.subscriptionStatus === "failed" && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      fullWidth
                      fontSize="small"
                      color="white"
                      onClick={() => {
                        setChargeDialogOpen(true);
                      }}
                    >
                      Charge Subscription
                    </Button>
                  </Grid>
                )}
                {subscription.subscriptionStatus === "cancel" && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      fullWidth
                      fontSize="small"
                      color="white"
                      onClick={() => {
                        setIsReActivate(true);
                        if(moment(subscription.endDate).isBefore(moment())){
                          setReActiveDialogOpen(true);
                        } else {
                          setDialogOpen(true)
                        }
                        
                      }}
                    >
                      Reactivate Subscription
                    </Button>
                  </Grid>
                )}
                {subscription.subscriptionStatus !== "cancel" && (
                  <Grid item xs={12}>
                    <Button
                      style={{
                        backgroundColor: darkMode ? "#1a2035" : "#ffffff",
                      }}
                      fullWidth
                      color="white"
                      variant="contained"
                      size="small"
                      onClick={() => setDialogOpen(true)}
                    >
                      Cancel Subscription
                    </Button>
                  </Grid>
                )}

                {!paymentMethodEdit && (
                  <Grid
                    item
                    xs={12}
                    display="flex"
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Button
                      style={{
                        backgroundColor: darkMode ? "#1a2035" : "#ffffff",
                      }}
                      fullWidth
                      color="white"
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setPaymentMethodEdit(!paymentMethodEdit);
                      }}
                    >
                      {`${
                        subscription.subscriptionStatus === "cancel" ||
                        subscription.paymentMethodType === "ACH"
                          ? "Show"
                          : "Update"
                      } Payment Method`}
                    </Button>
                  </Grid>
                )}

                {paymentMethodEdit && !updateCard && (
                  <Grid item xs={12}>
                    <PaymentMethod
                      setPaymentMethodEdit={setPaymentMethodEdit}
                      paymentMethodData={PaymentMethodData}
                      setUpdateCard={setUpdateCard}
                      isACHPayment={
                        subscription.paymentMethodType === "ACH" ? true : false
                      }
                      isCanceled={
                        subscription.subscriptionStatus === "cancel"
                          ? true
                          : false
                      }
                    />
                  </Grid>
                )}
                {updateCard && (
                  <Grid item xs={12}>
                    {subscription.paymentId.authorizenetCustomerId ? (
                      <UpdatePaymentMethodAuthorizenet
                        setPaymentMethodEdit={setPaymentMethodEdit}
                        setUpdateCard={setUpdateCard}
                        subscriptionId={subscription._id}
                        setSuccessMessage={setSuccessMessage}
                      />
                    ) : (
                      <UpdatePaymentMethod
                        setPaymentMethodEdit={setPaymentMethodEdit}
                        setUpdateCard={setUpdateCard}
                        subscriptionId={subscription._id}
                        setSuccessMessage={setSuccessMessage}
                      />
                    )}
                  </Grid>
                )}
                {successMessage && (
                  <Grid item xs={12}>
                    <Alert
                      severity="success"
                      className="mb-2"
                      onClose={() => {
                        setSuccessMessage(false);
                      }}
                    >
                      Payment Method Updated Successfully
                    </Alert>
                  </Grid>
                )}
                {cancelMessage && (
                  <Grid item xs={12}>
                    <Alert
                      severity="success"
                      className="mb-2"
                      onClose={() => {
                        setCancelMessage(false);
                      }}
                    >
                      Subscription has been canceled!
                    </Alert>
                  </Grid>
                )}
              </Grid>
              <AddLicensePlateDialog
                dialogOpen={licensePlateDialog}
                onClose={() => {
                  setLicensePlateDialog(false);
                }}
                subscriptionId={subscription._id}
              />
              <PendingMessageDialog
                licensePlateState={licensePlateState}
                dialogOpen={pendingMessageDialog}
                onClose={() => {
                  setPendingMessageDialog(false);
                }}
              />
              <ConfirmationDialog
                dialogTitle={isReActivate ? "ReActivate Confirmation!" : "Cancel Confirmation!"}
                confirmationText={isReActivate ? "Are you sure you want to ReActivate this subscription?" : "Are you sure you want to cancel this subscription?"}
                buttonLabel="submit"
                dialogOpen={dialogOpen}
                onClose={() => {
                  setDialogOpen(false);
                }}
                action={handelCancelSubscription}
              />
              <ConfirmationDialog
                dialogTitle="Delete License Plate!"
                confirmationText="Are you sure you want to delete this license plate?"
                buttonLabel="submit"
                dialogOpen={deleteDialogOpen}
                onClose={() => {
                  setDeleteDialogOpen(false);
                }}
                action={handelDeleteLicensePlate}
              />
              <ConfirmationDialog
                dialogTitle="Charge Confirmation!"
                confirmationText="Are you sure you want to charge this subscription?"
                buttonLabel="submit"
                dialogOpen={chargeDialogOpen}
                onClose={() => {
                  setChargeDialogOpen(false);
                }}
                action={handelRenew}
              />
              <ConfirmationDialog
                dialogTitle="ReStart Confirmation!"
                confirmationText="Your subscription will be restarted and you will be charged for the period until your next renewal date?"
                buttonLabel="submit"
                dialogOpen={reActiveDialogOpen}
                onClose={() => {
                  setReActiveDialogOpen(false);
                }}
                action={handelRenew}
              />
              <CircularIndeterminate
                type="full"
                size={20}
                text="Please wait..."
                open={loading}
              />
            </MDBox>
          </AccordionDetails>
        </Accordion>
      </Elements>
    </>
  );
};

export default SubscriptionAccordion;
