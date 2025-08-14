import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useMaterialUIController } from "context";
import BrandTable from "./components/BrandTable";
import MDButton from "components/MDButton";
import CreateBrand from "./components/CreateBrand";
import { useEffect, useState } from "react";
import { getBrands } from "store/slice/brands/brandSlice";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "lodash";
import { getUsers, getExportUsers } from "store/slice/users/userSlice";
import * as XLSX from "xlsx";

const Brands = () => {
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportUsers, setExportUsers] = useState([]);
  const brandsList = useSelector((state) => state.brands.brandsList);
  const isLoading = useSelector((state) => state.brands.loading);
  const userData = useSelector((state) => state.users?.meInfo);
  const userList = useSelector((state) => state.users?.users || []);
  const roleModules = userData?.roleModules || {};
  const roleLevel = userData?.roleLevel;

  useEffect(() => {
    if (isEmpty(brandsList)) {
      dispatch(getBrands());
    }
    if (roleLevel === 100 && isEmpty(userList)) {
      dispatch(getUsers());
    }
  }, [dispatch, brandsList, roleLevel, userList]);

  useEffect(() => {
    if (isEmpty(exportUsers)) {
      getExportUser()
    }
  }, [dispatch, exportUsers]);

  const updateData = async () => {
    await dispatch(getBrands());
  };

  const getExportUser = () => {
    dispatch(getExportUsers())
      .unwrap()
      .then((res) => {
        const success = res?.success;
        if (success) {
          setExportUsers(res?.users);
        }
      })
      .catch((err) => {
        console.error("Error creating brand:", err);
      });
  };

  const downloadBrandReport = (data) => {
    // Define keys and column names
    const columnMapping = {
      "Brand Short Name": "shortBrandName",
      "Brand Name": "brandName",
      "Owner Name": "ownerName",
      "Owner Email": "ownerEmail",
      "Owner Mobile": "ownerMobileNumber",
      "Brand Address": "brandAddress",
    };

    const filteredData = data.map((item) => {
      const filteredItem = {};
      Object.keys(columnMapping).forEach((columnName) => {
        const key = columnMapping[columnName];
        let value = item[key];
        if (key === "roleId.title") {
          value = item.roleId && item.roleId.title ? item.roleId.title : "";
        } else if (key === "userName") {
          const firstName = item.firstName ? item.firstName : "";
          const lastName = item.lastName ? item.lastName : "";
          value = `${firstName} ${lastName}`.trim();
        } else if (key === "locations") {
          value = item.locations && item.locations.length > 0
            ? item.locations.map(location => location.parkingCode).join(', ')
            : '';
        }
        filteredItem[columnName] = value;
      });
      return filteredItem;
    });

    const ws = XLSX.utils.json_to_sheet(filteredData);

    const columnWidths = Object.keys(columnMapping).map((columnName) => {
      switch (columnName) {
        case "Brand Short Name":
          return { wch: 15 };
        case "Brand Name":
          return { wch: 30 };
        case "Owner Name":
        case "Owner Email":
        case "Owner Mobile":
          return { wch: 30 };
        case "Brand Address":
          return { wch: 50 };
        case "Locations":
          return { wch: 70 };
        default:
          return { wch: 25 };
      }
    });
    ws["!cols"] = columnWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `ISBParking BrandList.xlsx`);
  };
  const downloadUserReport = (data) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const columnCount = Object.keys(data[0] || {}).length;
    ws["!cols"] = Array(columnCount).fill({ wch: 25 });
    XLSX.writeFile(wb, `ISBParking UserList.xlsx`);
  };
  return (
    <>
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
                  className="d-flex align-items-center justify-content-between"
                >
                  <MDTypography variant="h6" color="white">
                    Brands
                  </MDTypography>
                  <MDBox className="d-flex align-items-center justify-content-between">
                    {roleLevel === 100 && (
                      <MDBox>
                        <MDButton
                          variant="outlined"
                          size="small"
                          onClick={() => downloadUserReport(exportUsers)}
                        >
                          Export User
                        </MDButton>
                        <MDButton
                          variant="outlined"
                          size="small"
                          onClick={() => downloadBrandReport(brandsList)}
                        >
                          Export Brand
                        </MDButton>
                      </MDBox>
                    )}
                    {roleModules.Brand_add && (
                      <MDButton
                        variant="outlined"
                        size="small"
                        onClick={() => setDialogOpen(true)}
                      >
                        Create Brands
                      </MDButton>
                    )}
                  </MDBox>
                </MDBox>
                <MDBox pt={3}>
                  <BrandTable
                    brandsData={brandsList}
                    roleModules={roleModules}
                    updateParentData={updateData}
                    loading={isLoading}
                  />
                  <CreateBrand
                    dialogOpen={dialogOpen}
                    onClose={() => {
                      setDialogOpen(false);
                    }}
                    userList={userList}
                    updateParentData={updateData}
                    roleLevel={roleLevel}
                    userData={userData}
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
        <Footer />
      </DashboardLayout>
    </>
  );
};

export default Brands;
