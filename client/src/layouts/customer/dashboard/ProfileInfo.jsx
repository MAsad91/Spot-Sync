import MDBox from "components/MDBox";
import React from "react";
import MDTypography from "components/MDTypography";
import { ParkerAvatarWithName } from "../ui-component";
import { useMaterialUIController } from "context";

const ProfileInfo = ({ customerInfo }) => {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  return (
    <MDBox
      borderBottom="2px solid #cbd5e1"
      paddingTop={4}
      paddingBottom={4}
      paddingLeft={2}
      paddingRight={2}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      //backgroundColor={darkMode ? "#1c1c1c" : "#ffffff"}
      sx={{ bgcolor: darkMode ? "#202940" : "#ffffff"  }}
    >
      <ParkerAvatarWithName
        name={`${customerInfo.fullName || " User"}`}
        alignAvatarInCenter
      />
      <MDTypography marginTop={1} variant="caption">
        {customerInfo.email ? customerInfo.email : customerInfo.mobile}
      </MDTypography>
      <MDTypography marginTop={1} variant="caption" fontWeight="bold">
        {customerInfo.companyName ? customerInfo.companyName : ""}
      </MDTypography>
    </MDBox>
  );
};

export default ProfileInfo;
