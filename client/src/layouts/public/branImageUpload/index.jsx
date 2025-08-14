import React, { useEffect } from "react";
import { CardContent, Container, Divider, Grid, Paper } from "@mui/material";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import MDTypography from "components/MDTypography";
import UploadBrandImage from "./components/UploadBrandImage";
import { useLocation } from "react-router-dom";
import LoadingSkelton from "./components/loadingSkelton";

const BrandImageUpload = () => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const location = useLocation();

  // Get brandId from URLSearchParams
  const searchParams = new URLSearchParams(location?.search);
  const bId = searchParams.get("bId");
  const signupBId = searchParams.get("signup-bId");

  // Determine brandId and isSignUp flag
  const brandId = bId || signupBId;
  const isSignUp = !!signupBId;

  useEffect(() => {
    if (!brandId) {
      if (typeof window.postMessage !== "undefined") {
        const responseObj = {
          eventData: { message: "Invalid brandId" },
          eventName: "error",
        };
        window.parent.postMessage(responseObj, "*");
      }
    }
  }, [brandId]);

  return (
    <>
      <MDBox component="section">
        <Container maxWidth={false}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={8} lg={6} xl={4}>
              <Paper variant="outlined" height="100vh">
                <MDBox
                  style={{ overflowX: "hidden", height: "100vh" }}
                  sx={{ background: darkMode ? "#1a2035" : "#FAF9F6" }}
                >
                  <MDTypography
                    variant="h5"
                    className="px-3 py-2"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      marginTop: "20px",
                    }}
                  >
                    Upload Brand Image
                  </MDTypography>
                  <Divider />
                  <CardContent sx={{ p: 2 }}>
                    {brandId && brandId !== "" ? (
                      <UploadBrandImage brandId={brandId} isSignUp={isSignUp} />
                    ) : (
                      <LoadingSkelton />
                    )}
                  </CardContent>
                </MDBox>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </MDBox>
    </>
  );
};

export default BrandImageUpload;
