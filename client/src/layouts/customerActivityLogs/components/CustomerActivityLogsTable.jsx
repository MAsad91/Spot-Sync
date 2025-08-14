import "./style.css";
import {
  LinearProgress,
  Tooltip,
  IconButton,
  Icon,
  Stack,
} from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import { useEffect, useMemo, useState } from "react";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import { debounce, isEmpty } from "lodash";
import { formatDateWithTimezone } from "global/functions";
import { getCustomerActivityLogsByPlaceId } from "store/slice/customerActivityLogs/customerActivityLogsSlice";
import { useDispatch, useSelector } from "react-redux";
import ActivityLogsDailog from "./ActivityLogsDailog";

const CustomerActivityLogsTable = (props) => {
  const dispatch = useDispatch();
  const { placeId, startDate, endDate, searchText, tz } = props;
  const customerActivityLogsList = useSelector((state) => state.customerActivityLog?.list);
  const totalRecords = useSelector(
    (state) => state.customerActivityLog?.totalRecords
  );
  const loading = useSelector((state) => state.customerActivityLog?.loading);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [customerActivityLogId, setCustomerActivityLogId] = useState("");
  const [customerActivityLog, setCustomerActivityLog] = useState({});

  const columnsData = [
    {
      field: "ID",
      headerName: " ID",
      width: 250,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${
            row._id
          }`}
        </MDTypography>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created Date",
      width: 250,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${
            formatDateWithTimezone(
              row.createdAt,
              row?.placeId?.timeZoneId
            ) || "-"
          }`}
        </MDTypography>
      ),
    },
    {
      field: "customerFirstName",
      headerName: "Customer First Name",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.customerId?.firstName || "-"}`}
        </MDTypography>
      ),
    },
    {
      field: "customerLastName",
      headerName: "Customer Last Name",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.customerId?.lastName || "-"}`}
        </MDTypography>
      ),
    },
    {
      field: "mobileNumber",
      headerName: "Mobile Number",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.customerId?.mobile || "-"}`}
        </MDTypography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: ({ row }) => (
        <>
          <Stack direction="row" alignItems="center" gap={2}>
            <Tooltip title="View Details" placement="top">
              <IconButton
                color="success"
                onClick={() => {
                  setCustomerActivityLog(row);
                  setCustomerActivityLogId(row._id);
                  setDetailsDialogOpen(true);
                }}
              >
                <Icon fontSize="small">visibility</Icon>
              </IconButton>
            </Tooltip>
          </Stack>
        </>
      ),
    },
  ];

  const getCustomerActivityLogsData = async (pageNo) => {
    const payload = {
      tz,
      pageNo: pageNo || 0,
      placeId,
      search: searchText,
      startDate,
      endDate,
    };

    if (!placeId)
      return

    dispatch(getCustomerActivityLogsByPlaceId(payload));
  };

  const debounceFn = useMemo(
    () => debounce(getCustomerActivityLogsData, 1000),
    [getCustomerActivityLogsData]
  );

  useEffect(() => {
    debounceFn();
  }, [startDate, endDate, searchText, placeId]);

  const handlePageChange = (params) => {
    getCustomerActivityLogsData(params.page);
    setPage(params.page);
  };

  const handlePageSizeChange = (params) => {
    setPageSize(params.pageSize);
  };

  return (
    <>
      <MDBox mt={2}>
        <MDDataGrid
          rows={!isEmpty(customerActivityLogsList) ? customerActivityLogsList : []}
          rowCount={totalRecords}
          columns={columnsData}
          getRowId={(row) => row._id}
          disableSelectionOnClick
          loading={loading}
          pagination
          paginationMode="server"
          paginationModel={{ page: page, pageSize: pageSize }}
          onPaginationModelChange={(params) => {
            handlePageChange(params);
          }}
          onPageSizeChange={(params) => handlePageSizeChange(params)}
          components={{
            NoRowsOverlay: EmptyTableRowOverlay,
            LoadingOverlay: LinearProgress,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 1000 },
            },
          }}
          autoHeight
        />
      </MDBox>
      <ActivityLogsDailog
        customerActivityLogId={customerActivityLogId}
        customerActivityLog={customerActivityLog}
        placeId={placeId}
        dialogOpen={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
        }}
      />
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
    </>
  );
};

export default CustomerActivityLogsTable;
