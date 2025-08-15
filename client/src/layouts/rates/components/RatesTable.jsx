import { Icon, IconButton, LinearProgress, Stack, Switch } from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import { useState } from "react";
import MDBadge from "components/MDBadge";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import MDTypography from "components/MDTypography";
import { getStatusInfo } from "global/functions";
import { centsToDollars } from "global/functions";
import { capitalizeFirstLetter } from "global/functions";
import { capitalizeAndReplace } from "global/functions";
import { useDispatch, useSelector } from "react-redux";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import { deleteRate } from "store/slice/rates/rateSlice";
import { rateStatusUpdate } from "store/slice/rates/rateSlice";
import { getRatesByPlaceId } from "store/slice/rates/rateSlice";
import MDDataGridToolbar from "components/MDDataTableWithFilters/MDDataGridToolbar";
const moment = require("moment");

const RatesTable = (props) => {
  const { ratesData, roleModules, placeId } = props;
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rateId, setRateId] = useState("");
  const [toggleLoading, setToggleLoading] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isLoading = useSelector((state) => state.rates.loading || false);
  const handelDelete = () => {
    dispatch(deleteRate({ rateId }))
      .unwrap()
      .then(async (res) => {
        if (res?.success) {
          await dispatch(getRatesByPlaceId(placeId));
          setDialogOpen(false);
        }
      })
      .catch((err) => {
        console.error("Error getting brand:", err);
      });
  };

  const handleUpdateRate = (rateId, type) => {
    const status = type === "ACTIVE" ? 10 : 1;
    setToggleLoading(rateId);
    dispatch(rateStatusUpdate({ rateId, status }))
      .unwrap()
      .then(async (res) => {
        console.log("update response:", res);
        if (res?.success) {
          await dispatch(getRatesByPlaceId(placeId));
        }
      })
      .catch((err) => {
        console.error("Error update:", err);
      })
      .finally(() => setToggleLoading(null));
  };

  const columnsData = [
    {
      field: "displayName",
      headerName: "Display Name",
      width: 300,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.displayName ?? "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      width: 250,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.title ?? "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {`₨ ${row?.amount}`}
        </MDTypography>
      ),
    },
    {
      field: "minimumAmount",
      headerName: "Minimum Amount",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {`₨ ${row?.minimumAmount}`}
        </MDTypography>
      ),
    },

    {
      field: "rateType",
      headerName: "Rate Type",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDBadge
          badgeContent={capitalizeAndReplace(row?.rateType)({
            replacement: "_",
          })}
          color="secondary"
          variant="gradient"
          size="sm"
        />
      ),
    },
    {
      field: "isRateOption",
      headerName: "Rate Option",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.isRateOption ? "Yes" : "No"}
        </MDTypography>
      ),
    },
    {
      field: "secondStepValidation",
      headerName: "Two Step Validation Rate",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.secondStepValidation ? "Yes" : "No"}
        </MDTypography>
      ),
    },
    {
      field: "gracePeriod",
      headerName: "Grace Period (In minutes)",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.secondStepValidation || row?.payNowValidationLaterFlow
            ? `${row.gracePeriod} Minutes`
            : "No"}
        </MDTypography>
      ),
    },
    {
      field: "isFreeRate",
      headerName: "Free Rate",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.isFreeRate ? "Yes" : "No"}
        </MDTypography>
      ),
    },

    {
      field: "rates",
      headerName: "Rates",
      width: 300,
      editable: false,
      renderCell: ({ row }) => (
        <div className="rowscroll">
          <>
            {row.rates && row.rates.length ? (
              <>
                {row.rates?.map((l) => (
                  <MDTypography
                    display="block"
                    variant="caption"
                    sx={{ color: "black.light" }}
                  >
                    {l?.displayName}
                  </MDTypography>
                ))}
              </>
            ) : (
              <>N/A</>
            )}
          </>
        </div>
      ),
    },

    {
      field: "hours",
      headerName: "Hours",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.hours + " " + row?.hourUnit ?? "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "startDay",
      headerName: "Start Day",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {capitalizeAndReplace(capitalizeFirstLetter(row?.startDay))({
            replacement: "_",
          }) ?? "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "startTime",
      headerName: "Start Time",
      width: 180,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.startTime ?? "N/A"}
        </MDTypography>
      ),
    },{
      field: "endDay",
      headerName: "End Day",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {capitalizeAndReplace(capitalizeFirstLetter(row?.endDay))({
            replacement: "_",
          }) ?? "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "endTime",
      headerName: "End Time",
      width: 180,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.endTime ?? "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "customStartDate",
      headerName: "Custom Start Date",
      width: 180,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.customStartDate ?
            moment(row.customStartDate).utc().format("YYYY-MM-DD HH:mm:ss") :"N/A"
          }
        </MDTypography>
      ),
    },
    {
      field: "customEndDate",
      headerName: "Custom End Date",
      width: 180,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row?.customEndDate ?
            moment(row.customEndDate).utc().format("YYYY-MM-DD HH:mm:ss") :"N/A"
          }
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
          {roleModules.Rate_update && (
            <Switch
              disabled={toggleLoading === row._id}
              checked={row?.status === 10}
              onChange={() =>
                handleUpdateRate(
                  row?._id,
                  row?.status === 10 ? "INACTIVE" : "ACTIVE"
                )
              }
            />
          )}
          <Stack direction="row" alignItems="center">
            {roleModules.Rate_delete && (
              <IconButton
                onClick={() => {
                  setDialogOpen(true);
                  setRateId(row._id);
                }}
                color="error"
              >
                <Icon fontSize="small">delete</Icon>
              </IconButton>
            )}
          </Stack>
        </>
      ),
    },
  ];

  const CustomToolbar = () => {
    return <MDDataGridToolbar align="center" divider={true} />;
  };

  return (
    <>
      <MDDataGrid
        rows={ratesData ?? []}
        columns={columnsData}
        getRowId={(row) => row?._id}
        pagination
        page={page}
        pageSize={pageSize}
        paginationMode="server"
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        disableSelectionOnClick={true}
        loading={isLoading}
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

export default RatesTable;
