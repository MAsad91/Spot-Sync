import React from "react";

import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

const PaymentSkelton = () => {
  return (
    <>
      <Paper variant="outlined" className="w-100">
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ height: "10px", borderRadius: "10px" }}
          className="mx-3 my-2"
        />
        <Divider light />
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
            className="w-100"
          >
            <Skeleton
              variant="rectangular"
              animation="wave"
              width={90}
              height={70}
              sx={{ borderRadius: "10px" }}
            />
            <Skeleton
              variant="rectangular"
              animation="wave"
              width={90}
              height={70}
              sx={{ borderRadius: "10px" }}
            />
            <Skeleton
              variant="rectangular"
              animation="wave"
              width={90}
              height={70}
              sx={{ borderRadius: "10px" }}
            />
          </Stack>
          <Divider light className="my-3" />
          <Paper variant="outlined" className="p-2 mb-3">
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  width={25}
                  height={20}
                  sx={{ borderRadius: "3px" }}
                />
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  width={100}
                  height={10}
                  sx={{ borderRadius: "4px" }}
                  className="mx-3 my-2"
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  width={25}
                  height={20}
                  sx={{ borderRadius: "3px" }}
                />
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  width={25}
                  height={20}
                  sx={{ borderRadius: "3px" }}
                />
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  width={25}
                  height={20}
                  sx={{ borderRadius: "3px" }}
                />
              </Stack>
            </Stack>
          </Paper>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            className="mb-3"
          >
            <Skeleton
              variant="rectangular"
              animation="wave"
              width={20}
              height={20}
              sx={{ borderRadius: "3px" }}
            />
            <Skeleton
              variant="rectangular"
              animation="wave"
              width={150}
              height={10}
              sx={{ borderRadius: "3px" }}
            />
          </Stack>
          <Skeleton
            variant="rectangular"
            animation="wave"
            height={30}
            sx={{ width: { xs: "150px", sm: "250px" }, borderRadius: "3px" }}
            className="mx-auto"
          />
        </CardContent>
      </Paper>
    </>
  );
};

export default PaymentSkelton;
