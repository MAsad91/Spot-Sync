import { Icon, IconButton, LinearProgress, Stack } from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import { useState } from "react";
import { useDispatch } from "react-redux";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import MDTypography from "components/MDTypography";
import { deleteValidation } from "store/slice/validation/validationSlice";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import moment from "moment";

const ValidationTable = (props) => {
  const { validationData, updateParentData, roleModules } = props;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [validationId, setValidationId] = useState();
  const dispatch = useDispatch();

  const handelDelete = () => {
    dispatch(deleteValidation({ validationId }))
      .unwrap()
      .then(async (res) => {
        if (res?.success) {
          updateParentData();
          setDialogOpen(false);
        }
      })
      .catch((err) => {
        console.error("Error getting brand:", err);
      });
  };
  const columnsData = [
    {
      field: "validationCode",
      headerName: "Validation Code",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row.validationCode}
        </MDTypography>
      ),
    },
    {
      field: "rate",
      headerName: "Rate",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.rateId?.displayName}`}
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
          {` ${moment(row.validFrom).utc().format("MM/DD/YYYY, hh:mm A")}`}
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
          {` ${moment(row.validUntil).utc().format("MM/DD/YYYY, hh:mm A")}`}
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
          {` ${row.quantity}`}
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
          {` ${row.discount}%`}
        </MDTypography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: ({ row }) => (
        <>
          <Stack direction="row" alignItems="center">
            {roleModules.Validation_delete && (
              <IconButton
                onClick={() => {
                  setDialogOpen(true);
                  setValidationId(row._id);
                }}
                color="error"
              >
                <Icon fontSize="small" title="Delete">
                  delete
                </Icon>
              </IconButton>
            )}
          </Stack>
        </>
      ),
    },
  ];

  return (
    <>
      <MDDataGrid
        rows={validationData ?? []}
        columns={columnsData}
        getRowId={(row) => row._id}
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
        onClose={() => {
          setDialogOpen(false);
        }}
        handelClick={handelDelete}
      />
    </>
  );
};

export default ValidationTable;
