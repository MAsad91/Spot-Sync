import React from "react";
import { map } from "lodash";

import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";

const numToArray = (num) => {
  return Array.from(Array(num).keys());
};

export const DetailCardHeaderSkeleton = (props) => {
  const { disableHeaderButton } = props;

  return (
    <Box className="px-3 py-2 border-bottom">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Skeleton variant="text" animation="wave" width="20%" height={20} />
        {disableHeaderButton ? null : (
          <Skeleton
            variant="circular"
            animation="wave"
            width={32}
            height={32}
          />
        )}
      </Stack>
    </Box>
  );
};
export const DetailCardContentSkeleton = (props) => {
  const { rows } = props;

  const arrayValue = rows ? numToArray(rows) : [1, 2, 3, 4, 5];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          md: "1fr 1fr",
          xs: "1fr",
        },
        gridRowGap: "16px",
      }}
    >
      {map(arrayValue, (item) => (
        <Stack direction="row" alignItems="center" spacing={2} key={item}>
          <Skeleton variant="text" animation="wave" width="30%" height={20} />
          <Skeleton variant="text" animation="wave" width="30%" height={20} />
        </Stack>
      ))}
    </Box>
  );
};

const DetailCardSkeleton = (props) => {
  const { skeletons, cardProps } = props;

  const arrayValue = skeletons ? numToArray(skeletons) : [1];

  return (
    <Stack direction="column" spacing={2} className="w-100">
      {map(arrayValue, (item) => (
        <Paper key={item} className="w-100" {...cardProps}>
          <DetailCardHeaderSkeleton {...props} />
          <CardContent>
            <DetailCardContentSkeleton {...props} />
          </CardContent>
        </Paper>
      ))}
    </Stack>
  );
};
export default DetailCardSkeleton;
