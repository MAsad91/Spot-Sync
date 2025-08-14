import { useState } from "react";
import {
  DialogActions,
  DialogContent,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import CircularIndeterminate from "components/MDLoading";
import MDButton from "components/MDButton";
import MDTextButton from "components/MDTextButton";
import { useMaterialUIController } from "context";
import { useDispatch } from "react-redux";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import MDTypography from "components/MDTypography";
import { getSubscriptionDuration } from "global/functions";
import { getTimezoneName } from "global/functions";
import MDBadge from "components/MDBadge";
import { mobileNumberMasking } from "global/functions";
import { centsToDollars } from "global/functions";
import MDBox from "components/MDBox";
import { isEmpty } from "lodash";
import { sendReminderEmail } from "store/slice/subscriptions/subscriptionSlice";
import { getSubscriptionsByPlaceId } from "store/slice/subscriptions/subscriptionSlice";

const SubscriptionEmailSendDialog = (props) => {
  const [controller] = useMaterialUIController();
  const dispatch = useDispatch();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const { dialogOpen, onClose, subscriptionList, placeId } = props;
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handelEmailSend = (subscriptionIds) => {
    setIsLoading(true);
    dispatch(sendReminderEmail({ subscriptionIds }))
      .unwrap()
      .then(async (res) => {
        const success = res?.success;
        if (success) {
          await dispatch(getSubscriptionsByPlaceId(placeId));
          setIsLoading(false);
          selectedRows([]);
        }
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        setIsLoading(false);
        selectedRows([]);
      })
      .catch((err) => {
        console.error("Error getting email send:", err);
      });
  };

  const columnsData = [
    {
      field: "subscriptionNumber",
      headerName: "Subscription ID",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.subscriptionNumber || "-"}`}
        </MDTypography>
      ),
    },

    {
      field: "duration",
      headerName: "Duration",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography display="block" variant="caption">
          {getSubscriptionDuration({
            startDate: row.startDate,
            endDate: row.endDate,
            tz: getTimezoneName(),
          })}
        </MDTypography>
      ),
    },

    {
      field: "email",
      headerName: "Email",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.customerId?.email || "-"}`}
        </MDTypography>
      ),
    },
    {
      field: "cellPhone",
      headerName: "Cell Phone",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${
            row.customerId?.isEmailPrimary
              ? row.customerId?.secondaryMobile
                ? mobileNumberMasking(row.customerId.secondaryMobile)
                : "-"
              : row.customerId?.mobile
              ? mobileNumberMasking(row.customerId.mobile)
              : "-"
          }`}
        </MDTypography>
      ),
    },

    {
      field: "name",
      headerName: "Name",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.customerId?.firstName} ${row.customerId?.lastName}`}
        </MDTypography>
      ),
    },

    {
      field: "subscriptionType",
      headerName: "Subscription Type",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row.isMonthly ? "Monthly" : "Custom"}
        </MDTypography>
      ),
    },

    {
      field: "totalAmount",
      headerName: "Total Amount",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isMonthly &&
          row.renewalCount === 0 &&
          row?.totalAmount !== row?.firstMonthTotalAmount ? (
            <>
              <Stack direction="row" spacing={1}>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light", textDecoration: "line-through" }}
                >
                  {`$${centsToDollars(row?.totalAmount)}`}
                </MDTypography>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light" }}
                >
                  {`$${centsToDollars(row?.firstMonthTotalAmount)}`}
                </MDTypography>
              </Stack>
            </>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.light" }}
            >
              {`$${centsToDollars(row?.totalAmount)}`}
            </MDTypography>
          )}
        </>
      ),
    },
  ];

  const handleSelectionChange = (selectionModel) => {
    setSelectedRows(selectionModel);
    const selectedData = subscriptionList.filter((row) =>
      selectionModel.includes(row._id)
    );
  };

  const getRowClassName = (params) => {
    return params.row.isReminderEmailSend ? "disabledRow" : "";
  };

  const isRowSelectable = (params) => {
    return !params.row.isReminderEmailSend;
  };

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Please wait..! "
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
      <MDDialog
        dialogTitle="Reminder email confirmation!"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="md"
      >
        <DialogContent>
          <>
            <MDBox mt={2}>
              <MDDataGrid
                rows={!isEmpty(subscriptionList) ? subscriptionList : []}
                columns={columnsData}
                getRowId={(row) => row._id}
                pageSize={10}
                rowsPerPageOptions={[10]}
                disableSelectionOnClick
                loading={isLoading}
                components={{
                  NoRowsOverlay: EmptyTableRowOverlay,
                  LoadingOverlay: LinearProgress,
                }}
                autoHeight
                checkboxSelection
                onRowSelectionModelChange={handleSelectionChange}
                getRowClassName={getRowClassName}
                isRowSelectable={isRowSelectable}
              />
            </MDBox>
          </>
        </DialogContent>
        <DialogActions>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="end"
          >
            <MDTextButton onClick={() => onClose()}>Cancel</MDTextButton>
            {subscriptionList.length > 0 && (
              <MDButton
                size="small"
                variant="contained"
                color={sidenavColor}
                disabled={selectedRows.length < 1}
                onClick={() => handelEmailSend(selectedRows)}
              >
                {`Send Email ${
                  selectedRows.length > 0 ? `(${selectedRows.length})` : ""
                }`}
              </MDButton>
            )}
          </Stack>
        </DialogActions>
      </MDDialog>
    </>
  );
};

export default SubscriptionEmailSendDialog;
