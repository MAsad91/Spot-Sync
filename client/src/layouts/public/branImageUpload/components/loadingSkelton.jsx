import React from "react";

import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

const LoadingSkelton = () => {
  return (
    <>
      <Paper variant="outlined" className="w-100">
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ height: "50vh", borderRadius: "10px" }}
          className="mx-3 my-2"
        />
      </Paper>
    </>
  );
};

export default LoadingSkelton;
