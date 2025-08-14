import {
  Card,
  Grid,
  FormControl,
  LinearProgress,
} from "@mui/material";
import { isEmpty } from "lodash";
import breakpoints from "assets/theme/base/breakpoints";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useDispatch, useSelector } from "react-redux";
import { useMaterialUIController } from "context";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import { useEffect, useState } from "react";
import ReportFilterByDate from "../reservations/ReservationFilterByDate";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import moment from "moment";
import { getDepositReportAPI } from "store/slice/reports/reportSlice";

const DepositReports = () => {
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(25);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  let placeId = selectedPlace?._id;
  if (!placeId) {
    placeId = localStorage.getItem("placeId");
  }
  const [filterOptions, setFilterOptions] = useState({
    pageNo: page,
    status: "all",
    placeId,
    startDate: "",
    endDate: "",
    search: "",
  });

  const fetchReportData = async () => {
    try {
      const startDate = isEmpty(filterOptions.startDate) ?
        moment().startOf("month").unix() :
        moment(filterOptions.startDate).unix();

      const endDate = isEmpty(filterOptions.endDate) ?
        moment().startOf("day").subtract(1, 'day').unix() :
        moment(filterOptions.endDate).unix();

      dispatch(getDepositReportAPI({
        startDate,
        endDate,
        connectedAccountId: selectedPlace?.connectAccountId
      })).then(async (res) => {
        console.log(res)
        if (!res.payload.success) {
          setError('Failed to fetch the report');
          return;
        }

        const text = res.payload.data;

        // Parse CSV into a JSON array
        const rows = text.split('\n').map((row) => row.split(','));
        const [headers, ...content] = rows;

        // Convert rows into objects
        const jsonData = content.map((row, index) => {
          return ({
            customId: index,
            ...headers.reduce((acc, header, idx) => {
              acc[header.replace(/['"]+/g, '')] = row[idx]?.replace(/['"]+/g, '');
              return acc;
            }, {})
        });
        });

        setData(jsonData);
      });
      } catch (err) {
        setError('Failed to fetch the report');
      } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dispatch, filterOptions]);

  useEffect(() => {
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    window.addEventListener("resize", handleTabsOrientation);
    handleTabsOrientation();
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  const columnsData = isEmpty(data) ? [] : Object.keys(data[0]).map((key) => {
    return {
      field: key,
      headerName: key,
      width: 150,
      editable: false
    };
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={2} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={1}
                mt={-2}
                py={1}
                px={1}
                variant="gradient"
                bgColor={sidenavColor}
                borderRadius="lg"
                coloredShadow={sidenavColor}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Deposit Reports
                </MDTypography>
              </MDBox>

              <MDBox p={2}>
                <Grid container spacing={2} className="justify-content-end">
                  {/* <Grid item xs={12} md={4}>
                    <PlacePicker />
                  </Grid> */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <ReportFilterByDate
                        filterOptions={filterOptions}
                        setFilterOptions={setFilterOptions}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </MDBox>

              <MDBox p={2}>
                <MDDataGrid
                  rows={!isEmpty(data) ? data : []}
                  columns={columnsData}
                  getRowId={(row) => row["customId"]}
                  disableSelectionOnClick
                  loading={loading}
                  pagination
                  page={page}
                  pageSize={pageSize}
                  paginationMode="client"
                  paginationModel={{ page: page, pageSize: pageSize }}
                  onPaginationModelChange={(params) => {
                    setPage(params.page);
                  }}
                  onPageSizeChange={(params) => setPageSize(params.pageSize)}
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
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default DepositReports;
