import { Icon, IconButton, LinearProgress, Stack, Switch } from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import { useState } from "react";

import MDBadge from "components/MDBadge";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import MDTypography from "components/MDTypography";

const CronJobs = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [activeRole, setActiveRole] = useState(false);

  const rateList = [
    {
      id: 1,
      purpose: "payment",
      time: "12:00 AM",
      description: "description",
      title:"validation"
    },
    {
      id: 2,
      purpose: "payment",
      time: "01:00 AM",
      description: "description",
      title:"validation"
    },
    {
      id: 3,
      purpose: "payment",
      time: "02:00 AM",
      description: "description",
      title:"validation"
    },
    {
      id: 4,
      purpose: "payment",
      time: "03:00 AM",
      description: "description",
      title:"validation"
    },
    {
      id: 5,
      purpose: "payment",
      time: "04:00 AM",
      description: "description",
      title:"validation"
    }
  ];

  const columnsData = [
    {
      field: "id",
      headerName: "S.No",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row.id}
        </MDTypography>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.title}`}
        </MDTypography>
      ),
    },
    {
      field: "time",
      headerName: "Time of Trigger",
      width: 200,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.time}`}
        </MDTypography>
      ),
    },
    {
      field: "description",
      headerName: "description",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.description}`}
        </MDTypography>
      ),
    },
    {
      field: "purpose",
      headerName: "Purpose",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.purpose}`}
        </MDTypography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: ({ row }) => (
        <>
          <Stack direction="row" alignItems="center">
            <Switch
              checked={activeRole}
              onChange={() => setActiveRole(!activeRole)}
              title="Active / Deactive"
            />
             <IconButton color="secondary">
              <Icon fontSize="small" title="Edit">editable</Icon>
            </IconButton>
            <IconButton color="error">
              <Icon fontSize="small" title="Delete">delete</Icon>
            </IconButton>
          </Stack>
        </>
      ),
    },
  ];

  return (
    <>
      <MDDataGrid
        rows={rateList ?? []}
        columns={columnsData}
        getRowId={(row) => row.id}
        pagination
        page={page}
        pageSize={pageSize}
        paginationMode="server"
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        disableSelectionOnClick={true}
        components={{
          NoRowsOverlay: EmptyTableRowOverlay,
          LoadingOverlay: LinearProgress,
        }}
      />
    </>
  );
};

export default CronJobs;
