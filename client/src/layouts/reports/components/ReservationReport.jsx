import { Autocomplete, Chip, FormControl } from "@mui/material";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DateRangePicker from "rsuite/DateRangePicker";
import moment from "moment-timezone";
import Statistics from "./ReservationStatistics";
import CircularIndeterminate from "components/MDLoading";
import { useMaterialUIController } from "context";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { getReservationReport } from "store/slice/reports/reportSlice";
import { getAllRates } from "store/slice/rates/rateSlice";
import { get, isEmpty, uniqBy } from "lodash";
import * as XLSX from "xlsx";
import DownloadIcon from "@mui/icons-material/Download";
import { amountToShow } from "global/functions";
import MDBadge from "components/MDBadge";
import { getPlaces } from "store/slice/places/placeSlice";
import MDSnackbar from "components/MDSnackbar";
import { getAllValidations } from "store/slice/validation/validationSlice";
import NoDataOverlay from "components/Common/NoDataOverlay";

function ReservationReports() {
  const [controller] = useMaterialUIController();
  const dispatch = useDispatch();
  const { sidenavColor } = controller;
  const allPlaces = useSelector((state) => state.places?.placesList);
  const ratesData = useSelector((state) => state.rates?.allRates);
  const validationsData = useSelector(
    (state) => state.validations?.allValidations
  );
  const [statistics, setStatistics] = useState({});
  const [reservations, setReservations] = useState([]);
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

  const [filterOptions, setFilterOptions] = useState({
    tz: "UTC",
    status: "All",
    placeId: [allPlaces?.length > 0 && allPlaces[0]?._id],
    startDate: moment(lastWeekDate),
    endDate: moment(currentDate),
    purpose: "PARKING",
    rateIds: [],
    validationCodes: [],
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
    dispatch(getAllRates());
    dispatch(getAllValidations());
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
      };
      const res = await dispatch(getReservationReport(payload)).unwrap();
      if (res.success) {
        setStatistics(res.reservationStatistics);
        setReservations(res.reservations);
      }
    } catch (error) {
      console.log("error --->", error.message);
    }
  };

  const filteredRatesData = useMemo(() => {
    if (filterOptions.placeId?.length === allPlaces?.length) {
      return ratesData;
    }
    return ratesData.filter((rate) =>
      filterOptions.placeId.includes(rate.placeId)
    );
  }, [ratesData, filterOptions.placeId]);

  const filteredValidationData = useMemo(() => {
    if (filterOptions.rateIds?.length === ratesData?.length) {
      return validationsData;
    }
    return validationsData.filter((validation) =>
      filterOptions.rateIds?.includes(validation.rateId)
    );
  }, [validationsData, filterOptions.rateIds]);

  const handleRateChange = (event, newValue) => {
    setFilterOptions((prev) => ({
      ...prev,
      rateIds: newValue.map((option) => option?._id),
    }));
  };

  const handleValidationChange = (event, newValue) => {
    setFilterOptions((prev) => ({
      ...prev,
      validationCodes: newValue.map((option) => option?._id),
    }));
  };

  const downloadReport = (data) => {
    console.log("data >>>> ", data);
    const columnMapping = {
      "Reservation ID": "transientNumber",
      "Start Date": "startDate",
      "End Date": "endDate",
      "Place Address": "placeAddress",
      "Parking Code": "parkingCode",
      "Mobile Number": "mobile",
      "License Plate": "licensePlate",
      "Space Number": "spaceNumber",
       Rate: "rate",
      "Was Validation Applied?": "isValidationApplied",
      "Validation Code": "validationCode",
      Discount: "discountPercentage",
      Status: "status",
      "Payment Method": "paymentMethodType",
      "Receipt URL": "receiptURL",
      "Extend Reminder Sent?": "isExtendReminderSend",
      "Extended Reservation": "isExtend",
      "Transaction Date": "transactionDate",
      transactionId: "transactionId",
      "Total Amount": "totalAmount",
    };

    const filteredData = data.map((item) => {
      const filteredItem = {};
      Object.keys(columnMapping).forEach((columnName) => {
        const key = columnMapping[columnName];
        let value = item[key];
        if (key === "licensePlate") {
          console.log("key >>>>> ", key, "value >>> ", value);
          value = value ? value.map((plate) => plate).join(", ") : "";
        } else if (
          [
            "baseRate",
            "tax",
            "serviceFee",
            "paymentGatewayFee",
            "isbpRevenue",
            "ownerPayout",
            "totalAmount",
            "applicationFee",
          ].includes(key)
        ) {
          value = value ? `$${amountToShow(value)}` : "$0";
        } else if (key === "paymentMethodType") {
          value =
            value === "card" ? "Credit Card" : value === "ACH" ? "ACH" : value;
        } else if (key === "placeAddress") {
          value = get(item, "placeId.google.formatted_address", "");
        } else if (key === "parkingCode") {
          value = get(item, "placeId.parkingCode", "");
        } else if (key === "rate") {
          value = `${item.rateId.title}`;
        } else if (key === "paymentId._id") {
          value =
            item["paymentId"] && item["paymentId"]["_id"]
              ? item["paymentId"]["_id"]
              : "";
        } else if (key === "placeId._id") {
          value =
            item["placeId"] && item["placeId"]["_id"]
              ? item["placeId"]["_id"]
              : "";
        } else if (key === "startDate") {
          value = value
            ? moment.tz(value, filterOptions.tz).format("MM/DD/YYYY hh:mm A")
            : "";
        } else if (key === "endDate") {
          value = value
            ? moment.tz(value, filterOptions.tz).format("MM/DD/YYYY hh:mm A")
            : "";
        } else if (key === "transactionDate") {
          value = value
            ? moment.tz(value, filterOptions.tz).format("MM/DD/YYYY hh:mm A")
            : "";
        } else if (key === "mobile") {
          value =
            item["customerId"] && item["customerId"]["mobile"]
              ? item["customerId"]["mobile"]
              : item["customerId"] && item["customerId"]["secondaryMobile"]
              ? item["customerId"]["secondaryMobile"]
              : "";
        } else if (key === "isValidationApplied") {
          value = value === true ? "Yes" : "No";
        } else if (key === "isExtendReminderSend") {
          value = value === true ? "Yes" : "No";
        } else if (key === "isExtend") {
          value = value === true ? "Yes" : "No";
        }
        filteredItem[columnName] = value;
      });
      return filteredItem;
    });

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const columnWidths = Object.keys(columnMapping).map((columnName) => {
      switch (columnName) {
        case "Reservation ID":
          return { wch: 15 };
        case "Start Date":
        case "End Date":
          return { wch: 25 };
        case "Base Rate":
        case "Tax":
        case "Service Fee":
        case "Total Amount":
          return { wch: 15 };
        case "License Plate":
        case "transactionId":
          return { wch: 30 };
        case "Receipt URL":
          return { wch: 70 };
        case "__v":
          return { wch: 10 };
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
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <Autocomplete
                disableClearable
                name="tz"
                value={filterOptions.tz}
                options={
                  allPlaces
                    ? [
                        "UTC",
                        ...uniqBy(allPlaces, "timeZoneId").map(
                          (place) => place.timeZoneId
                        ),
                      ]
                    : ["UTC"]
                }
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <Autocomplete
                disableClearable
                name="type"
                value={filterOptions.status}
                options={[
                  "All",
                  "Success",
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
                    label="Reservation Type"
                    fullWidth={true}
                    {...params}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              multiple
              disableClearable
              name="rateId"
              value={filteredRatesData.filter((rate) =>
                filterOptions.rateIds.includes(rate?._id)
              )}
              options={filteredRatesData}
              onChange={handleRateChange}
              getOptionLabel={(option) =>
                `${option.displayName} ${
                  option.title ? `(${option.title})` : ""
                }`
              }
              renderInput={(params) => (
                <MDInput label="Rate" fullWidth={true} {...params} />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={index}
                    variant="contained"
                    label={option?.displayName}
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete
              multiple
              disableClearable
              name="validationCodes"
              value={filteredValidationData.filter((validation) =>
                filterOptions.validationCodes.includes(validation?._id)
              )}
              options={filteredValidationData}
              onChange={handleValidationChange}
              getOptionLabel={(option) => option.validationCode}
              renderInput={(params) => (
                <MDInput label="Validation code" fullWidth={true} {...params} />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={index}
                    variant="contained"
                    label={option?.validationCode}
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>
          <Grid item xs={12} md={2}>
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
              disabled={isEmpty(reservations)}
              onClick={() => downloadReport(reservations)}
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

export default ReservationReports;
