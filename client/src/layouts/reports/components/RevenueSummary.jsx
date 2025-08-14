import { FormControl, LinearProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DateRangePicker from "rsuite/DateRangePicker";
import CircularIndeterminate from "components/MDLoading";
import { useMaterialUIController } from "context";
import { useDispatch, useSelector } from "react-redux";
import { useState, useMemo, useEffect } from "react";
import { amountToShow } from "global/functions";
import MDSnackbar from "components/MDSnackbar";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import { getRevenueSummary } from "store/slice/reports/reportSlice";
import React from "react";
import "./revenue.css"
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


const { allowedMaxDays } = DateRangePicker;

function RevenueSummary() {
  const [controller] = useMaterialUIController();
  const dispatch = useDispatch();
  const { sidenavColor } = controller;
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [reservations, setReservations] = useState([]);
  const loading = useSelector((state) => state.report?.loading);
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  let placeId = selectedPlace?._id;
  if (!placeId) {
    placeId = localStorage.getItem("placeId");
  }
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () =>
      setNotification({ ...notification, show: false }),
  });
  const currentDate = new Date();
  const lastWeekDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [filterOptions, setFilterOptions] = useState({
    placeId,
    startDate: lastWeekDate,
    endDate: currentDate,
  });
  const [downloadAble, setDownloadAble] = useState(false);
  
  useEffect(() => {
    setFilterOptions((prev) => ({
      ...prev,
      placeId: selectedPlace?._id,
    }));
  }, [selectedPlace]);

  const handleDateRangeChange = (value) => {
    if (value && value.length === 2) {
      const [startDate, endDate] = value;
      setFilterOptions((prev) => ({ ...prev, startDate, endDate }));
    } else {
      setFilterOptions((prev) => ({ ...prev, startDate: null, endDate: null }));
    }
  };

  const handleGetReport = async () => {
    try {
      setDownloadAble(false);
      const res = await dispatch(getRevenueSummary(filterOptions)).unwrap();
      if (res.success) {
        setReservations(res.data);
        setDownloadAble(true);
      }
    } catch (error) {
      console.log("error --->", error.message);
    }
  };

  const downloadReport = () => {
    // Generate the column headers and data for the table
    const columns = ["Rate", ...reservations.data.map((item) => item.time), "Total Reservations", "Gross Revenue by Rate"];
    const data = Object.keys(reservations.totals).map((key) => {
      const row = [key];
      reservations.data.forEach((item) => {
        const rateData = item.rates[key];
        row.push(rateData ? rateData.count : 0);
      });
      row.push(reservations.totals[key].count);
      row.push(`$${reservations.totals[key].totalSum/100}`);
      return row;
    });

    // Add summary rows
    data.push([
      "Total Reservations",
      ...reservations.data.map((item) => item.totalCount),
      "",
      "",
    ]);
    data.push([
      "% of Total Reservations",
      ...reservations.data.map((item) => `${item.percentage}%`),
      "",
      "",
    ]);
    data.push([
      "Total Revenue",
      ...reservations.data.map((item) => `$${item.totalRevenue/100}`),
      "",
      "",
    ]);
    data.push([
      "% of Total $ Value",
      ...reservations.data.map((item) => `${item.revenuePercent}%`),
      "",
      "",
    ]);
    data.push([
      "Total Service Fee",
      ...reservations.data.map((item) => `$${item.totalServiceFee/100}`),
      "",
      "",
    ]);
    data.push([
      "Total Revenue - Service Fee",
      ...reservations.data.map((item) => `$${(item.totalRevenue - item.totalServiceFee)/100}`),
      "",
      "",
    ]);

    // Initialize jsPDF in landscape mode
    const pdf = new jsPDF("landscape");

    // Use autoTable to handle column splitting and pagination
    autoTable(pdf, {
      head: [columns],
      body: data,
      styles: {
        fontSize: 8, // Adjust font size for large tables
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Adjust column width for the first column
      },
      startY: 20, // Adjust the starting position
      theme: "grid", // Grid style table
      margin: { top: 20, left: 10, right: 10 }, // Page margins
      didDrawPage: (data) => {
        // Add a page header
        pdf.setFontSize(10);
        pdf.text("Revenue Summary Report", data.settings.margin.left, 10);
      },
    });

    // Save the PDF
    pdf.save("revenue_summary.pdf");
  };

  const columns = useMemo(() => {
    const timeColumns = reservations.data?.map((item) => ({
      field: item.time,
      headerName: item.time,
      width: 100,
      type: "number",
    }));

    return [
      { field: "rate", headerName: "Rate", width: 170 },
      ...(timeColumns || []),
      {
        field: "totalReservations",
        headerName: "Total Reservations",
        width: 150,
        type: "number",
      },
      {
        field: "grossRevenue",
        headerName: "Gross Revenue by Rate",
        width: 150,
        type: "number",
      },
    ];
  }, [reservations]);

  const rows = useMemo(() => {
    if (!reservations.totals) return [];

    const rateRows = Object.keys(reservations.totals).map((key, index) => {
      const timeData = reservations.data?.map((item) => {
        const rateData = item.rates[key];
        return rateData ? { [item.time]: rateData.count } : { [item.time]: 0 };
      });

      return {
        id: `${key}-${index}`,
        rate: key,
        ...Object.assign({}, ...timeData),
        totalReservations: reservations.totals[key].count,
        grossRevenue: `$${amountToShow(reservations.totals[key].totalSum)}`,
      };
    });

    const totalReservationsRow = {
      id: "total-reservations",
      rate: "Total Reservations",
    };

    const percentageRow = {
      id: "percentage",
      rate: "% of Total Reservations",
    };

    const totalRevenueRow = {
      id: "total-revenue",
      rate: "Total Revenue",
    };

    const revenuePercentRow = {
      id: "revenue-percent",
      rate: "% of Total $ Value",
    };

    const serviceFeeRow = {
      id: "service-fee",
      rate: "Total Service Fee",
    };

    const netRevenueRow = {
      id: "net-revenue",
      rate: "Total Revenue - Service Fee",
    };

    reservations.data?.forEach((item) => {
      totalReservationsRow[item.time] = item.totalCount;
      percentageRow[item.time] = `${item.percentage}%`;
      totalRevenueRow[item.time] = `$${amountToShow(item.totalRevenue)}`;
      revenuePercentRow[item.time] = `${item.revenuePercent}%`;
      serviceFeeRow[item.time] = `$${amountToShow(item.totalServiceFee)}`;
      netRevenueRow[item.time] = `$${amountToShow(item.totalRevenue - item.totalServiceFee)}`;
    });

    return [
      ...rateRows,
      totalReservationsRow,
      percentageRow,
      totalRevenueRow,
      revenuePercentRow,
      serviceFeeRow,
      netRevenueRow,
    ];
  }, [reservations]);

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
            <PlacePicker />
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
                shouldDisableDate={allowedMaxDays(31)}
                onClean={() =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    startDate: null,
                    endDate: null,
                  }))
                }
                value={
                  filterOptions.startDate && filterOptions.endDate
                    ? [filterOptions.startDate, filterOptions.endDate]
                    : undefined
                }
                onChange={handleDateRangeChange}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4} className="d-flex justify-content-end">
            <MDButton
              color={sidenavColor}
              disabled={
                filterOptions.placeId && filterOptions.startDate && filterOptions.endDate
                  ? false
                  : true
              }
              onClick={handleGetReport}
            >
              Get Summary
            </MDButton>

            <MDButton
              color={sidenavColor}
              disabled={!downloadAble}
              onClick={downloadReport}
              className="ms-2"
            >
              Download
            </MDButton>
          </Grid>
        </Grid>
      </MDBox>
      <MDBox mt={2}>
        {reservations.data && reservations.data.length > 0 && (
          <MDDataGrid
            rows={rows}
            rowCount={rows.length}
            columns={columns}
            getRowId={(row) => JSON.stringify(row)}
            disableSelectionOnClick
            loading={loading}
            pagination
            page={page}
            pageSize={pageSize}
            paginationMode="server"
            paginationModel={{
              page: page,
              pageSize: pageSize,
            }}
            components={{
              NoRowsOverlay: EmptyTableRowOverlay,
              LoadingOverlay: LinearProgress,
            }}
            componentsProps={{
              toolbar: {
                showQuickFilter: false,
                quickFilterProps: {
                  debounceMs: 1000,
                },
              },
            }}
            autoHeight
            getRowClassName={(params) => {
              if (
                params.row.id === "total-reservations" ||
                params.row.id === "total-revenue" ||
                params.row.id === "revenue-percent" ||
                params.row.id === "service-fee" ||
                params.row.id === "net-revenue"
              ) {
                return "total-reservations-row";
              }
              return "";
            }}
          />
        )}
      </MDBox>
      <CircularIndeterminate type="full" size={20} text="Please wait..." open={loading} />
    </>
  );
}

export default RevenueSummary;

