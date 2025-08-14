import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Grid,
  Card,
  Stack,
  Icon,
  IconButton,
  Switch,
  Tooltip,
  Box,
} from "@mui/material";
import { debounce, isEmpty } from "lodash";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import CreatePlace from "./components/CreatePlace";
import MDBadge from "components/MDBadge";
import { useNavigate } from "react-router-dom";
import { getPlaces } from "store/slice/places/placeSlice";
import { useDispatch, useSelector } from "react-redux";
import { updatePlace } from "store/slice/places/placeSlice";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import { deletePlace } from "store/slice/places/placeSlice";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import { FormControl } from "@mui/material";
import PlacesSearchBar from "./components/PlacesSearchBar";
import { getBrands } from "store/slice/brands/brandSlice";

function Places() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [toggleLoading, setToggleLoading] = useState(null);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [controller] = useMaterialUIController();
  const navigate = useNavigate();
  const { sidenavColor } = controller;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [placeId, setPlaceId] = useState("");
  const brandsList = useSelector((state) => state.brands.brandsList || []);
  const placesList = useSelector((state) => state.places.placesList || []);
  const totalPlaces = useSelector((state) => state.places.totalPlaces || 0);
  const isLoading = useSelector((state) => state.places.loading || false);
  const userData = useSelector((state) => state.users?.meInfo);
  const roleModules = userData?.roleModules || {};

  const getPlacesData = useCallback(async () => {
    dispatch(getPlaces());
    dispatch(getBrands());
  }, [dispatch]);

  const debounceFn = useMemo(
    () => debounce(getPlacesData, 1000),
    [getPlacesData]
  );

  useEffect(() => {
    debounceFn();
  }, [debounceFn]);

  const handleUpdatePlace = async (placeId, type, index) => {
    setToggleLoading(index);
    await dispatch(updatePlace({ placeId, type }))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          dispatch(getPlaces());
        }
      })
      .catch((err) => {
        console.error("Error places:", err);
      })
      .finally(() => setToggleLoading(null));
  };


  const handelDelete = () => {
    dispatch(deletePlace({ placeId }))
      .unwrap()
      .then(async (res) => {
        if (res?.success) {
          dispatch(getPlaces());
          setDeleteDialogOpen(false);
        }
      })
      .catch((err) => {
        console.error("Error getting places:", err);
      });
  };

  const columnsData = [
    {
      field: "address",
      headerName: "Address",
      width: 350,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography variant="caption" color="text">
          {row?.google?.formatted_address ?? "N/A"}
        </MDTypography>
      ),
    },

    {
      field: "parkingCode",
      headerName: "Parking Code",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          color="text"
          fontWeight="medium"
        >
          {row?.parkingCode ?? "N/A"}
        </MDTypography>
      ),
    },
    {
      field: "brandLogo",
      headerName: "Brand",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <Box
          style={{ backgroundColor: "#ffffff" }}
          component="img"
          src={row?.brandId?.brandLogo}
          width="40px"
          className="img-fluid"
          sx={{ maxWidth: 80 }}
        />
      ),
    },
    {
      field: "spaces",
      headerName: "No. Of Spaces",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography display="block" variant="caption" color="text">
          {row?.spaces ?? "N/A"}
        </MDTypography>
      ),
    },

    {
      field: "actions",
      headerName: "Actions",
      width: `${200}`,
      renderCell: ({ row }) => (
        <>
          <Stack direction="row" alignItems="center">


            <Tooltip
              title={`Configure settings for this place`}
              placement="top"
            >
              <IconButton color="text">
                <Icon
                  fontSize="small"
                  onClick={() => {
                    // setEditMessageDialog(true);
                    // setEditPlaceData(row);
                  }}
                >
                  settings
                </Icon>
              </IconButton>
            </Tooltip>
            {roleModules.Place_update && (
              <Tooltip
                title={`${
                  row?.status === 10 ? "Deactivate" : "Activate"
                } Location`}
                placement="top"
              >
                <Switch
                  disabled={toggleLoading === row?._id}
                  checked={row?.status === 10}
                  onChange={() =>
                    handleUpdatePlace(
                      row?._id,
                      row?.status === 10 ? "INACTIVE" : "ACTIVE",
                      row?._id
                    )
                  }
                />
              </Tooltip>
            )}
            {roleModules.Place_delete && (
              <Tooltip title={`Delete Location`} placement="top">
                <IconButton color="error">
                  <Icon
                    fontSize="small"
                    onClick={() => {
                      setDeleteDialogOpen(true);
                      setPlaceId(row._id);
                    }}
                  >
                    delete
                  </Icon>
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </>
      ),
    },
  ];

  // const CustomToolbar = () => {
  //   return <MDDataGridToolbar align="center" divider={true} />;
  // };

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
                  {`Places (${totalPlaces})`}
                </MDTypography>
                {roleModules.Place_add && (
                  <MDButton
                    variant="outlined"
                    size="small"
                    onClick={() => setDialogOpen(true)}
                  >
                    Add New Place
                  </MDButton>
                )}
              </MDBox>
              <MDBox mx={3} pt={3} display="flex" justifyContent="flex-end">
                <FormControl>
                  <PlacesSearchBar
                    placesList={placesList}
                    setFilteredPlaces={setFilteredPlaces}
                  />
                </FormControl>
              </MDBox>
              <MDBox pt={2}>
                <MDDataGrid
                  rows={!isEmpty(filteredPlaces) ? filteredPlaces : []}
                  columns={columnsData}
                  getRowId={(row) => row._id}
                  pagination
                  page={page}
                  pageSize={pageSize}
                  paginationMode="server"
                  onPageChange={(newPage) => setPage(newPage)}
                  onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                  disableSelectionOnClick={true}
                  loading={isLoading}
                  autoHeight
                />
                <CreatePlace
                  dialogOpen={dialogOpen}
                  onClose={() => {
                    setDialogOpen(false);
                  }}
                  brandList={brandsList}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <DeleteDialog
        dialogOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
        }}
        handelClick={handelDelete}
      />
      <Footer />
    </DashboardLayout>
  );
}

export default Places;
