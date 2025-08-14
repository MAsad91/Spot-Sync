import React from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MDTypography from "components/MDTypography";

const SubscriptionDetailBox = ({ children, sx, ...rest }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          md: "280px 280px",
          sm: "240px 240px",
        },
        gap: "8px",
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

const SubscriptionDetailTitle = (props) => {
  const { title, colon, children, highlight, fontWeight, ...rest } = props;

  return (
    <Stack
      direction="row"
      justifyContent={{ sm: "space-between", xs: "flex-start" }}
      spacing={2}
      className="me-3"
    >
      {highlight ? (
        <MDTypography
          component="div"
          variant="body1"
          fontWeight={fontWeight ?? 500}
          {...props}
        >
          {title || children}
        </MDTypography>
      ) : (
        <Typography
          component="div"
          variant="subtitle2"
          fontWeight={fontWeight ?? 500}
          color="grey.700"
          {...rest}
        >
          {title || children}
        </Typography>
      )}
      {colon ? (
        <Typography component="div" variant="body1" fontWeight={700}>
          :
        </Typography>
      ) : null}
    </Stack>
  );
};

const SubscriptionDetailValue = (props) => {
  const { lineThrough, value, children, highlight, fontWeight, ...rest } =
    props;

  return (
    <>
      {highlight ? (
        <MDTypography
          component="div"
          variant="body1"
          fontWeight={fontWeight ?? 500}
          {...props}
        >
          {value || children}
        </MDTypography>
      ) : (
        <>
          {lineThrough ? (
            <>
              <Stack direction="row" spacing={1}>
                <Typography
                  component="div"
                  variant="subtitle2"
                  fontWeight={fontWeight ?? 500}
                  color="grey.900"
                  sx={{ textDecoration: "line-through" }}
                  {...rest}
                >
                  {value || children}
                </Typography>
                <Typography
                  component="div"
                  variant="subtitle2"
                  fontWeight={fontWeight ?? 500}
                  color="grey.900"
                  {...rest}
                >
                  {props.monthlyAmount}
                </Typography>
              </Stack>
            </>
          ) : (
            <Typography
              component="div"
              variant="subtitle2"
              fontWeight={fontWeight ?? 500}
              color="grey.900"
              {...rest}
            >
              {value || children}
            </Typography>
          )}
        </>
      )}
    </>
  );
};

export default SubscriptionDetailBox;
export { SubscriptionDetailTitle, SubscriptionDetailValue };
