/**
=========================================================
* PMS - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";

// prop-types is a library for typechecking of props.
// import PropTypes from "prop-types";

// @mui material components

// PMS components
import MDBox from "components/MDBox";
// import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import { Autocomplete, Card, CircularProgress, Grid, Stack } from "@mui/material";
// import { createBrandValidationSchema } from "services/validation";

// PMS base styles
import breakpoints from "assets/theme/base/breakpoints";

// Images
import burceMars from "assets/images/bruce-mars.jpg";
// import backgroundImage from "assets/images/bg-profile.jpeg";
import backgroundImage from "assets/images/parking2.jpg";
import MDInput from "components/MDInput";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import { useSelector } from "react-redux";

function Header({ children }) {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const isLoadingPlaces = useSelector((state) => state.places.loading);


  useEffect(() => {
    // A function that sets the orientation state of the tabs.
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    /** 
     The event listener that's calling the handleTabsOrientation function when resizing the window.
    */
    window.addEventListener("resize", handleTabsOrientation);

    // Call the handleTabsOrientation function to set the state with the initial value.
    handleTabsOrientation();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  // const handleSetTabValue = (event, newValue) => setTabValue(newValue);

  const placeData = [
    { id: 1, label: "indore" },
    { id: 2, label: "India" },
    { id: 3, label: "UK" },
    { id: 4, label: "US" },
    { id: 5, label: "Panjab" },
    { id: 6, label: "Pune" },
    { id: 7, label: "Kanada" },
    { id: 8, label: "Asam" },
    { id: 9, label: "Kashmir" },
    { id: 10, label: "Rasia" },
  ];

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="8.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({
            functions: { rgba, linearGradient },
            palette: { gradients },
          }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        {isLoadingPlaces ? (
          <Stack direction="column" spacing={1} alignItems="center">
            <CircularProgress color="inherit" />
          </Stack>
        ) : <PlacePicker/>}
        {children}
      </Card>
    </MDBox>
  );
}

// Setting default props for the Header
// Header.defaultProps = {
//   children: "",
// };

// // Typechecking props for the Header
// Header.propTypes = {
//   children: PropTypes.node,
// };

export default Header;

// <Grid container spacing={3} alignItems="center">
//        <Grid item> */}
//      <MDBox height="100%" mt={0.5} lineHeight={1}>
//    <MDTypography variant="h5" fontWeight="medium">
//    Richard Davis11111
//</MDTypography>
//<MDTypography variant="button" color="text" fontWeight="regular">
// CEO / Co-Founder
// </MDTypography> */}
//<Autocomplete
// options={placeData}
//getOptionLabel={(option) => option.label ?? option}
//name="place"
// value={props.values.place}
// isOptionEqualToValue={(option, value) => {
//   if (value === "" || option.label === value.label) {
//      return true;
// }
// }}
// onChange={(event, newValue) => {
//   props.setFieldValue("place", newValue);
// }}
// autoHighlight
// disableClearable
// size="small"
// renderInput={(params) => (
// <MDInput
// label="Place"
// fullWidth={true}
// inputProps={{
// ...params.inputProps,
// autoComplete: "new-password",
// }}
// {...params}
// />
// )}
// />
// </MDBox>
//  </Grid>
// </Grid>
