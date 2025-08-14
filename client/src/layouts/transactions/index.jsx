import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import breakpoints from "assets/theme/base/breakpoints";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import CancelIcon from "@mui/icons-material/Cancel";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import DensitySmallIcon from "@mui/icons-material/DensitySmall";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import PendingIcon from "@mui/icons-material/Pending";
import * as XLSX from "xlsx";
import { FormControl } from "@mui/material";
import { amountToShow } from "global/functions";
import DownloadIcon from "@mui/icons-material/Download";
import TransactionSearchBar from "./components/TransactionSearchBar";
import TransactionFilterByDate from "./components/TransactionFilterByDate";
import TransactionsTable from "./components/TransactionTable";
import { debounce, get, isEmpty } from "lodash";
import { getTransactionsByPlaceId } from "store/slice/transactions/transactionSlice";
import moment from "moment";

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

function Transactions() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab");
  const [tabValue, setTabValue] = useState(activeTab ? activeTab : "all");
  const [page, setPage] = useState(0);
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  const transactionsList = useSelector((state) => state.transactions.list);
  const totalTransactions = useSelector(
    (state) => state.transactions.totalTransactions
  );
  const isLoading = useSelector((state) => state.transactions.loading);
  let placeId = selectedPlace?._id;
  const tz = selectedPlace?.timeZoneId || "America/Los_Angeles";
  if (!placeId) {
    placeId = localStorage.getItem("placeId");
  }

  const [filterOptions, setFilterOptions] = useState({
    tz: selectedPlace?.timeZoneId || "America/Los_Angeles",
    pageNo: page,
    status: "all",
    placeId,
    startDate: "",
    endDate: "",
    search: "",
  });

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

  // const getTransactionsData = useCallback(
  //   async (data) => {
  //     const payload = {
  //       tz: get(data, "tz", ""),
  //       pageNo: data.pageNo,
  //       status: data.status,
  //       placeId: data.placeId,
  //       search: get(data, "search", ""),
  //       startDate: get(data, "startDate", ""),
  //       endDate: get(data, "endDate", ""),
  //     };
  //     console.log("payload =====>", payload);
  //     dispatch(getTransactionsByPlaceId(payload));
  //   },
  //   [dispatch]
  // );

  // const debounceFn = useMemo(
  //   () => debounce(getTransactionsData, 1000),
  //   [getTransactionsData]
  // );

  // useEffect(() => {
  //   const payload = {
  //     pageNo: page,
  //     placeId,
  //     search: "",
  //     status: tabValue,
  //   };
  //   debounceFn(payload);
  // }, [debounceFn, dispatch, placeId, tabValue, page]);

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
    queryParams.set("tab", newValue);
    const updatedQueryString = queryParams.toString();
    navigate(`?${updatedQueryString}`);
  };

  const downloadReport = (data) => {
    let filteredTransactions;
    if (tabValue === "all") {
      filteredTransactions = data;
    } else {
      filteredTransactions = data.filter((item) => item.status === tabValue);
    }
    console.log(filteredTransactions, "filtered");

    // Define keys and column names
    const columnMapping = {
      "Transaction ID": "transactionId",
      "Customer Stripe ID": "stripeCustomerId",
      "Payment Method ID": "paymentMethodId",
      "Transaction Date": "createdAt",
      Purpose: "purpose",
      "Subscription ID": "subscriptionNumber",
      "License Plate": "licensePlate",
      Email: "customerId.email",
      Mobile: "customerId.mobile",
      Name: "customerId.fullName",
      "Subscription Type": "isMonthly",
      "Payment Method": "paymentMethodType",
      "Payment Gateway Fee Pay By": "paymentGatewayFeePayBy",
      "Base Rate": "baseRate",
      Tax: "tax",
      "Service Fee": "serviceFee",
      "Payment Gateway Fee": "paymentGatewayFee",
      "ISBParking Revenue": "isbpRevenue",
      "Owner Payout": "ownerPayout",
      "Total Amount": "totalAmount",
    };

    // Create an array of objects with selected keys and formatted values
    const filteredData = filteredTransactions.map((item) => {
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
        } else if (key === "createdAt") {
          value = value ? moment(value).format("MM/DD/YYY hh:mm A") : "";
        } else if (key === "licensePlate") {
          value = value
            ? value
                .filter((obj) => obj.status === 10)
                .map((plate) => plate?.licensePlateNumber)
                .join(", ")
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
    XLSX.writeFile(
      wb,
      `${selectedPlace.parkingCode}-${moment().format(
        "MM/DD/YYYY hh:mm A"
      )}.xlsx`
    );
  };

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
                    Transactions
                  </MDTypography>
                </MDBox>
                <MDBox p={2}>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <PlacePicker />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <TransactionFilterByDate
                          filterOptions={filterOptions}
                          setFilterOptions={setFilterOptions}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <TransactionSearchBar
                          filterOptions={filterOptions}
                          setFilterOptions={setFilterOptions}
                        />
                      </FormControl>
                    </Grid>
                    {/* <Grid item xs={12} md={2}>
                      <MDButton
                        color={sidenavColor}
                        variant="outlined"
                        size="small"
                        onClick={() => downloadReport(transactionsList)}
                      >
                        Export <DownloadIcon />
                      </MDButton>
                    </Grid> */}
                  </Grid>
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
                            label="All"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <DensitySmallIcon />
                              </Icon>
                            }
                            value="all"
                          />
                          <Tab
                            label="Success"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <PriceCheckIcon />
                              </Icon>
                            }
                            value="success"
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
                            label="Refunded"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <CurrencyExchangeIcon />
                              </Icon>
                            }
                            value="refunded"
                          />
                          <Tab
                            label="Failed"
                            icon={
                              <Icon fontSize="small" sx={{ mt: -0.25 }}>
                                <CancelIcon />
                              </Icon>
                            }
                            value="failed"
                          />
                        </Tabs>
                      </AppBar>
                      <TabPanel value={tabValue} index="all">
                        <TransactionsTable
                          placeId={placeId}
                          startDate={filterOptions.startDate}
                          endDate={filterOptions.endDate}
                          searchText={filterOptions.search}
                          activeTab={tabValue}
                          tz={tz}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="success">
                        <TransactionsTable
                           placeId={placeId}
                           startDate={filterOptions.startDate}
                           endDate={filterOptions.endDate}
                           searchText={filterOptions.search}
                           activeTab={tabValue}
                           tz={tz}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="pendingPayment">
                        <TransactionsTable
                          placeId={placeId}
                          startDate={filterOptions.startDate}
                          endDate={filterOptions.endDate}
                          searchText={filterOptions.search}
                          activeTab={tabValue}
                          tz={tz}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="refunded">
                        <TransactionsTable
                          placeId={placeId}
                          startDate={filterOptions.startDate}
                          endDate={filterOptions.endDate}
                          searchText={filterOptions.search}
                          activeTab={tabValue}
                          tz={tz}
                        />
                      </TabPanel>
                      <TabPanel value={tabValue} index="failed">
                        <TransactionsTable
                          placeId={placeId}
                          startDate={filterOptions.startDate}
                          endDate={filterOptions.endDate}
                          searchText={filterOptions.search}
                          activeTab={tabValue}
                          tz={tz}
                        />
                      </TabPanel>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Transactions;
