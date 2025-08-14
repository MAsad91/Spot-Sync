import { Avatar, Stack } from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import MDTypography from "components/MDTypography";

export const ParkerAvatarWithName = ({
  name,
  companyName,
  alignAvatarInCenter = false,
}) => {
  return (
    <Stack alignItems={alignAvatarInCenter ? "center" : "unset"}>
      <Avatar sx={{ bgcolor: deepPurple[500] }}>{name.substring(0, 1)}</Avatar>
      <MDTypography marginTop={1} variant="h5">
        {name}
      </MDTypography>
    </Stack>
  );
};
