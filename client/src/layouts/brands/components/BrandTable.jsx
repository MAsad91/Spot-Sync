import React, { useState } from "react";
import {
  Box,
  Icon,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { SketchPicker } from "react-color";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import MDTypography from "components/MDTypography";
import { deleteBrand } from "store/slice/brands/brandSlice";
import { useDispatch } from "react-redux";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import { switchUser } from "store/slice/auth/authSlice";
import MDSnackbar from "components/MDSnackbar";
import { useNavigate } from "react-router-dom";
import CircularIndeterminate from "components/MDLoading";
import { logout } from "store/slice/auth/authSlice";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import { useMaterialUIController } from "context";
import { mobileNumberMasking } from "global/functions";
import { updateReceiptColor } from "store/slice/brands/brandSlice";
import PaletteIcon from "@mui/icons-material/Palette";
import DefaultFields from "./DefaultSetting";
import { formatMobileNumberWithCountryCode } from "global/functions";

const BrandTable = (props) => {
  const { brandsData, roleModules, updateParentData, loading } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [page, setPage] = useState(10);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [brandId, setBrandId] = useState("");
  const [brandRowData, setBrandRowData] = useState({});
  const [colorDialogOpen, setColorDialogOpen] = useState(false); // State for color dialog visibility
  const [color, setColor] = useState("#000"); // Initial color state
  const [settingDialogOpen, setSettingDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
  };

  const handelDelete = () => {
    dispatch(deleteBrand({ brandId }))
      .unwrap()
      .then(async (res) => {
        if (res?.success) {
          updateParentData();
          setDialogOpen(false);
        } else {
          setNotification({
            ...notification,
            color: "error",
            title: "Error",
            content: res?.message,
            icon: "warning",
            show: true,
          });
        }
      })
      .catch((err) => {
        console.log("error", err);
      });
  };

  const handelReceiptColorUpdate = () => {
    dispatch(updateReceiptColor({ brandId, receiptColor: color }))
      .unwrap()
      .then(async (res) => {
        if (res?.success) {
          updateParentData();
          setColorDialogOpen(false);
        } else {
          setNotification({
            ...notification,
            color: "error",
            title: "Error",
            content: res?.message,
            icon: "warning",
            show: true,
          });
        }
      })
      .catch((err) => {
        console.log("error", err);
      });
  };

  const handelSwitch = (data) => {
    setIsLoading(true);
    const { ownerEmail } = data;
    dispatch(switchUser({ email: ownerEmail }))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          localStorage.setItem(
            "ImpersonateBy",
            localStorage.getItem("Authorization")
          );
          dispatch(logout());
          localStorage.setItem("Authorization", res?.token);
          navigate("/");
          setIsLoading(false);
        } else {
          setNotification({
            ...notification,
            color: "error",
            title: "Error",
            content: res?.message,
            icon: "warning",
            show: true,
          });
        }
      })
      .catch((err) => {
        console.log("error", err);
      });
  };

  const columnsData = [
    {
      field: "brandLogo",
      headerName: "Brand Logo",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <Box
          style={{ backgroundColor: "#ffffff" }}
          component="img"
          src={row.brandLogo}
          width="40px"
          className="img-fluid"
          sx={{ maxWidth: 80 }}
        />
      ),
    },
    {
      field: "shortBrandName",
      headerName: "Brand Short Name",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography display="block" variant="caption" color="text">
          {row.shortBrandName}
        </MDTypography>
      ),
    },
    {
      field: "brandName",
      headerName: "Brand Name",
      width: 180,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography display="block" variant="caption" color="text">
          {row.brandName}
        </MDTypography>
      ),
    },
    {
      field: "ownerName",
      headerName: "Owner",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDBox lineHeight={1} textAlign="left">
          <MDTypography display="block" variant="caption" color="text">
            {row.ownerName}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography display="block" variant="caption" color="text">
          {row?.ownerEmail}
        </MDTypography>
      ),
    },
    {
      field: "ownerMobileNumber",
      headerName: "Mobile",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography display="block" variant="caption" color="text">
          {formatMobileNumberWithCountryCode(row.ownerMobileNumber, row.countryCode)}
        </MDTypography>
      ),
    },
    {
      field: "address",
      headerName: "Brand Address",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDBox>
          <MDTypography
            display="block"
            variant="caption"
            color="text"
            sx={{ whiteSpace: "normal" }}
          >
            {row.brandAddress || "-"}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <>
          <Stack direction="row" alignItems="center" className="gap-2">
            <MDButton
              variant="gradient"
              size="small"
              color="secondary"
              startIcon={<Icon fontSize="small">location_on</Icon>}
            >
              {row.placeCount}
            </MDButton>
          </Stack>
        </>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: ({ row }) => (
        <>
          <Stack direction="row" alignItems="center" gap={2}>
            <Tooltip
              title={`Impersonate To ${row.shortBrandName.toUpperCase()} Brand`}
              placement="left"
            >
              <MDButton
                variant="gradient"
                onClick={() => handelSwitch(row)}
                fontSize="small"
                color={sidenavColor}
              >
                <SelfImprovementIcon />
              </MDButton>
            </Tooltip>

            {roleModules.Brands_delete && (
              <IconButton
                onClick={() => {
                  setDialogOpen(true);
                  setBrandId(row._id);
                }}
                color="error"
              >
                <Icon fontSize="small">delete</Icon>
              </IconButton>
            )}
            <Tooltip title={`Update Receipt Color`} placement="left">
              <IconButton
                onClick={() => {
                  setColorDialogOpen(true);
                  setColor(row.receiptColor);
                  setBrandId(row._id);
                }}
              >
                <Icon fontSize="small" style={{ color: row.receiptColor }}>
                  palette
                </Icon>
              </IconButton>
            </Tooltip>
            <Tooltip title={`Update default Settings`} placement="left">
              <IconButton
                onClick={() => {
                  setSettingDialogOpen(true);
                  setBrandId(row._id);
                  setBrandRowData(row)
                }}
              >
                <Icon fontSize="small">
                  settings
                </Icon>
              </IconButton>
            </Tooltip>
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
        text="Switching Brand.. "
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
        rows={brandsData ?? []}
        columns={columnsData}
        getRowId={(row) => row._id}
        pagination
        page={page}
        pageSize={pageSize}
        paginationMode="server"
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        disableSelectionOnClick={true}
        loading={loading}
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

      <Dialog open={colorDialogOpen} onClose={() => setColorDialogOpen(false)}>
        <DialogTitle>Select Color</DialogTitle>
        <DialogContent>
          <SketchPicker color={color} onChange={handleColorChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorDialogOpen(false)}>Cancel</Button>
          <Button onClick={handelReceiptColorUpdate}>OK</Button>
        </DialogActions>
      </Dialog>

      <DefaultFields
        dialogOpen={settingDialogOpen}
        onClose={() => {
          setSettingDialogOpen(false);
        }}
        brandData = {brandRowData}
        updateParentData={updateParentData}
      />
    </>
  );
};

export default BrandTable;
