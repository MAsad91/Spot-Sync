import { Autocomplete, Chip, FormControl } from "@mui/material";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import { useMaterialUIController } from "context";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DateRangePicker from "rsuite/DateRangePicker";
import moment from "moment-timezone";
import Statistics from "./SubscriptionStatistics";
import CircularIndeterminate from "components/MDLoading";
import { isEmpty } from "lodash";
import { amountToShow } from "global/functions";
import * as XLSX from "xlsx";
import DownloadIcon from "@mui/icons-material/Download";
import { getSubscriptionReport } from "store/slice/reports/reportSlice";
import NoDataOverlay from "components/Common/NoDataOverlay";

function SubscriptionReports() {
  const [controller] = useMaterialUIController();
  const dispatch = useDispatch();
  const { sidenavColor } = controller;
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  const placeId = selectedPlace?._id;
  const tz = selectedPlace?.timeZoneId || "America/Los_Angeles";

  const [statistics, setStatistics] = useState({});
  const [subscription, setSubscription] = useState([]);
  const loading = useSelector((state) => state.report?.loading);

  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });
  const currentDate = moment().toDate();

  const [filterOptions, setFilterOptions] = useState({
    tz,
    status: "All",
    placeId,
    startDate: moment(currentDate),
    endDate: moment(currentDate),
    // purpose: "PARKING",
  });

  useEffect(() => {
    setFilterOptions((prev) => ({
      ...prev,
      placeId: selectedPlace?._id || null,
      tz: selectedPlace?.timeZoneId || "America/Los_Angeles",
    }));
  }, [selectedPlace]);

  const handleDateRangeChange = (value) => {
    if (value && value.length === 2) {
      const [startDate, endDate] = value;
      setFilterOptions((prev) => ({
        ...prev,
        startDate: moment(startDate),
        endDate: moment(endDate),
      }));
    } else {
      setFilterOptions((prev) => ({
        ...prev,
        startDate: null,
        endDate: null,
      }));
    }
  };

  const handelGetReport = async () => {
    try {
      const payload = {
        ...filterOptions,
        status: filterOptions.status.toLowerCase(),
      };
      const res = await dispatch(getSubscriptionReport(payload)).unwrap();
      console.log("res ===>", res);
      if (res.success) {
        setStatistics(res.subscriptionStatistics);
        setSubscription(res.subscriptions);
      }
    } catch (error) {
      console.log("error --->", error.message);
    }
  };

  const downloadReport = (data) => {
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

    const filteredData = data.map((item) => {
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

  return (
    <>
      <MDBox pt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <PlacePicker />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <DateRangePicker
                id="duration"
                placeholder="Start Date - End Date"
                character=" - "
                showOneCalendar={false}
                size="lg"
                format="MM/dd/yyyy"
                ranges={[]}
                clearButton={true}
                onClean={() => {
                  setFilterOptions((prev) => ({
                    ...prev,
                    startDate: null,
                    endDate: null,
                  }));
                  setStatistics({});
                }}
                value={
                  filterOptions.startDate && filterOptions.endDate
                    ? [
                        moment(filterOptions.startDate).toDate(),
                        moment(filterOptions.endDate).toDate(),
                      ]
                    : undefined
                }
                onChange={handleDateRangeChange}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <Autocomplete
                disableClearable
                name="type"
                value={filterOptions.status}
                options={[
                  "All",
                  "Active",
                  "Failed",
                  "Refunded",
                  "Payment Pending",
                ]}
                onChange={(event, newValue) => {
                  setFilterOptions((prev) => ({
                    ...prev,
                    status: newValue,
                  }));
                }}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="contained"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <MDInput
                    label="Subscription Type"
                    fullWidth={true}
                    {...params}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}></Grid>
          <Grid item xs={12} md={2}>
            <MDButton
              color={sidenavColor}
              disabled={
                filterOptions.startDate && filterOptions.endDate ? false : true
              }
              onClick={handelGetReport}
            >
              Get Report
            </MDButton>
          </Grid>
        </Grid>
      </MDBox>
      {!isEmpty(statistics) ? (
        <>
          <MDBox pt={2}>
            <Statistics data={statistics} />
          </MDBox>
          <MDBox
            pt={4}
            display="flex"
            justifyContent="center"
            alignItem="center"
          >
            <MDButton
              color={sidenavColor}
              disabled={isEmpty(subscription)}
              onClick={() => downloadReport(subscription)}
              size="large"
              endIcon={<DownloadIcon />}
            >
              Download Report
            </MDButton>
          </MDBox>
        </>
      ) : (
        <MDBox pt={4}>
          <NoDataOverlay />
        </MDBox>
      )}

      <CircularIndeterminate
        type="full"
        size={20}
        text="Please wait..."
        open={loading}
      />
    </>
  );
}

export default SubscriptionReports;
