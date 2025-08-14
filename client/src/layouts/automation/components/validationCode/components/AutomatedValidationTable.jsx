import { Icon, IconButton, LinearProgress, Stack, Button } from "@mui/material";
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
import { deleteAutomatedValidation } from "store/slice/automatedValidations/automatedValidationSlice";
import moment from "moment";
import ValidationCodeDialog from "./ValidationCodeViewDialog";
import { useMaterialUIController } from "context";

const AutomatedValidationTable = (props) => {
  const { ratesData, validationData, updateParentData } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [validationId, setValidationId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [validationCodeView, setValidationCodeView] = useState(false);
  const [validationCode, setValidationCode] = useState([]);
  
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handelDelete = () => {
    setIsLoading(true);
    dispatch(deleteAutomatedValidation(validationId))
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
      field: "validationCodes",
      headerName: "Validation Codes",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <>
        <div>
            <MDBadge
              badgeContent={`${row.validationCodes[0]}`}
              color={sidenavColor}
              variant="gradient"
              size="sm"
              sx={{ marginRight: 1 }}
              max={9999999999}
            />
          {row.validationCodes?.length > 1 && (
              <Button
                color={sidenavColor}
                sx={{ padding: 0 }}
                disableRipple
                onClick={() => {
                  setValidationCodeView(true);
                  setValidationCode(row.validationCodes);
                }}
              >
                ...
                {row.validationCodes.length - 1}
                more
              </Button>
            )}
          </div>
        </>
      ),
    },
    {
      field: "presetCodes",
      headerName: "Preset Codes",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.presetCodes ? "Yes" : "No"}
        </MDTypography>
      ),
    },
    {
      field: "rates",
      headerName: "Rates",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.rateId ? row?.rateId?.map(rateId => ratesData.find(rate => rate?._id === rateId)?.displayName).filter(Boolean).join(', ') || "N/A" : "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "discount",
      headerName: "Discount",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.discount ? row?.discount : "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.quantity ? row?.quantity : "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "validFrom",
      headerName: "Valid From",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.validFrom ? moment(row.validFrom, 'YYYY-MM-DD HH:mm:ss').format("DD-MM-YYYY") : "N/A"}

        </MDTypography>
      ),
    },
    {
      field: "validUntil",
      headerName: "Valid Until",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.validUntil ? moment(row.validUntil, 'YYYY-MM-DD').format("DD-MM-YYYY") : "N/A"}
        </MDTypography>
      ),
    },
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
            whiteSpace: "pre-wrap",
          }}
        >
          {row?.ccEmails?.join(", ")}
        </MDTypography>
      ),
    },
    {
      field: "trigger",
      headerName: "Email Trigger",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row?.isDaily && (
            <MDBadge
              badgeContent={capitalizeAndReplace("Daily")()}
              color="secondary"
              variant="gradient"
              size="sm"
            />
          )}
          {row?.isWeekly && (
            <MDBadge
              badgeContent={capitalizeAndReplace("Weekly")()}
              color="secondary"
              variant="gradient"
              size="sm"
            />
          )}
          {row?.isMonthly && (
            <MDBadge
              badgeContent={capitalizeAndReplace("Monthly")()}
              color="secondary"
              variant="gradient"
              size="sm"
            />
          )}
          {row?.isYearly && (
            <MDBadge
              badgeContent={capitalizeAndReplace("Yearly")()}
              color="secondary"
              variant="gradient"
              size="sm"
            />
          )}
        </>
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
                setValidationId(row._id);
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
        rows={validationData ?? []}
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
      <ValidationCodeDialog
        validationCode={validationCode}
        dialogOpen={validationCodeView}
        onClose={() => {
          setValidationCodeView(false);
        }}
      />
    </>
  );
};

export default AutomatedValidationTable;
