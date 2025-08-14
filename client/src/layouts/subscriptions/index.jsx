import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import breakpoints from "assets/theme/base/breakpoints";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { useEffect, useState } from "react";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import BulkUploadSubscriptions from "./components/BulkUploadSubscriptions";
import CreateSubscription from "./components/CreateSubscriptions";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CancelIcon from "@mui/icons-material/Cancel";
import ExploreOffIcon from "@mui/icons-material/ExploreOff";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import PendingIcon from "@mui/icons-material/Pending";
import * as XLSX from "xlsx";
import {
  getSubscriptionServiceFee,
  getSubscriptionStatistics,
  getSubscriptionsByPlaceId,
} from "../../store/slice/subscriptions/subscriptionSlice";
import Statistics from "./components/Statistics";
import SubscriptionsTable from "./components/SubscriptionTable";
import { isEmpty, sortBy } from "lodash";
import moment from "moment";
import SubscriptionEmailSendDialog from "./components/SubscriptionReminderEmailDIalog";
import { FormControl } from "@mui/material";
import SubscriptionSearchBar from "./components/SubscriptionSearchBar";
import { amountToShow } from "global/functions";
import DownloadIcon from "@mui/icons-material/Download";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PublishedWithChangesRoundedIcon from "@mui/icons-material/PublishedWithChangesRounded";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <MDBox sx={{ p: 3 }}>{children}</MDBox>}
    </div>
  );
}

