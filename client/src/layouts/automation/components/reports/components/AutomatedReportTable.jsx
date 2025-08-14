import { Icon, IconButton, LinearProgress, Stack } from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import { useState } from "react";
import MDBadge from "components/MDBadge";
import MDSnackbar from "components/MDSnackbar";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import MDTypography from "components/MDTypography";
import { getStatusInfo } from "global/functions";
import CircularIndeterminate from "components/MDLoading";
import { capitalizeAndReplace } from "global/functions";
import { useDispatch } from "react-redux";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import { deleteAutomatedReport } from "store/slice/automatedReports/automatedSlice";

const AutomatedReportTable = (props) => {
  const { reportData, updateParentData } = props;
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [reportId, setReportId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const filteredReports = reportData.filter(report => (
    report.isDaily === true ||
    report.isWeekly === true ||
    report.isMonthly === true
  ));

  const handelDelete = () => {
    setIsLoading(true);
    dispatch(deleteAutomatedReport(reportId))
      .unwrap()
      .then(async (res) => {
        const success = res?.success;
        setIsLoading(false);
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        if (success) {
          updateParentData();
          setDialogOpen(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setNotification({
          ...notification,
          color: "error",
          title: "Error",
          content: err?.message,
          icon: "warning",
          show: true,
        });
      });
  };

  const columnsData = [
    {
      field: "toEmail",
      headerName: "To Email",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.toEmail ?? "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "ccEmails",
      headerName: "CC Emails",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{
            color: "black.light",
            whiteSpace: 'pre-wrap',
          }}
        >
          {row?.ccEmails?.join(", ")}
        </MDTypography>
      ),
    },
    {
      field: "places",
      headerName: "Places",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{
            color: "black.light",
            whiteSpace: 'pre-wrap',
          }}
        >
          {row?.placeIds?.map((place) => place.parkingCode).join(", ") ?? "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "trigger",
      headerName: "Email Trigger",
      width: 250,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {
            row?.isDaily &&
            <MDBadge
              badgeContent={capitalizeAndReplace("Daily")()}
              color="secondary"
              variant="gradient"
              size="sm"
            />
          }
          {
            row?.isWeekly &&
            <MDBadge
              badgeContent={capitalizeAndReplace("Weekly")()}
              color="secondary"
              variant="gradient"
              size="sm"
            />
          }
          {
            row?.isMonthly &&
            <MDBadge
              badgeContent={capitalizeAndReplace("Monthly")()}
              color="secondary"
              variant="gradient"
              size="sm"
            />
          }
        </>
      ),
    },
    {
      field: "isTransaction",
      headerName: "Is Transaction",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{
            color: "black.light",
            whiteSpace: 'pre-wrap',
          }}
        >
          {row?.isTransaction === undefined ? "YES" : row.isTransaction ? "YES" : "NO"}
        </MDTypography>
      ),
    },
    {
      field: "isRefund",
      headerName: "Is Refund",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{
            color: "black.light",
            whiteSpace: 'pre-wrap',
          }}
        >
          {row?.isRefund ? "YES" : "NO"}
        </MDTypography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      editable: false,
      renderCell: ({ row }) => {
        return (
          <MDBadge
            badgeContent={getStatusInfo(row?.status, "text")}
            color={getStatusInfo(row?.status, "color")}
            variant="gradient"
            size="sm"
          />
        );
      },
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: ({ row }) => (
        <>
          <Stack direction="row" alignItems="center">
            <IconButton
              onClick={() => {
                setDialogOpen(true);
                setReportId(row._id);
              }}
              color="error"
            >
              <Icon fontSize="small">delete</Icon>
            </IconButton>
          </Stack>
        </>
      ),
    },
  ];

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Deleting automated report.. "
        open={isLoading}
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
      <MDDataGrid
        rows={filteredReports ?? []}
        columns={columnsData}
        getRowId={(row) => row?._id}
        pagination
        page={page}
        pageSize={pageSize}
        paginationMode="server"
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        disableSelectionOnClick={true}
        components={{
          NoRowsOverlay: EmptyTableRowOverlay,
          LoadingOverlay: LinearProgress,
        }}
      />
      <DeleteDialog
        dialogOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        handelClick={handelDelete}
      />
    </>
  );
};

export default AutomatedReportTable;
