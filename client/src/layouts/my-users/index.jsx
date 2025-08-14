// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// PMS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Data
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { useEffect, useState } from "react";
import CreateUser from "./components/CreateUser";
import UserTable from "./components/UserTable";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useDispatch, useSelector } from "react-redux";
import { getUsers } from "store/slice/users/userSlice";
import { FormControl } from "@mui/material";
import UserSearchBar from "./components/UserSearchBar";
function MyUsers() {
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [usersListData, setUsersListData] = useState([]);
  const [userFilteredData, setUserFilteredData] = useState([]);
  const userData = useSelector((state) => state.users?.meInfo);
  const roleModules = userData?.roleModules || {};

  useEffect(() => {
    handleGetUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleGetUsers() {
    dispatch(getUsers())
      .unwrap()
      .then((res) => {
        console.log("Users response:", res);
        if (res?.success) {
          setUsersListData(res?.users);
        }
      })
      .catch((err) => {
        console.error("Error getting users:", err);
      });
  }
  const updateData = () => {
    handleGetUsers();
  };
  return (
    <>
      <MDBox>
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
                    className="d-flex align-items-center gap-2"
                  >
                    <MDTypography
                      variant="h6"
                      color="white"
                      className="flex-grow-1"
                    >
                      Users List
                    </MDTypography>
                    {roleModules.MyUser_add && (
                      <MDButton
                        variant="outlined"
                        size="small"
                        onClick={() => setDialogOpen(true)}
                      >
                        Create
                      </MDButton>
                    )}
                  </MDBox>
                  <MDBox mx={3} pt={3} display="flex" justifyContent="flex-end">
                    <FormControl>
                      <UserSearchBar
                        usersListData={usersListData}
                        setUserFilteredData={setUserFilteredData}
                      />
                    </FormControl>
                  </MDBox>
                  <MDBox pt={3}>
                    <UserTable
                      userData={userFilteredData ? userFilteredData : []}
                      updateParentData={updateData}
                      roleModules={roleModules}
                    />
                    <CreateUser
                      dialogOpen={dialogOpen}
                      onClose={() => setDialogOpen(false)}
                      updateParentData={updateData}
                    />
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
          <Footer />
        </DashboardLayout>
      </MDBox>
    </>
  );
}

export default MyUsers;