function Subscriptions() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const userData = useSelector((state) => state.users?.meInfo);
  const roleModules = userData?.roleModules || {};
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab");
  const [tabValue, setTabValue] = useState(activeTab ? activeTab : "active");
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  const isLoading = useSelector((state) => state.subscriptions.loading);
  const subscriptionsList = useSelector((state) => state.subscriptions.list);
  const statistics = useSelector((state) => state.subscriptions.statistics);
  const serviceFee = useSelector(
    (state) => state.subscriptions?.subscriptionServiceFee
  );
  const currentDate = moment();
  let placeId = selectedPlace?._id;
  if (!placeId) {
    placeId = localStorage.getItem("placeId");
  }

  useEffect(() => {
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    window.addEventListener("resize", handleTabsOrientation);
    handleTabsOrientation();
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
    queryParams.set("tab", newValue);
    const updatedQueryString = queryParams.toString();
    navigate(`?${updatedQueryString}`);
  };

  useEffect(() => {
    dispatch(getSubscriptionsByPlaceId(placeId));
    dispatch(getSubscriptionServiceFee(placeId));
    dispatch(getSubscriptionStatistics(placeId));
  }, [dispatch, placeId, activeTab]);

  const downloadReport = (data) => {
    const currentDate = moment();
    const filteredSubscriptions = data.filter((item) => {
      const startDate = moment(item.startDate);
      const endDate = moment(item.endDate);
      const isExpired = currentDate.isAfter(endDate);
      const isPaused = item.isSubscriptionPaused;

      switch (tabValue) {
        case "active":
          return (
            (item.subscriptionStatus === "active" ||
              item.subscriptionStatus === "cancel") &&
            !isPaused &&
            currentDate.isBetween(startDate, endDate, null, "[]")
          );
        case "paused":
          return isPaused;
        case "pendingPayment":
          return item.subscriptionStatus === "initialize";
        case "canceled":
          return item.subscriptionStatus === "cancel";
        case "upcoming":
          return upcomingRenewalData;
        case "expired":
          return (
            !isPaused &&
            isExpired &&
            item.subscriptionStatus !== "active" &&
            item.subscriptionStatus !== "pending" &&
            item.subscriptionStatus !== "initialize"
          );
        case "pending":
          return item.subscriptionStatus === "pending";
        case "failed":
          return item.subscriptionStatus === "failed";
        default:
          return false;
      }
    });
    /* const filteredSubscriptions = data.filter(
      (item) => item.subscriptionStatus === tabValue
    );*/

    // Define keys and column names
    const columnMapping = {
      "Subscription ID": "subscriptionNumber",
      "Start Date": "startDate",
      "End Date": "endDate",
      "License Plate": "licensePlate",
      Email: "customerId.email",
      Mobile: "customerId.mobile",
      Name: "customerId.fullName",
      "Subscription Type": "isMonthly",
      "Auto Renew": "isAutoRenew",
      "Payment Method": "paymentMethodType",
      "Total Amount": "totalAmount",
      "Base Rate": "baseRate",
      Tax: "tax",
      "Service Fee": "serviceFee",
      "Merchant Fee": "paymentGatewayFee",
      "ISBParking Revenue": "isbpRevenue",
      "Owner Payout": "ownerPayout",
      "Pro-Rate TotalAmount": "firstMonthTotalAmount",
      "Pro-Rate BaseRate": "firstMonthBaseRate",
      "Pro-Rate Tax": "firstMonthTax",
      "Pro-Rate ServiceFee": "firstMonthServiceFee",
      "Pro-Rate MerchentFee": "firstMonthPaymentGatewayFee",
      "Pro-Rate ISBParking Revenue": "firstMonthIsbpRevenue",
      "Pro-Rate Owner Payout": "firstMonthTotalAmount",
    };

    // Create an array of objects with selected keys and formatted values
    const filteredData = filteredSubscriptions.map((item) => {
      const filteredItem = {};
      Object.keys(columnMapping).forEach((columnName) => {
        const key = columnMapping[columnName];
        let value = item[key];
        if (key === "customerId.fullName") {
          const firstName =
            item.customerId && item.customerId.firstName
              ? item.customerId.firstName
              : "";
          const lastName =
            item.customerId && item.customerId.lastName
              ? item.customerId.lastName
              : "";
          value = `${firstName} ${lastName}`.trim();
        } else if (key === "startDate" || key === "endDate") {
          value = value ? new Date(value).toLocaleDateString("en-US") : "";
        } else if (key === "licensePlate") {
          value = value
            ? value.map((plate) => plate.licensePlateNumber).join(", ")
            : "";
        } else if (key === "customerId.email") {
          // Check if customerId object and email property exist
          value =
            item["customerId"] && item["customerId"]["email"]
              ? item["customerId"]["email"]
              : "";
        } else if (key === "customerId.mobile") {
          value =
            item["customerId"] && item["customerId"]["mobile"]
              ? item["customerId"]["mobile"]
              : item["customerId"] && item["customerId"]["secondaryMobile"]
              ? item["customerId"]["secondaryMobile"]
              : "";
        } else if (
          [
            "baseRate",
            "tax",
            "serviceFee",
            "paymentGatewayFee",
            "isbpRevenue",
            "ownerPayout",
            "totalAmount",
            "firstMonthBaseRate",
            "firstMonthServiceFee",
            "firstMonthTax",
            "firstMonthTotalAmount",
            "firstMonthOwnerPayout",
            "firstMonthIsbpRevenue",
            "firstMonthApplicationFee",
            "firstMonthPaymentGatewayFee",
          ].includes(key)
        ) {
          value = value ? `$${amountToShow(value)}` : `$0`;
        } else if (key === "paymentMethodType") {
          value =
            value === "card" ? "Credit Card" : value === "ACH" ? "ACH" : value;
        } else if (key === "isMonthly") {
          value = value === true ? "Monthly" : "Custom";
        } else if (key === "isAutoRenew") {
          value = value === true ? "Yes" : "No";
        }
        filteredItem[columnName] = value;
      });
      return filteredItem;
    });

    const ws = XLSX.utils.json_to_sheet(filteredData);

    const columnWidths = Object.keys(columnMapping).map((columnName) => {
      switch (columnName) {
        case "Subscription ID":
          return { wch: 15 };
        case "Start Date":
        case "End Date":
          return { wch: 15 };
        case "Base Rate":
        case "Tax":
        case "Service Fee":
        case "Total Amount":
          return { wch: 10 };
        case "License Plate":
          return { wch: 30 };
        default:
          return { wch: 25 };
      }
    });
    ws["!cols"] = columnWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${selectedPlace.parkingCode}.xlsx`);
  };

  const upcomingRenewalData = !isEmpty(filteredSubscriptions)
    ? filteredSubscriptions.filter(
        (item) =>
          item.subscriptionStatus === "active" &&
          item.isAutoRenew &&
          !item.isSubscriptionPaused &&
          moment(item.endDate).isBetween(
            moment(),
            moment().add(3, "days"),
            "day",
            "[]"
          )
      )
    : [];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox>
        <MDBox pt={2} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <MDBox
                  mx={1}
                  mt={-2}
                  py={1}
                  px={1}
                  variant="gradient"
                  bgColor={sidenavColor}
                  borderRadius="lg"
                  coloredShadow={sidenavColor}
                  className="d-flex align-items-center gap-2"
                >
                  <MDTypography
                    variant="h6"
                    color="white"
                    className="flex-grow-1"
                  >
                    Subscriptions
                  </MDTypography>

                  {roleModules.Subscription_add && placeId && (
                    <>
                      <MDButton
                        variant="outlined"
                        size="small"
                        onClick={() => navigate("/subscriptions/statistics")}
                      >
                        Statistics
                      </MDButton>

                      {/* <MDButton
                        variant="outlined"
                        size="small"
                        onClick={() => setBulkDialogOpen(true)}
                      >
                        Bulk Upload
                      </MDButton> */}
                      <MDButton
                        variant="outlined"
                        size="small"
                        onClick={() => setDialogOpen(true)}
                      >
                        Create
                      </MDButton>
                    </>
                  )}
                </MDBox>
                <MDBox p={2}>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                      <PlacePicker />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      {/* <FormControl fullWidth>
                        <SubscriptionFilterByDate
                          subscriptionsList={subscriptionsList}
                          setFilteredSubscriptions={setFilteredSubscriptions}
                        />
                      </FormControl> */}
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <SubscriptionSearchBar
                          subscriptionsList={subscriptionsList}
                          setFilteredSubscriptions={setFilteredSubscriptions}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color={sidenavColor}
                        variant="outlined"
                        size="small"
                        onClick={() => downloadReport(filteredSubscriptions)}
                      >
                        Export <DownloadIcon />
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDBox>
                <MDBox p={2}>
                  <Statistics data={statistics} type="active" />
                </MDBox>
                <MDBox p={2}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={12} lg={12} sx={{ ml: "auto" }}>
                      <AppBar position="static">
                        <Tabs
                          orientation={tabsOrientation}
                          value={tabValue}
                          onChange={handleSetTabValue}
                        >
                          <Tab
                            label="Active"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <DirectionsCarIcon />
                              </Icon>
                            }
                            value="active"
                          />
                          <Tab
                            label="Paused"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <PauseCircleIcon />
                              </Icon>
                            }
                            value="paused"
                          />
                          <Tab
                            label="Pending Payment"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <PendingIcon />
                              </Icon>
                            }
                            value="pendingPayment"
                          />

                          <Tab
                            label="Canceled"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <CancelIcon />
                              </Icon>
                            }
                            value="canceled"
                          />

                          <Tab
                            label="Failed Payment"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <MoneyOffIcon />
                              </Icon>
                            }
                            value="failed"
                          />
                          <Tab
                            label="Expired"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <ExploreOffIcon />
                              </Icon>
                            }
                            value="expired"
                          />

                          <Tab
                            label="Invitee's"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <PendingIcon />
                              </Icon>
                            }
                            value="pending"
                          />
                          <Tab
                            label={
                              <MDBox>
                                <MDTypography sx={{ fontSize: "16px" }}>
                                  Upcoming renewal
                                </MDTypography>
                                {upcomingRenewalData.filter(
                                  (obj) => !obj.isReminderEmailSend
                                ).length > 0 &&
                                  tabValue !== "upcoming" && (
                                    <FiberManualRecordIcon
                                      fontSize="medium"
                                      sx={{
                                        top: -4,
                                        right: 0,
                                        color: "green",
                                        position: "absolute",
                                      }}
                                    />
                                  )}
                              </MDBox>
                            }
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <PublishedWithChangesRoundedIcon />
                              </Icon>
                            }
                            value="upcoming"
                          />
                        </Tabs>
                      </AppBar>
                      <TabPanel value={tabValue} index="active">
                        <SubscriptionsTable
                          isLoading={isLoading}
                          subscriptionList={
                            !isEmpty(filteredSubscriptions)
                              ? sortBy(
                                  filteredSubscriptions.filter((item) => {
                                    const startDate = moment(item.startDate);
                                    const endDate = moment(item.endDate).add(
                                      12,
                                      "hours"
                                    );

                                    return (
                                      (item.subscriptionStatus === "active" ||
                                        item.subscriptionStatus === "cancel") &&
                                      !item.isSubscriptionPaused &&
                                      (currentDate.isBetween(
                                        startDate,
                                        endDate,
                                        null,
                                        "[]"
                                      ) ||
                                        (startDate.isAfter(currentDate) &&
                                          endDate.isAfter(currentDate)))
                                    );
                                  }),
                                  (item) => !item.licensePlateGetUpdated
                                )
                              : []
                          }
                          subscriptionType="active"
                          placeData={selectedPlace}
                          roleModules={roleModules}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="paused">
                        <SubscriptionsTable
                          isLoading={isLoading}
                          subscriptionList={
                            !isEmpty(filteredSubscriptions)
                              ? filteredSubscriptions.filter(
                                  (item) => item.isSubscriptionPaused
                                )
                              : []
                          }
                          subscriptionType="paused"
                          placeData={selectedPlace}
                          roleModules={roleModules}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="pendingPayment">
                        <SubscriptionsTable
                          isLoading={isLoading}
                          subscriptionList={
                            !isEmpty(filteredSubscriptions)
                              ? filteredSubscriptions.filter(
                                  (item) =>
                                    item.subscriptionStatus === "initialize"
                                )
                              : []
                          }
                          subscriptionType="paymentPending"
                          placeData={selectedPlace}
                          roleModules={roleModules}
                        />
                      </TabPanel>

                      <TabPanel value={tabValue} index="canceled">
                        <SubscriptionsTable
                          isLoading={isLoading}
                          subscriptionList={
                            !isEmpty(filteredSubscriptions)
                              ? filteredSubscriptions.filter(
                                  (item) => item.subscriptionStatus === "cancel"
                                )
                              : []
                          }
                          subscriptionType="canceled"
                          placeData={selectedPlace}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="upcoming">
                        <MDBox display="flex" justifyContent="end">
                          <MDButton
                            size="small"
                            variant="contained"
                            color={sidenavColor}
                            onClick={() => setEmailDialogOpen(true)}
                          >
                            Send Reminder Email
                          </MDButton>
                        </MDBox>
                        <SubscriptionsTable
                          isLoading={isLoading}
                          subscriptionList={upcomingRenewalData}
                          subscriptionType="upcoming"
                          placeData={selectedPlace}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="expired">
                        <SubscriptionsTable
                          isLoading={isLoading}
                          subscriptionList={
                            !isEmpty(filteredSubscriptions)
                              ? filteredSubscriptions.filter(
                                  (item) =>
                                    item.subscriptionStatus !== "active" &&
                                    item.subscriptionStatus !== "pending" &&
                                    item.subscriptionStatus !== "initialize"
                                )
                              : []
                          }
                          subscriptionType="expired"
                          placeData={selectedPlace}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="pending">
                        <SubscriptionsTable
                          subscriptionList={
                            !isEmpty(filteredSubscriptions)
                              ? filteredSubscriptions.filter(
                                  (item) =>
                                    item.subscriptionStatus === "pending"
                                )
                              : []
                          }
                          subscriptionType="pending"
                          placeData={selectedPlace}
                          roleModules={roleModules}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="failed">
                        <SubscriptionsTable
                          subscriptionList={
                            !isEmpty(filteredSubscriptions)
                              ? filteredSubscriptions.filter(
                                  (item) => item.subscriptionStatus === "failed"
                                )
                              : []
                          }
                          subscriptionType="failed"
                          placeData={selectedPlace}
                          roleModules={roleModules}
                        />
                      </TabPanel>
                    </Grid>
                  </Grid>
                </MDBox>

                <MDBox pt={3}>
                  <CreateSubscription
                    placeId={placeId}
                    placeData={selectedPlace}
                    dialogOpen={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    serviceFee={serviceFee}
                    setTabValue={setTabValue}
                  />
                  <BulkUploadSubscriptions
                    placeId={placeId}
                    placeData={selectedPlace}
                    dialogOpen={bulkDialogOpen}
                    onClose={() => setBulkDialogOpen(false)}
                  />
                </MDBox>

                <SubscriptionEmailSendDialog
                  placeId={placeId}
                  subscriptionList={upcomingRenewalData}
                  dialogOpen={emailDialogOpen}
                  onClose={() => {
                    setEmailDialogOpen(false);
                  }}
                />
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Subscriptions;
