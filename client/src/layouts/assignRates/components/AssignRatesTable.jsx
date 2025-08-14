import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Grid from "@mui/material/Grid";
import breakpoints from "assets/theme/base/breakpoints";
import {
  Icon,
  IconButton,
  LinearProgress,
  Stack,
  Chip,
  Tabs,
  Tab,
  Checkbox,
} from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import { useDispatch } from "react-redux";
import { useMaterialUIController } from "context";
import moment from "moment";
import { deleteAssignRate } from "store/slice/rates/rateSlice";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import { getAssignRatesByPlaceId } from "store/slice/rates/rateSlice";
import { getCalenderDataByPlaceId } from "store/slice/rates/rateSlice";
import { centsToDollars } from "global/functions";
import { useLocation, useNavigate } from "react-router-dom";
import Label from "components/Common/Label";
import { getAssignRatesTableDataByPlaceId } from "store/slice/rates/rateSlice";
// import { dollarToCent } from "global/functions";
const AssignRatesTable = (props) => {
  const { assignRatesData, selectedDay, placeId } = props;
  const [page, setPage] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab");
  const [tabValue, setTabValue] = useState(
    activeTab ? activeTab : "assignRates"
  );
  const [pageSize, setPageSize] = useState(10);
  const [rowHight, setRowHight] = useState(30);
  const [assignRateId, setAssignRateId] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [ratesData, setRatesData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedExtensionRows, setSelectedExtensionRows] = useState([]);
  const [data, setData] = useState([]);
  const [extensionData, setExtensionData] = useState([]);
  const [isExtension, setIsExtension] = useState(true);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handleSelectAll = (checked, isExtension = false) => {
    const updatedData =
      tabValue === "assignRates"
        ? getDataByDay(isExtension)
        : tabValue === "specialEvent"
        ? getSpecialEvent(isExtension)
        : tabValue === "blackoutDate"
        ? getBlackout()
        : getDataByDay(isExtension);

    if (isExtension) setExtensionData(updatedData);
    else setData(updatedData);
    if (checked) {
      if (isExtension)
        setSelectedExtensionRows(updatedData?.map((row) => row.assignRateId));
      else setSelectedRows(updatedData?.map((row) => row.assignRateId));
    } else {
      if (isExtension) setSelectedExtensionRows([]);
      else setSelectedRows([]);
    }
  };

  const handleSelectRow = (checked, rowId, isExtension = false) => {
    const updatedData =
      tabValue === "assignRates"
        ? getDataByDay()
        : tabValue === "specialEvent"
        ? getSpecialEvent()
        : tabValue === "blackoutDate"
        ? getBlackout()
        : getDataByDay();
    if (isExtension) setExtensionData(updatedData);
    else setData(updatedData);
    if (checked) {
      if (isExtension)
        setSelectedExtensionRows((prevRows) => [...prevRows, rowId]);
      else setSelectedRows((prevRows) => [...prevRows, rowId]);
    } else {
      if (isExtension)
        setSelectedExtensionRows((prevRows) =>
          prevRows.filter((id) => id !== rowId)
        );
      else setSelectedRows((prevRows) => prevRows.filter((id) => id !== rowId));
    }
  };

  useEffect(() => {
    // A function that sets the orientation state of the tabs.
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    /** 
     The event listener that's calling the handleTabsOrientation function when resizing the window.
    */
    window.addEventListener("resize", handleTabsOrientation);

    // Call the handleTabsOrientation function to set the state with the initial value.
    handleTabsOrientation();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  /* const renderTimingChips = (timings) => {
    setRowHight(30 * timings.length);
    return (
      <Stack style={{ height: "100%", display: "flex", alignItems: "center" }}>
        {timings.map((t, index) => (
          <Chip
            key={index}
            label={`${moment(t.startTime, "hh:mm").format(
              "hh:mm A"
            )} - ${moment(t.endTime, "hh:mm").format("hh:mm A")}`}
            color={sidenavColor}
            style={{ margin: "2px" }}
          />
        ))}
      </Stack>
    );
  }; */

  /* const renderDateChips = (dates) => {
    setRowHight(30 * dates.length);
    return (
      <Stack style={{ height: "100%", display: "flex", alignItems: "center" }}>
        {dates.map((t, index) => (
          <Chip
            key={index}
            label={`${moment(t.startDate).format(
              "DD/MM/YYYY hh:mm A"
            )} - ${moment(t.endDate).format("DD/MM/YYYY hh:mm A")}`}
            color={sidenavColor}
            style={{ margin: "2px" }}
          />
        ))}
      </Stack>
    );
  }; */

  console.log("assignRatesData ====>",assignRatesData)

  const getDataByDay = (isExtension = false) => {
    const flattenedData = assignRatesData.map((assignment) => ({
      _id: assignment?._id,
      rate: assignment?.rate?.displayName,
      rateType: assignment?.rate?.rateType,
      rateTitle: assignment?.rate?.title,
      amount: `$${centsToDollars(assignment?.rate?.amount)}`,
      hours: assignment?.rate?.hours,
      day: assignment?.day,
      placeId: assignment?.placeId,
      rateId: assignment?.rateId,
      startTime: assignment?.startTime,
      endTime: assignment?.endTime,
      assignRateId: assignment?._id,
      isExtensionRate: assignment?.isExtensionRate,
      isExtensionBasedRate: assignment?.isExtensionBasedRate ? "Yes" : "No",
      extendedFor: assignment?.extendedRate?.displayName,
      isSpecialEvent: assignment?.isSpecialEvent,
      occupancy: assignment?.occupancy
    }));
    console.log(
      flattenedData.filter(
        (row) => row.day === selectedDay && row.isExtensionRate === isExtension
      )
    );
    return flattenedData.filter(
      (row) => row.day === selectedDay && row.isExtensionRate === isExtension
    );
  };

  const getSpecialEvent = (isExtension = false) => {
    const flattenedData = assignRatesData.map((assignment) => ({
      assignRateId: assignment?._id,
      _id: assignment?._id,
      rate: assignment?.rate?.displayName,
      rateType: assignment?.rate?.rateType,
      rateTitle: assignment?.rate?.title,
      amount: `$${centsToDollars(assignment?.rate?.amount)}`,
      hours: assignment?.rate?.hours,
      day: assignment?.day,
      placeId: assignment?.placeId,
      rateId: assignment?.rateId,
      startDate: assignment?.startDate,
      endDate: assignment?.endDate,
      isExtensionRate: assignment?.isExtensionRate,
      isSpecialEvent: assignment?.isSpecialEvent,
      occupancy: assignment?.occupancy
    }));
    return flattenedData.filter(
      (row) =>
        row.isSpecialEvent === true && row.isExtensionRate === isExtension
    );
  };

  const getBlackout = () => {
    const flattenedData = assignRatesData.flatMap((assignment) => ({
      day: assignment?.day,
      placeId: assignment?.placeId,
      _id: assignment?._id,
      message: assignment?.message,
      startDate: assignment?.startDate,
      endDate: assignment?.endDate,
      isBlackout: assignment?.isBlackout,
      assignRateId: assignment?._id,
    }));
    return flattenedData.filter((row) => row.isBlackout === true);
  };

  const columnsData = [
    {
      field: "SelectAll",
      headerName: "Select All",
      width: 200,
      renderHeader: () => {
        return (
          <div>
            <Checkbox
              checked={
                selectedRows?.length === data?.length && data.length > 0
                  ? true
                  : false
              }
              onChange={(event) => handleSelectAll(event.target.checked)}
              inputProps={{ "aria-label": "Select all rows" }}
            />
            <Label variant="outlined">Select All</Label>
            {selectedRows.length > 0 && (
              <IconButton
                onClick={() => {
                  setDialogOpen(true);
                  setAssignRateId(selectedRows);
                  setSelectedRows([]);
                }}
                color="error"
              >
                <Icon fontSize="small" title="Delete All">
                  delete_forever
                </Icon>
              </IconButton>
            )}
          </div>
        );
      },
      renderCell: (params) => {
        return (
          <Checkbox
            checked={selectedRows.includes(params.row.assignRateId)}
            onChange={(event) =>
              handleSelectRow(event.target.checked, params.row.assignRateId)
            }
            inputProps={{ "aria-label": "Select row" }}
          />
        );
      },
    },
    {
      field: "rate",
      headerName: "Rate",
      width: 200,
      editable: false,
    },
    {
      field: "rateTitle",
      headerName: "Rate Title",
      width: 170,
      editable: false,
    },
    {
      field: "rateType",
      headerName: "Rate Type",
      width: 150,
      editable: false,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 150,
      editable: false,
    },

    {
      field: "occupancy",
      headerName: "occupancy",
      width: 150,
      editable: false,
    },
    {
      field: tabValue !== "assignRates" ? "date" : "time",
      headerName: tabValue !== "assignRates" ? " Dates" : "Timings",
      width: tabValue !== "assignRates" ? 350 : 250,
      editable: false,
      renderCell:
        tabValue !== "assignRates"
          ? (params) => (
              <Stack
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Chip
                  label={`${moment(params?.row?.startDate).format(
                    "DD/MM/YYYY hh:mm A"
                  )} - ${moment(params?.row?.endDate).format(
                    "DD/MM/YYYY hh:mm A"
                  )}`}
                  color={sidenavColor || "#000"}
                  style={{ margin: "2px" }}
                />
              </Stack>
            )
          : (params) => (
              <Stack
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Chip
                  label={`${moment(params?.row?.startTime, "hh:mm").format(
                    "hh:mm A"
                  )} - ${moment(params?.row?.endTime, "hh:mm").format(
                    "hh:mm A"
                  )}`}
                  color={sidenavColor || "#000"}
                  style={{ margin: "2px" }}
                />
              </Stack>
            ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center">
          <IconButton
            onClick={() => {
              setDialogOpen(true);
              setAssignRateId([params?.row?.assignRateId]);
            }}
            color="error"
          >
            <Icon fontSize="small" title="Delete">
              delete
            </Icon>
          </IconButton>
        </Stack>
      ),
    },
  ];

  const columnsDataExtension = [
    {
      field: "SelectAll",
      headerName: "Select All",
      width: 200,
      renderHeader: () => {
        return (
          <div>
            <Checkbox
              checked={
                selectedExtensionRows?.length === extensionData?.length &&
                extensionData.length > 0
                  ? true
                  : false
              }
              onChange={(event) =>
                handleSelectAll(event.target.checked, isExtension)
              }
              inputProps={{ "aria-label": "Select all rows" }}
            />
            <Label variant="outlined">Select All</Label>
            {selectedExtensionRows.length > 0 && (
              <IconButton
                onClick={() => {
                  setDialogOpen(true);
                  setAssignRateId(selectedExtensionRows);
                  setSelectedExtensionRows([]);
                }}
                color="error"
              >
                <Icon fontSize="small" title="Delete All">
                  delete_forever
                </Icon>
              </IconButton>
            )}
          </div>
        );
      },
      renderCell: (params) => {
        return (
          <Checkbox
            checked={selectedExtensionRows.includes(params.row.assignRateId)}
            onChange={(event) =>
              handleSelectRow(
                event.target.checked,
                params.row.assignRateId,
                isExtension
              )
            }
            inputProps={{ "aria-label": "Select row" }}
          />
        );
      },
    },
    {
      field: "rate",
      headerName: "Rate",
      width: 200,
      editable: false,
    },
    {
      field: "rateTitle",
      headerName: "Rate Title",
      width: 170,
      editable: false,
    },
    {
      field: "rateType",
      headerName: "Rate Type",
      width: 150,
      editable: false,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 150,
      editable: false,
    },
    {
      field: "occupancy",
      headerName: "occupancy",
       width: 150,
      editable: false,
      },
      {
      field: "isExtensionBasedRate",
      headerName: "Extension Based Rate",
      width: 150,
      editable: false,
    },
    {
      field: "extendedFor",
      headerName: "Extended Rate",
      width: 200,
      editable: false,
    },
    {
      field: tabValue !== "assignRates" ? "date" : "time",
      headerName: tabValue !== "assignRates" ? " Dates" : "Timings",
      width: tabValue !== "assignRates" ? 350 : 250,
      editable: false,
      renderCell:
        tabValue !== "assignRates"
          ? (params) => (
              <Stack
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Chip
                  label={`${moment(params.row.startDate).format(
                    "DD/MM/YYYY hh:mm A"
                  )} - ${moment(params.row.endDate).format(
                    "DD/MM/YYYY hh:mm A"
                  )}`}
                  color={sidenavColor}
                  style={{ margin: "2px" }}
                />
              </Stack>
            )
          : (params) => (
              <Stack
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Chip
                  label={`${moment(params.row.startTime, "hh:mm").format(
                    "hh:mm A"
                  )} - ${moment(params.row.endTime, "hh:mm").format(
                    "hh:mm A"
                  )}`}
                  color={sidenavColor}
                  style={{ margin: "2px" }}
                />
              </Stack>
            ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center">
          <IconButton
            onClick={() => {
              setDialogOpen(true);
              setAssignRateId([params?.row?.assignRateId]);
            }}
            color="error"
          >
            <Icon fontSize="small" title="Delete">
              delete
            </Icon>
          </IconButton>
        </Stack>
      ),
    },
  ];

  const blackOutCloumnsData = [
    {
      field: "message",
      headerName: "Message",
      width: 350,
      editable: false,
    },
    {
      field: "date",
      headerName: " Dates",
      width: 350,
      editable: false,
      renderCell: (params) => (
        <Stack
          style={{ height: "100%", display: "flex", alignItems: "center" }}
        >
          <Chip
            label={`${moment(params.row.startDate).format(
              "DD/MM/YYYY hh:mm A"
            )} - ${moment(params.row.endDate).format("DD/MM/YYYY hh:mm A")}`}
            color={sidenavColor}
            style={{ margin: "2px" }}
          />
        </Stack>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center">
          <IconButton
            onClick={() => {
              setDialogOpen(true);
              setAssignRateId([params?.row?._id]);
            }}
            color="error"
          >
            <Icon fontSize="small" title="Delete">
              delete
            </Icon>
          </IconButton>
        </Stack>
      ),
    },
  ];
  const handelDelete = async () => {
    console.log("assignRateId ====>", assignRateId);
    setIsLoading(true);
    await dispatch(deleteAssignRate({ assignRateId, placeId }))
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
          await dispatch(getCalenderDataByPlaceId(placeId));
          await dispatch(getAssignRatesTableDataByPlaceId(placeId));
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

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
    queryParams.set("tab", newValue);
    const updatedQueryString = queryParams.toString();
    navigate(`?${updatedQueryString}`);
  };

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text={"Deleting Please Wait.."}
        open={isLoading}
      />
      <MDSnackbar
        color={notification?.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />
      <Grid item xs={12} md={12} lg={12} sx={{ ml: "auto" }}>
        <AppBar position="static">
          <Tabs
            orientation={tabsOrientation}
            value={tabValue}
            onChange={handleSetTabValue}
          >
            <Tab label="Assign Rates" value="assignRates" />
            <Tab label="Special Events" value="specialEvent" />
            <Tab label="Blackout Date" value="blackoutDate" />
          </Tabs>
        </AppBar>
      </Grid>
      <Label variant="outlined" sx={{ mb: 1, ml: 3, fontSize: 18 }}>
        Rates
      </Label>
      <MDDataGrid
        // rows={flattenedData.filter(
        //   (row) => selectedDay === "all" || row.day === selectedDay
        // )}
        rows={
          tabValue === "assignRates"
            ? getDataByDay()
            : tabValue === "specialEvent"
            ? getSpecialEvent()
            : tabValue === "blackoutDate"
            ? getBlackout()
            : getDataByDay()
        }
        columns={
          tabValue === "blackoutDate" ? blackOutCloumnsData : columnsData
        }
        getRowId={(row) => row._id}
        pagination
        rowHeight={rowHight}
        page={page}
        pageSize={pageSize}
        paginationMode="server"
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        disableSelectionOnClick={true}
        components={{
          LoadingOverlay: LinearProgress,
        }}
      />
      {tabValue !== "blackoutDate" && (
        <>
          <Label
            variant="outlined"
            sx={{ mt: 2, mb: 1, ml: 3, fontSize: 18 }}
            fontSize="20"
          >
            Extension Rates
          </Label>
          <MDDataGrid
            rows={
              tabValue === "assignRates"
                ? getDataByDay(isExtension)
                : tabValue === "specialEvent"
                ? getSpecialEvent(isExtension)
                : getDataByDay()
            }
            columns={columnsDataExtension}
            getRowId={(row) => row._id}
            pagination
            rowHeight={rowHight}
            page={page}
            pageSize={pageSize}
            paginationMode="server"
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            disableSelectionOnClick={true}
          />
        </>
      )}

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

export default AssignRatesTable;
