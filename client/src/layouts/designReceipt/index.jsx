// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// PMS components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import AddIcon from "@mui/icons-material/Add";
// Data

import { useMaterialUIController } from "context";

import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useState } from "react";
import CreateReceipt from "./components/CreateReceipt";
import PreViewCard from "./components/PreViewCard";

function DesignReceipt() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [dialogOpen, setDialogOpen] = useState(false);
  const content = `<h4 style="text-align:left;"><strong>Hello World</strong></h4>`;

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
                      Design Receipt
                    </MDTypography>
                  </MDBox>
                  <MDBox p={3} display="flex" gap={2}>
                    <MDButton
                      variant="contained"
                      color={sidenavColor}
                      onClick={() => setDialogOpen(true)}
                    >
                      <AddIcon />
                    </MDButton>
                    <PreViewCard content={content} />
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </MDBox>
          <CreateReceipt
            dialogOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
          />
          <Footer />
        </DashboardLayout>
      </MDBox>
    </>
  );
}

export default DesignReceipt;
