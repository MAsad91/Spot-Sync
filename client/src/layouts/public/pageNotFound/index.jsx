const { Box } = require("@mui/material");

const PageNotFound = () => {
  return (
    <>
      <Stack className="align-items-center row-gap-4 p-5">
        <Box
          component="img"
          src="/assets/images/404.png"
          alt="Home Banner"
          loading="lazy"
          className="img-fluid-w-100"
          sx={{ maxWidth: { xs: 500, xl: 600 } }}
        />
        <Typography className="fs-4 text-gray-dark mb-3 text-center">
          We can't seem to find a page you're looking for.
        </Typography>
        <Button
          href="/"
          startIcon={<HomeIcon />}
          className="text-white bg-primary px-3"
        >
          Back to homepage
        </Button>
      </Stack>
    </>
  );
};
