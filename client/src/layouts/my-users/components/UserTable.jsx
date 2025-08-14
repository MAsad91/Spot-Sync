import { Icon, IconButton, LinearProgress, Stack, Tooltip } from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";
import { useState } from "react";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import MDTypography from "components/MDTypography";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import { deleteUser } from "store/slice/users/userSlice";
import { useDispatch } from "react-redux";
import { userStatusUpdate } from "store/slice/users/userSlice";
import MDSwitch from "components/MDSwitch";
import CreateUser from "./CreateUser";
import { useMaterialUIController } from "context";
import { switchUser, logout } from "store/slice/auth/authSlice";
import { useNavigate } from "react-router-dom";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";

const UserTable = (props) => {
  const { userData, updateParentData, roleModules } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUserData, setEditUserData] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userId, setUserId] = useState([]);
  const [toggleLoading, setToggleLoading] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });
  const handelDelete = () => {
    console.log("clicked");
    dispatch(deleteUser({ userId }))
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

  const handleUpdateUser = (userId, type) => {
    const status = type === "ACTIVE" ? 10 : 1;
    setToggleLoading(userId);
    dispatch(userStatusUpdate({ userId, status }))
      .unwrap()
      .then((res) => {
        console.log("slack response:", res);
        if (res?.success) {
          updateParentData();
        }
      })
      .catch((err) => {
        console.error("Error places:", err);
      })
      .finally(() => setToggleLoading(null));
  };

  const handelSwitch = (data) => {
    setIsLoading(true);
    const { email } = data;
    dispatch(switchUser({ email }))
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
    // {
    //   field: "id",
    //   headerName: "User ID",
    //   width: 120,
    //   editable: false,
    //   renderCell: ({ row }) => (
    //     <MDTypography
    //       display="block"
    //       variant="caption"
    //       sx={{ color: "black.light" }}
    //     >
    //       {row._id}
    //     </MDTypography>
    //   ),
    // },
    {
      field: "fullName",
      headerName: "Full Name",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row.firstName.concat(" ", row.lastName)}
        </MDTypography>
      ),
    },
    {
      field: "email",
      headerName: "Email ID",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.email}`}
        </MDTypography>
      ),
    },
    {
      field: "mobile",
      headerName: "Mobile No",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.mobile}`}
        </MDTypography>
      ),
    },
    {
      field: "roleTitle",
      headerName: "User Role",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row.roleId?.title}
        </MDTypography>
      ),
    },
    {
      field: "locations",
      headerName: "Locations",
      width: 150,
      renderCell: ({ row }) => (
        <div className="rowscroll">
          <>
            {
              row.locations.map((l) => <MDBadge
                badgeContent={<p>{l?.parkingCode.toString()}</p>}
                color="secondary"
                variant="gradient"
                size="md"
              />)
            }
          </>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: ({ row }) => (
        <>
          <Stack direction="row" alignItems="center">
            <Tooltip
              title={`Impersonate user`}
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
          </Stack>
          <Stack direction="row" alignItems="center">
            {roleModules.MyUser_update && (
              <MDSwitch
                disabled={toggleLoading === row._id}
                checked={row?.status === 10}
                onChange={() =>
                  handleUpdateUser(
                    row?._id,
                    row?.status === 10 ? "INACTIVE" : "ACTIVE"
                  )
                }
              />
            )}

            {roleModules.MyUser_update && (
              <IconButton
                onClick={() => {
                  setUpdateDialogOpen(true);
                  setEditUserData(row);
                }}
                color="secondary"
              >
                <Icon fontSize="small" title="Edit">
                  edit
                </Icon>
              </IconButton>
            )}

            {roleModules.MyUser_delete && (
              <IconButton
                onClick={() => {
                  setDialogOpen(true);
                  setUserId(row._id);
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
        rows={userData ?? []}
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
        onClose={() => {
          setDialogOpen(false);
        }}
        handelClick={handelDelete}
      />
      <CreateUser
        editUserData={editUserData}
        dialogOpen={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        updateParentData={updateParentData}
      />
    </>
  );
};

export default UserTable;
