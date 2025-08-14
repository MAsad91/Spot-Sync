import {
  LinearProgress,
  Tooltip,
  IconButton,
  Icon,
  Stack,
  Button,
} from "@mui/material";
import "./style.css";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import MDTypography from "components/MDTypography";
import { centsToDollars } from "global/functions";
import MDBadge from "components/MDBadge";
import { useMaterialUIController } from "context";
import { debounce, get, isEmpty } from "lodash";
import MDBox from "components/MDBox";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import { useEffect, useMemo, useState } from "react";
import { getSubscriptionDuration } from "global/functions";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import { mobileNumberMasking } from "global/functions";
import { getHours } from "global/functions";
import MDButton from "components/MDButton";
import RefundDialog from "./RefundDialog";
import { getReservations } from "store/slice/reservation/reservationSlice";
import { useDispatch, useSelector } from "react-redux";

import PaymentFailedInfoDialog from "./paymentFailedInfoDialog";

const ReservationsTable = (props) => {
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const { sidenavColor } = controller;
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [issueRefundData, setIssueRefundData] = useState("");
  const [fullRefund, setFullRefund] = useState(false);

  const [failedViewReason, setFailedViewReason] = useState(false);
  const [failedReasonData, setFailedReasonData] = useState("");
  const [filterModel, setFilterModel] = useState({
    items: JSON.parse(localStorage.getItem("dataGridFilters")) || [],
  });
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(
    JSON.parse(localStorage.getItem("dataGridColumnVisibility")) || {}
  );
  const [columnOrder, setColumnOrder] = useState(
    JSON.parse(localStorage.getItem("dataGridColumnOrder")) || []
  );

  const {
    placeId,
    startDate,
    endDate,
    searchText,
    tz,
    activeTab,
    isRefundIssued,
    setIsRefundIssued,
  } = props;

  const reservationsList = useSelector(
    (state) => state.reservations?.reservationsList
  );
  const totalReservations = useSelector(
    (state) => state.reservations?.totalReservations
  );

  const loading = useSelector((state) => state.reservations?.loading);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const userData = useSelector((state) => state.users?.meInfo);
  const roleModules = userData?.roleModules || {};

  const handleFilterChange = (newFilterModel) => {
    setFilterModel(newFilterModel);
    localStorage.setItem(
      "dataGridFilters",
      JSON.stringify(newFilterModel.items)
    );
  };

  const handleColumnVisibilityChange = (newColumnVisibilityModel) => {
    setColumnVisibilityModel(newColumnVisibilityModel);
    localStorage.setItem(
      "dataGridColumnVisibility",
      JSON.stringify(newColumnVisibilityModel)
    );
  };

  const handleColumnOrderChange = (newColumnOrder) => {
    setColumnOrder(newColumnOrder);
    localStorage.setItem("dataGridColumnOrder", JSON.stringify(newColumnOrder));
  };

  const resetSettings = () => {
    localStorage.removeItem("dataGridFilters");
    localStorage.removeItem("dataGridColumnVisibility");
    localStorage.removeItem("dataGridColumnOrder");
    setFilterModel({ items: [] });
    setColumnVisibilityModel({});
    setColumnOrder([]);
  };

  useEffect(() => {
    const savedFilters = JSON.parse(localStorage.getItem("dataGridFilters"));
    if (savedFilters) {
      setFilterModel({ items: savedFilters });
    }
    const savedVisibility = JSON.parse(
      localStorage.getItem("dataGridColumnVisibility")
    );
    if (savedVisibility) {
      setColumnVisibilityModel(savedVisibility);
    }
    const savedOrder = JSON.parse(localStorage.getItem("dataGridColumnOrder"));
    if (savedOrder) {
      setColumnOrder(savedOrder);
    }
  }, []);

  const columnsData = [
    {
      field: "orderId",
      headerName: "ID",
      width: 120,
      editable: false,
      renderCell: ({ row }) => {
        let color;
        switch (row.status) {
          case "failed":
            color = "red";
            break;
          case "refunded":
            color = "#1b6be4";
            break;
        }

        return (
          <MDTypography display="block" variant="caption" style={{ color }}>
            {row.purpose === "PARKING"
              ? row.transientNumber || "-"
              : row.subscriptionNumber || "-"}
          </MDTypography>
        );
      },
    },
    {
      field: "duration",
      headerName: "Duration",
      width: 300,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography display="block" variant="caption">
          {getSubscriptionDuration({
            startDate: row.startDate,
            endDate: row.endDate,
            tz: get(row, "placeId.timeZoneId", ""),
            isReservation: true,
          })}
        </MDTypography>
      ),
    },
    {
      field: "hours",
      headerName: "Hours",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography display="block" variant="caption">
          {getHours({ startDate: row.startDate, endDate: row.endDate })}
        </MDTypography>
      ),
    },
    {
      field: "rate",
      headerName: "Rate",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography display="block" variant="caption">
          {row.rateId?.displayName || "-"}
        </MDTypography>
      ),
    },
    {
      field: "noOfPasses",
      headerName: "No of Passes",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <div
          className="rowscroll"
          style={{ display: "flex", flexDirection: "row" }}
        >
          <MDTypography
            display="block"
            variant="caption"
            sx={{ color: "black.light" }}
          >
            {row?.noOfPasses}
          </MDTypography>
        </div>
      ),
    },
    {
      field: "lastName",
      headerName: "Riders Last Name",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <div
          className="rowscroll"
          style={{ display: "flex", flexDirection: "row" }}
        >
          <MDTypography
            display="block"
            variant="caption"
            sx={{ color: "black.light" }}
          >
            {row?.ridersLastName || "-"}
          </MDTypography>
        </div>
      ),
    },
    {
      field: "licensePlate",
      headerName: "License Plates",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <div
          className="rowscroll"
          style={{ display: "flex", flexDirection: "row" }}
        >
          {row.licensePlate.map((plate, index) => (
            <MDBadge
              key={index}
              badgeContent={<p>{plate}</p>}
              color={sidenavColor}
              variant="gradient"
              size="sm"
              sx={{ marginRight: 1 }}
            />
          ))}
        </div>
      ),
    },
    {
      field: "cellPhone",
      headerName: "Cell Phone",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${mobileNumberMasking(row.customerId.mobile)}`}
        </MDTypography>
      ),
    },

    {
      field: "paymentMethod",
      headerName: "Payment Method",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row.paymentMethodType === "card"
            ? "Credit Card"
            : row.paymentMethodType === "cash"
            ? "Cash"
            : row.paymentMethodType === "free"
            ? "Free"
            : row.paymentMethodType === "applePay"
            ? "Apple Pay"
            : row.paymentMethodType === "googlePay"
            ? "Google Pay"
            : row.paymentMethodType === "FREE PARKING"
            ? "Free Parking"
            : row.paymentMethodType === "VALIDATION CODE"
            ? "Validation Code"
            : "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "isValidationApplied",
      headerName: "Validation Applied",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.dark" }}
        >
          {`${row.isValidationApplied ? row.validationCode : "N/A"}`}
        </MDTypography>
      ),
    },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isValidationApplied &&
          row?.withoutDiscounted?.totalAmount !== row?.totalAmount ? (
            <Stack direction="row" spacing={1}>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light", textDecoration: "line-through" }}
              >
                {`$${centsToDollars(row?.withoutDiscounted?.totalAmount)}`}
              </MDTypography>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {`$${centsToDollars(row?.totalAmount)}`}
              </MDTypography>
            </Stack>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.dark" }}
            >
              {`$ ${centsToDollars(row?.totalAmount)}`}
            </MDTypography>
          )}
        </>
      ),
    },

    {
      field: "baseRate",
      headerName: "Base Rate",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isValidationApplied &&
          row?.withoutDiscounted?.baseRate !== row?.baseRate ? (
            <Stack direction="row" spacing={1}>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light", textDecoration: "line-through" }}
              >
                {`$${centsToDollars(row?.withoutDiscounted?.baseRate)}`}
              </MDTypography>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {`$${centsToDollars(row?.baseRate)}`}
              </MDTypography>
            </Stack>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.dark" }}
            >
              {`$ ${centsToDollars(row?.baseRate)}`}
            </MDTypography>
          )}
        </>
      ),
    },

    {
      field: "tax",
      headerName: `Tax`,
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isValidationApplied &&
          row?.withoutDiscounted?.tax !== row?.tax ? (
            <Stack direction="row" spacing={1}>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light", textDecoration: "line-through" }}
              >
                {`$${centsToDollars(row?.withoutDiscounted?.tax)}`}
              </MDTypography>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {`$${centsToDollars(row?.tax)}`}
              </MDTypography>
            </Stack>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.dark" }}
            >
              {`$ ${centsToDollars(row?.tax)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    {
      field: "cityTax",
      headerName: `City Tax`,
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isValidationApplied &&
          row?.withoutDiscounted?.cityTax !== row?.cityTax ? (
            <Stack direction="row" spacing={1}>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light", textDecoration: "line-through" }}
              >
                {`$${centsToDollars(row?.withoutDiscounted?.cityTax)}`}
              </MDTypography>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {`$${centsToDollars(row?.cityTax)}`}
              </MDTypography>
            </Stack>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.dark" }}
            >
              {`$ ${centsToDollars(row?.cityTax)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    {
      field: "countyTax",
      headerName: `County Tax`,
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isValidationApplied &&
          row?.withoutDiscounted?.countyTax !== row?.countyTax ? (
            <Stack direction="row" spacing={1}>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light", textDecoration: "line-through" }}
              >
                {`$${centsToDollars(row?.withoutDiscounted?.countyTax)}`}
              </MDTypography>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {`$${centsToDollars(row?.countyTax)}`}
              </MDTypography>
            </Stack>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.dark" }}
            >
              {`$ ${centsToDollars(row?.countyTax)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    {
      field: "serviceFee",
      headerName: "Service Fee",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isValidationApplied &&
          row?.withoutDiscounted?.serviceFee !== row?.serviceFee ? (
            <Stack direction="row" spacing={1}>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light", textDecoration: "line-through" }}
              >
                {`$${centsToDollars(row?.withoutDiscounted?.serviceFee)}`}
              </MDTypography>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {`$${centsToDollars(row?.serviceFee)}`}
              </MDTypography>
            </Stack>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.dark" }}
            >
              {`$ ${centsToDollars(row?.serviceFee)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    {
      field: "ownerPayout",
      headerName: "Owner Payout",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isValidationApplied &&
          row?.withoutDiscounted?.ownerPayout !== row?.ownerPayout ? (
            <Stack direction="row" spacing={1}>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light", textDecoration: "line-through" }}
              >
                {`$${centsToDollars(row?.withoutDiscounted?.ownerPayout)}`}
              </MDTypography>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {`$${centsToDollars(row?.ownerPayout)}`}
              </MDTypography>
            </Stack>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.dark" }}
            >
              {`$ ${centsToDollars(row?.ownerPayout)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    {
      field: "isbpRevenue",
      headerName: "ISBParking Revenue",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isValidationApplied &&
          row?.withoutDiscounted?.isbpRevenue !== row?.isbpRevenue ? (
            <Stack direction="row" spacing={1}>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light", textDecoration: "line-through" }}
              >
                {`$${centsToDollars(row?.withoutDiscounted?.isbpRevenue)}`}
              </MDTypography>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {`$${centsToDollars(row?.isbpRevenue)}`}
              </MDTypography>
            </Stack>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.dark" }}
            >
              {`$ ${centsToDollars(row?.isbpRevenue)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    {
      field: "paymentGatewayFee",
      headerName: "Payment Gateway Fee",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isValidationApplied &&
          row?.withoutDiscounted?.paymentGatewayFee !==
            row?.paymentGatewayFee ? (
            <Stack direction="row" spacing={1}>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light", textDecoration: "line-through" }}
              >
                {`$${centsToDollars(
                  row?.withoutDiscounted?.paymentGatewayFee
                )}`}
              </MDTypography>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {`$${centsToDollars(row?.paymentGatewayFee)}`}
              </MDTypography>
            </Stack>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.dark" }}
            >
              {`$ ${centsToDollars(row?.paymentGatewayFee)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    {
      field: "applicationFee",
      headerName: "Application Fee",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isValidationApplied &&
          row?.withoutDiscounted?.applicationFee !== row?.applicationFee ? (
            <Stack direction="row" spacing={1}>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light", textDecoration: "line-through" }}
              >
                {`$${centsToDollars(row?.withoutDiscounted?.applicationFee)}`}
              </MDTypography>
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {`$${centsToDollars(row?.applicationFee)}`}
              </MDTypography>
            </Stack>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.dark" }}
            >
              {`$ ${centsToDollars(row?.applicationFee)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    {
      field: "isExtension",
      headerName: "Extend Reservation ",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.dark" }}
        >
          {`${row.parentReservationId ? "Yes" : "No"} ${
            row.parentReservationId
              ? `( ${get(row.parentReservationId, "transientNumber", "")} )`
              : ""
          }`}
        </MDTypography>
      ),
    },


    {
      field: "spaceNumber",
      headerName: "Space Number",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <div
          className="rowscroll"
          style={{ display: "flex", flexDirection: "row" }}
        >
          {row?.spaceNumber && (
            <MDBadge
              key={Date.now()}
              badgeContent={<p>{row?.spaceNumber}</p>}
              color={sidenavColor}
              variant="gradient"
              size="sm"
              sx={{ marginRight: 1 }}
            />
          )}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: ({ row }) => (
        <>
          <Stack direction="row" alignItems="center">
            {row?.paymentId?.paymentStatus === "failed" && (
              <Button
                sx={{
                  textTransform: "none",
                  padding: 0,
                  color: "red",
                  fontWeight: "regular",
                }}
                disableRipple
                onClick={() => {
                  setFailedViewReason(true);
                  setFailedReasonData({
                    paymentInfo: get(row?.paymentId, "paymentInfo", {}),
                  });
                }}
              >
                Failed Reason
              </Button>
            )}

            {row?.paymentId?.paymentStatus !== "failed" && (
              <Tooltip title="Download Receipt" placement="top">
                <IconButton
                  color="success"
                  onClick={() => {
                    if (row?.receiptURL) {
                      window.open(row?.receiptURL, "_blank");
                    }
                  }}
                >
                  <Icon fontSize="small">download </Icon>
                </IconButton>
              </Tooltip>
            )}

            {roleModules.Reservation_refund &&
              row?.paymentId?.paymentStatus === "success" &&
              row?.paymentId?.isFullyRefunded !== true && (
                <MDButton
                  variant="gradient"
                  onClick={() => {
                    setRefundDialogOpen(true);
                    setIssueRefundData(row);
                  }}
                  fontSize="small"
                  color={sidenavColor}
                >
                  Issue Refund
                </MDButton>
              )}
          </Stack>
        </>
      ),
    },
  ];

  const handlePageChange = (params) => {
    getReservationsData(params.page);
    setPage(params.page);
  };

  const handlePageSizeChange = (params) => {
    setPageSize(params.pageSize);
  };

  const getReservationsData = async (pageNo) => {
    const payload = {
      tz,
      pageNo: pageNo || 0,
      status: activeTab,
      placeId,
      search: searchText,
      startDate,
      endDate,
    };
    dispatch(getReservations(payload));
  };

  const debounceFn = useMemo(
    () => debounce(getReservationsData, 1000),
    [getReservationsData]
  );

  useEffect(() => {
    debounceFn();
  }, [startDate, endDate, searchText, placeId]);

  // const getRowClassName = (params) => {
  //   switch (params?.row?.status) {
  //     case "failed":
  //       return activeTab === "all" ? "paymentFailed" : "";
  //     case "refunded":
  //       return activeTab === "all" ? "paymentRefunded" : "";
  //     default:
  //       return "";
  //   }
  // };

  return (
    <>
      <MDBox mt={2}>
        <MDDataGrid
          rows={!isEmpty(reservationsList) ? reservationsList : []}
          rowCount={totalReservations}
          columns={columnsData}
          getRowId={(row) => row._id}
          disableSelectionOnClick
          loading={loading}
          pagination
          page={page}
          pageSize={pageSize}
          paginationMode="server"
          paginationModel={{ page: page, pageSize: pageSize }}
          onPaginationModelChange={(params) => {
            handlePageChange(params);
          }}
          onPageSizeChange={(params) => handlePageSizeChange(params)}
          // getRowClassName={(params) => getRowClassName(params)}
          components={{
            NoRowsOverlay: EmptyTableRowOverlay,
            LoadingOverlay: LinearProgress,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: false,
              quickFilterProps: { debounceMs: 1000 },
            },
          }}
          autoHeight
          filterModel={filterModel}
          onFilterModelChange={handleFilterChange}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={handleColumnVisibilityChange}
          columnOrder={columnOrder}
          onColumnOrderChange={handleColumnOrderChange}
        />
      </MDBox>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Please wait..."
        open={loading}
      />
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />
      <RefundDialog
        dialogOpen={refundDialogOpen}
        onClose={() => {
          setRefundDialogOpen(false);
          setFullRefund(false);
        }}
        data={issueRefundData}
        isRefundIssued={isRefundIssued}
        setFullRefund={setFullRefund}
        fullRefund={fullRefund}
        setIsRefundIssued={setIsRefundIssued}
        getReservationsData={getReservationsData}
      />


      <PaymentFailedInfoDialog
        data={failedReasonData}
        dialogOpen={failedViewReason}
        onClose={() => {
          setFailedViewReason(false);
        }}
      />
    </>
  );
};

export default ReservationsTable;
