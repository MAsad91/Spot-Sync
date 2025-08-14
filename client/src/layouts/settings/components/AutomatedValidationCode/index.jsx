// @mui material components
import Grid from "@mui/material/Grid";
import { grey } from "@mui/material/colors";

// PMS components
import MDBox from "components/MDBox";

import { useNavigate } from "react-router-dom";


function AutomatedValidationCode() {

  const navigate = useNavigate()
  const color = grey[900];

  return (
    <MDBox>
      <MDBox pt={2} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
          <Grid item xs={12} md={3} lg={3}>
                  <MDBox
                    fontSize="12px"
                    mb={1.5}
                    sx={{
                      color: "primary.contrastText",
                      p: 2,
                      borderRadius: "16px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate('/automation?tab=validation')
                    }}
                    bgColor={ color }
                    display="flex"
                    justifyContent="center"
                  >
                    Auto Generate Validation Code
                  </MDBox>
                </Grid>
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
}

export default AutomatedValidationCode;
