// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// PMS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Data
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { useState } from "react";
import CreateSlack from "./components/CreateSlack";
import CronJobs from "./components/CronJobs";
import { Formik } from "formik";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// import MDTypography from "components/MDTypography";

function Cron() {
  // const [age, setAge] = useState('');
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;

  const [dialogOpen, setDialogOpen] = useState(false);
  // const handleChange = (event) => {
  //   setAge(event.target.value);
  // };
  return (
<DashboardLayout>
      <DashboardNavbar />
    <MDBox>
      <Formik
      // initialValues={{
      //   brand_logo: [],
      //   brand_name: "",
      //   short_name: "",
      //   owner_name: "",
      //   email: "",
      //   owner_mobile: "",
      // }}
      // validationSchema={createBrandValidationSchema}
      // onSubmit={(value, action) => {
      //   console.log("values", value);
      // }}
      >
        {(props) => (

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
                      Cron Jobs
                    </MDTypography>

                    <MDButton
                      variant="outlined"
                      size="small"
                      onClick={() => setDialogOpen(true)}
                    >
                      Create Cron
                    </MDButton>
                  </MDBox>
                  <MDBox pt={3}>
                    <CronJobs />
                    <CreateSlack
                      dialogOpen={dialogOpen}
                      onClose={() => setDialogOpen(false)}
                    />
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>

        )}
      </Formik>
    </MDBox>
    <Footer />
    </DashboardLayout>
  );
}

export default Cron;