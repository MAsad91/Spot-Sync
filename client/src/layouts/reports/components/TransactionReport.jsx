import { Autocomplete, Chip, FormControl } from "@mui/material";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import { useMaterialUIController } from "context";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DateRangePicker from "rsuite/DateRangePicker";
import moment from "moment-timezone";
import Statistics from "./TransactionStatistics";
import { getTransactionReport } from "store/slice/reports/reportSlice";
import CircularIndeterminate from "components/MDLoading";
import { get, isEmpty, uniqBy } from "lodash";
import * as XLSX from "xlsx";
import DownloadIcon from "@mui/icons-material/Download";
import { centsToDollars } from "global/functions";
import MDBadge from "components/MDBadge";
import MDSnackbar from "components/MDSnackbar";
import { getPlaces } from "store/slice/places/placeSlice";
import NoDataOverlay from "components/Common/NoDataOverlay";

function TransactionReports() {
  const [controller] = useMaterialUIController();
  const dispatch = useDispatch();
  const { sidenavColor } = controller;
  const allPlaces = useSelector((state) => state.places?.placesList);

  const [statistics, setStatistics] = useState({});
  const [transactions, setTransactions] = useState([]);
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
  const lastWeekDate = moment().subtract(7, "days").toDate();
  const timeZones = uniqBy(allPlaces, "timeZoneId").map(
    (place) => place.timeZoneId
  );
  timeZones.push("UTC");
  const [filterOptions, setFilterOptions] = useState({
    tz: "UTC",
    status: "All",
    placeId: [allPlaces.length > 0 && allPlaces[0]?._id],
    startDate: moment(lastWeekDate),
    endDate: moment(currentDate),
    purpose: "All",
  });
  const asyncFn = async () => {
    await dispatch(getPlaces())
      .unwrap()
      .then(async (res) => {
        setFilterOptions((prev) => ({
          ...prev,
          placeId: [res.places[0]?._id],
        }));
        handleGetReport();
      });
  };
  useEffect(() => {
    asyncFn();
  }, []);

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

  const handleGetReport = async () => {
    try {
      const payload = {
        ...filterOptions,
        status: filterOptions.status.toLowerCase(),
        purpose: filterOptions.purpose.toUpperCase(),
      };
      if (filterOptions.placeId.length === 0) {
        setNotification({
          ...notification,
          color: "error",
          title: "Error",
          content: "Please select atleast 1 lot",
          icon: "warning",
          show: true,
        });
        return;
      }
      const res = await dispatch(getTransactionReport(payload)).unwrap();
      if (res.success) {
        setStatistics(res.transactionStatistics);
        setTransactions(res.transactions);
      }
    } catch (error) {
      console.log("error --->", error.message);
    }
  };

  const downloadReport = (data) => {
    const columnMapping = {
      "Transaction ID": "transactionId",
      "Transaction Date": "transactionDate",
      "License Plate": "licensePlate",
      "Space Number": "spaceNumber",
      "Mobile Number": "mobile",
      Email: "email",
      Name: "fullName",
      "Base Rate": "baseRate",
      Tax: "tax",
      "City Tax": "cityTax",
      "County Tax": "countyTax",
      "Service Fee": "serviceFee",
      "Payment Gateway Fee": "paymentGatewayFee",
      "Owner Payout": "ownerPayout",
      "ISBParking Revenue": "isbpRevenue",
      "Total Amount": "totalAmount",
      "Payment Gateway Fee Pay By": "paymentGatewayFeePayBy",
      "Payment Method": "paymentMethodType",
      Purpose: "purpose",
      id: "mongooseId",
      "Total Refund": "totalRefund",
      "Refund Transaction ID": "refundTransactionId",
      "Customer ID": "stripeCustomerId",
      "Payment Method ID": "paymentMethodId",
      "Payment Status": "paymentStatus",
      "Parking Code": "parkingCode",
      "Lot Address": "placeAddress",
      "Failed Reason": "failedReason",
    };

    const filteredData = data.map((item) => {
      const filteredItem = {};
      Object.keys(columnMapping).forEach((columnName) => {
        const key = columnMapping[columnName];
        console.log("key >>>>> ", key);
        let value = item[key];
        if (key === "fullName") {
          const firstName =
            item.customerId && item.customerId.firstName
              ? item.customerId.firstName
              : "";
          const lastName =
            item.customerId && item.customerId.lastName
              ? item.customerId.lastName
              : "";
          value = `${firstName} ${lastName}`.trim();
        } else if (key === "transactionDate") {
          value = value
            ? moment.tz(value, filterOptions.tz).format("MM/DD/YYYY hh:mm A")
            : "";
        } else if (key === "licensePlate") {
          value = value
            ? value
                .filter((obj) => obj.status === 10)
                .map((plate) => plate.licensePlateNumber)
                .join(", ")
            : "";
        } else if (key === "email") {
          value =
            item["customerId"] && item["customerId"]["email"]
              ? item["customerId"]["email"]
              : "";
        } else if (key === "mobile") {
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
            "cityTax",
            "countyTax",
            "serviceFee",
            "paymentGatewayFee",
            "isbpRevenue",
            "ownerPayout",
            "totalAmount",
          ].includes(key)
        ) {
          value = value ? value : 0;
        } else if (key === "paymentMethodType") {
          value =
            value === "card" ? "Credit Card" : value === "ACH" ? "ACH" : value;
        } else if (key === "isMonthly") {
          value = value === true ? "Monthly" : "Custom";
        } else if (key === "isAutoRenew") {
          value = value === true ? "Yes" : "No";
        } else if (key === "placeAddress") {
          value = get(item, "placeId.google.formatted_address", "");
        } else if (key === "parkingCode") {
          value = get(item, "placeId.parkingCode", "");
        } else if (key === "mongooseId") {
          value =
            item.purpose === "PARKING"
              ? item.transientNumber
              : item.subscriptionNumber;
        } else if (key === "refundTransactionId") {
          value = item.paymentStatus === "refunded" ? item.transactionId : "";
        } else if (key === "totalRefund") {
          value =
            item.paymentStatus === "refunded"
              ? centsToDollars(item.totalAmount)
              : "";
        } else if (key === "failedReason") {
          value =
            item.paymentStatus === "failed" ? item.paymentInfo?.message : "";
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
        case "City Tax":
        case "County Tax":
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
    XLSX.writeFile(wb, `${moment().format("MM/DD/YYYY hh:mm A")}.xlsx`);
  };

  const handlePlaceChange = (_, newValue) => {
    if (newValue.includes("All")) {
      setFilterOptions((prev) => ({
        ...prev,
        placeId: allPlaces.map((place) => place?._id),
      }));
    } else if (newValue.length === 0) {
      setFilterOptions((prev) => ({
        ...prev,
        placeId: [],
      }));
    } else {
      setFilterOptions((prev) => ({
        ...prev,
        placeId: newValue.map((place) => place?._id),
      }));
    }
  };

  return (
    <>
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />
      <MDBox pt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <FormControl fullWidth>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={allPlaces.length > 1 ? ["All", ...allPlaces] : allPlaces}
                getOptionLabel={(option) =>
                  option === "All" ? "All Places" : option.parkingCode ?? option
                }
                renderOption={(props, option) => (
                  <li {...props}>
                    <div>
                      {option === "All" ? (
                        "All Places"
                      ) : (
                        <>
                          <MDBadge
                            badgeContent={
                              <p>{option.parkingCode.toString()}</p>
                            }
                            color="secondary"
                            variant="gradient"
                            size="md"
                          />
                          {" | "}
                          {option?.google?.formatted_address}
                        </>
                      )}
                    </div>
                  </li>
                )}
                name="placeIds"
                autoHighlight
                disableClearable
                size="small"
                value={
                  filterOptions.placeId.length === allPlaces.length
                    ? allPlaces
                    : allPlaces.filter((place) =>
                        filterOptions.placeId.includes(place?._id)
                      )
                }
                onChange={handlePlaceChange}
                renderInput={(params) => (
                  <MDInput
                    label="Place"
                    fullWidth
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: "new-password",
                    }}
                    {...params}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <Autocomplete
                disableClearable
                name="tz"
                value={filterOptions.tz}
                options={allPlaces ? timeZones : []}
                onChange={(event, newValue) => {
                  setFilterOptions((prev) => ({
                    ...prev,
                    tz: newValue,
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
                    label="Select Timezone"
                    fullWidth={true}
                    {...params}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <Autocomplete
                disableClearable
                name="type"
                value={filterOptions.status}
                options={["All", "Success", "Failed", "Refunded", "Pending"]}
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
                    label="Payment Status"
                    fullWidth={true}
                    {...params}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <Autocomplete
                disableClearable
                name="purpose"
                value={filterOptions.purpose}
                options={["All", "Transient", "Subscription"]}
                onChange={(event, newValue) => {
                  setFilterOptions((prev) => ({
                    ...prev,
                    purpose: newValue,
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
                  <MDInput label="Purpose" fullWidth={true} {...params} />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <MDButton
              color={sidenavColor}
              disabled={
                filterOptions.startDate && filterOptions.endDate ? false : true
              }
              onClick={handleGetReport}
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
              disabled={isEmpty(transactions)}
              onClick={() => downloadReport(transactions)}
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

export default TransactionReports;
