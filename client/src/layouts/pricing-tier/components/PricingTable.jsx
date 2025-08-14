import { Icon, IconButton, LinearProgress, Stack, Switch } from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import { useState } from "react";
import { useDispatch } from "react-redux";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import { getStatusInfo } from "global/functions";
import { deletePricingTier } from "store/slice/pricingTier/pricingTierSlice";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import UpdatePricingTier from "./UpdatePricingTier";
import { updatePricingTier } from "store/slice/pricingTier/pricingTierSlice";

const PricingTier = (props) => {
  const { pricingData, updateParentData, userData, roleModules } = props;
  const [page, setPage] = useState(0);
  const dispatch = useDispatch();
  const [pageSize, setPageSize] = useState(10);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [pricingId, setPricingId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPricingData, setEditPricingData] = useState({});

  const columnsData = [
    {
      field: "default",
      headerName: "Default",
      width: 150,
      editable: false,
      renderCell: ({ row }) => {
        const status = row?.default ? 10 : 1;
        const content = getStatusInfo(status, "text");

        return (
          <MDBadge
            badgeContent={content === "Active" ? "Default" : "Conditional"}
            color={getStatusInfo(status, "color")}
            variant="gradient"
            size="sm"
          />
        );
      },
    },
    {
      field: "serviceFee",
      headerName: "Service Fee",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light", textAlign: "right" }}
        >
          {row.serviceFee === null ? " - " : `$${row.serviceFee}`}
        </MDTypography>
      ),
    },
    {
      field: "isbp_revenue",
      headerName: "ISBParking Revenue",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light", textAlign: "right" }}
        >
          {row.isbp_revenue === null
            ? " - "
            : `   ${row.isbp_revenue_type === "Percentage" ? "%" : "$"}${
                row.isbp_revenue
              }`}
        </MDTypography>
      ),
    },
    {
      field: "isbp_revenue_type",
      headerName: "ISBParking Revenue Type",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row.isbp_revenue_type === null ? " - " : row.isbp_revenue_type}
        </MDTypography>
      ),
    },
    {
      field: "isbp_revenue_percent_of",
      headerName: "Percentage OF",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row.isbp_revenue_percent_of === null ? " - " : row.isbp_revenue_percent_of}
        </MDTypography>
      ),
    },
    {
      field: "condition_on",
      headerName: "Condition On",
      width: 250,
      editable: false,
      renderCell: ({ row }) => (
        <>
          <MDBadge
            badgeContent={row.condition_on}
            color={"success"}
            variant="gradient"
            size="sm"
          />
          <MDBadge
            badgeContent={row.condition_operator}
            color={"success"}
            variant="gradient"
            size="sm"
          />
          <MDBadge
            badgeContent={row.condition_value}
            color={"success"}
            variant="gradient"
            size="sm"
          />
        </>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: ({ row }) => (
        <>
          <Stack direction="row" alignItems="center">
            {roleModules.Pricing_update && (
              <Switch
                disabled={toggleLoading === row._id}
                checked={row?.status === 10}
                onChange={() =>
                  handleUpdatePricing(
                    row?._id,
                    row?.status === 10 ? "INACTIVE" : "ACTIVE"
                  )
                }
              />
            )}

            {roleModules.Pricing_delete && !row.default && (
              <IconButton
                onClick={() => {
                  setDialogOpen(true);
                  setPricingId(row._id);
                }}
                color="error"
              >
                <Icon fontSize="small" title="Delete">
                  delete
                </Icon>
              </IconButton>
            )}

            {roleModules.Pricing_update && (
              <IconButton
                onClick={() => {
                  setEditDialogOpen(true);
                  setEditPricingData(row);
                }}
                color="secondary"
              >
                <Icon fontSize="small" title="Edit">
                  editable
                </Icon>
              </IconButton>
            )}
          </Stack>
        </>
      ),
    },
  ];

  const handelDelete = () => {
    console.log("clicked");
    dispatch(deletePricingTier({ pricingId }))
      .unwrap()
      .then(async (res) => {
        console.log("delete response:", res);
        if (res?.success) {
          updateParentData();
          setDialogOpen(false);
        }
      })
      .catch((err) => {
        console.error("Error getting brand:", err);
      });
  };

  const handleUpdatePricing = (pricingId, type) => {
    const status = type === "ACTIVE" ? 10 : 1;
    setToggleLoading(pricingId);
    dispatch(updatePricingTier({ pricingId, status }))
      .unwrap()
      .then((res) => {
        console.log("update response:", res);
        if (res?.success) {
          updateParentData();
        }
      })
      .catch((err) => {
        console.error("Error update:", err);
      })
      .finally(() => setToggleLoading(null));
  };

  return (
    <>
      <MDDataGrid
        rows={pricingData ?? []}
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
      <UpdatePricingTier
        pricingData={editPricingData}
        userRole={userData.roleLevel}
        dialogOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        updateParentData={updateParentData}
      />
    </>
  );
};

export default PricingTier;
