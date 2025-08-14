import {
  LinearProgress,
  Tooltip,
  IconButton,
  Icon,
  Stack,
  Button
} from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import { useMaterialUIController } from "context";
import { isEmpty, debounce } from "lodash";
import MDBox from "components/MDBox";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import { useState, useEffect, useMemo } from "react";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import { mobileNumberMasking } from "global/functions";
import { useDispatch, useSelector } from "react-redux";
import UpdatePermits from "./updatePermit";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import { deletePermit } from "store/slice/permits/permitSlice";
import { getPermitsByPlaceId } from "store/slice/permits/permitSlice";
import { getPermitStatistics } from "store/slice/permits/permitSlice";
import LicensePlatesDialog from "layouts/Permits/components/LicensePlatesViewDialog";
import moment from "moment";

Object.defineProperty(String.prototype, 'capitalize', {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});

const PermitsTable = (props) => {
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const { sidenavColor } = controller;
  const {
    placeId,
    startDate,
    endDate,
    search,
    tz,
    activeTab,
  } = props;
  const [data, setData] = useState({})
  const [permitId, setPermitId] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [licensePlateView, setLicensePlateView] = useState(false);
  const [licensePlates, setLicensePlates] = useState([]);
  const loading = useSelector((state) => state.permit.loading);
  const permitList = useSelector((state) => state?.permit?.permitList);
  const totalPermits = useSelector((state) => state?.permit?.totalPermits);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handelDelete = async () => {
    await dispatch(deletePermit(permitId))
      .unwrap()
      .then(async (res) => {
        const success = res?.success;
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        if (success) {
          debounceFn()
          setDeleteDialogOpen(false);
        }
      })
      .catch((err) => {
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

  const handlePageChange = (params) => {
    getPermitsData(params.page);
    setPage(params.page);
  };

  const handlePageSizeChange = (params) => {
    setPageSize(params.pageSize);
  };

  const getPermitsData = async (pageNo) => {
    const payload = {
      tz,
      pageNo: pageNo || 0,
      status: activeTab,
      placeId,
      search: search,
      startDate,
      endDate,
    };
    dispatch(getPermitsByPlaceId(payload));
    dispatch(getPermitStatistics(placeId))
  };

  const debounceFn = useMemo(
    () => debounce(getPermitsData, 1000),
    [getPermitsData]
  );

  useEffect(() => {
    debounceFn();
  }, [startDate, endDate, search, placeId, activeTab]);

  const columnsData = [
    {
      field: "permitNumber",
      headerName: "Permit #",
      width: 150,
      editable: false,

    },
    {
      field: "internalId",
      headerName: "Unit Number",
      width: 150,
      editable: false,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 150,
      editable: false,
      renderCell: ({ row }) => {
        const startDate = row.startDate ? moment(row.startDate).format('MM/DD/YYYY') : "";
        return startDate
      },

    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 150,
      editable: false,
      renderCell: ({ row }) => {
        const endDate = row.endDate ? moment(row.endDate).format('MM/DD/YYYY') : "";
        return endDate
      },

    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      editable: false,
      renderCell: ({ row }) => {
        const end = moment(row.endDate);
        const yesterday = moment().add(-1, 'day');
        const isExpired = end.isBefore(yesterday);
        return isExpired ? "Expired" : row.status?.capitalize()
      },

    },
    {
      field: "permitType",
      headerName: "Permit Type",
      width: 150,
      editable: false,
      renderCell: ({ row }) => {
        return row.permitType?.capitalize()
      },
    },
    {
      field: "rateId",
      headerName: "Custom Rate",
      width: 150,
      editable: false,
      renderCell: ({ row }) => {
        return row.rateId?.displayName?.capitalize()
      },
    },
    {
      field: "assignedName",
      headerName: "Assigned Name",
      width: 150,
      editable: false,
    },
    {
      field: "licensePlate",
      headerName: "License Plate(s)",
      width: 170,
      editable: false,
      renderCell: ({ row }) => (
        <div>
          <MDBadge
              badgeContent={`${row.licensePlate[0]}`}
              color={sidenavColor}
              variant="gradient"
              size="sm"
              sx={{ marginRight: 1 }}
              max={9999999999}
            />
            {row.licensePlate.length > 1 && (
              <Button
                color={sidenavColor}
                sx={{ padding: 0 }}
                disableRipple
                onClick={() => {
                  setLicensePlateView(true);
                  setLicensePlates(
                    row.licensePlate
                  );
                }}
              >
                ...
                {row.licensePlate.length - 1}
                more
              </Button>
            )}
        </div>
      ),
    },
    {
      field: "vehicleState",
      headerName: "Vehicle State",
      width: 150,
      editable: false,
    },
    {
      field: "vehicleMake",
      headerName: "Vehicle Make",
      width: 150,
      editable: false,
    },
    {
      field: "vehicleModel",
      headerName: "Vehicle Model",
      width: 150,
      editable: false,
    },
    {
      field: "email",
      headerName: "Email",
      width: 150,
      editable: false,
    },
    {
      field: "phoneNo",
      headerName: "Phone Number",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {`${row.phoneNo ? mobileNumberMasking(row.phoneNo) : ""}`}
        </MDTypography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: ({ row }) => (
        <>
          <Stack direction="row" alignItems="center">
            <Tooltip title="Edit" placement="top">
              <IconButton
                color="edit"
                onClick={() => {
                  setData(row)
                  setDialogOpen(true)
                }}
              >
                <Icon fontSize="small">edit </Icon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" placement="top">
              <IconButton
                color="error"
                onClick={() => {
                  setPermitId(row._id)
                  setDeleteDialogOpen(true)
                }}
              >
                <Icon fontSize="small">delete </Icon>
              </IconButton>
            </Tooltip>
          </Stack>
        </>
      ),
    },
  ];

  return (
    <>
      <MDBox mt={2}>
        <MDDataGrid
          rows={!isEmpty(permitList) ? permitList : []}
          rowCount={totalPermits}
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
      <UpdatePermits
        dialogOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        permitsData={data}
        placeId={placeId}
        startDate={startDate}
        endDate={endDate}
        search={search}
        activeTab={activeTab}
        tz={tz}
      />
      <DeleteDialog
        dialogOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
        }}
        handelClick={handelDelete}
      />
      <LicensePlatesDialog
        licensePlates={licensePlates}
        dialogOpen={licensePlateView}
        onClose={() => {
          setLicensePlateView(false);
        }}
      />
    </>
  );
};

export default PermitsTable;
