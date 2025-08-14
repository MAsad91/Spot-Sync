import { LinearProgress } from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import MDTypography from "components/MDTypography";
import { isEmpty } from "lodash";
import MDBox from "components/MDBox";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import { useState } from "react";
import { dateToShow } from "global/functions";
import { centsToDollars } from "global/functions";


const SubscriptionSummaryTable = (props) => {
  const { summaryList, isLoading, activeTab } = props;

  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const columnsData = [
    {
      field: "date",
      headerName: "Date",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {dateToShow(row.createdAt)}
        </MDTypography>
      ),
    },
    {
      field: "subscriptionNumber",
      headerName: "Subscription ID",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <>
          <MDTypography
            display="block"
            variant="caption"
            sx={{ color: "black.light" }}
          >
            {` ${row?.subscriptionId?.subscriptionNumber || "-"}`}
          </MDTypography>
        </>
      ),
    },
    {
      field: "firstName",
      headerName: "Customer name",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <>
          <MDTypography
            display="block"
            variant="caption"
            sx={{ color: "black.light" }}
          >
            {row?.customerId?.firstName
              ? `${row?.customerId?.firstName} ${row?.customerId?.lastName}`
              : "-"}
          </MDTypography>
        </>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row?.customerId?.email || "-"}`}
        </MDTypography>
      ),
    },
    {
      field: "mobile",
      headerName: "Cell No.",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row?.customerId?.mobile || "-"}`}
        </MDTypography>
      ),
    },
    {
      field: "Amount",
      headerName: "Amount",
      width: 180,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >

          {`$${centsToDollars(row?.totalAmount) || "-"}`}

        </MDTypography>
      ),
    },
    {
      field: activeTab === "failed" ? "reason" : "isClientFault",
      headerName: activeTab === "failed" ? "Reason" : "Is Client Fault",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {activeTab === "failed" ? row?.paymentInfo?.message || "-" : row?.isClientFault ? 'True' : 'False'}

        </MDTypography>
      ),
    },
  ];

  const getRowClassName = (params) => {
    return params.row.licensePlateGetUpdated ? "updateAvailable" : "";
  };

  return (
    <>
      <MDBox mt={2}>
        <MDDataGrid
          rows={!isEmpty(summaryList) ? summaryList : []}
          columns={columnsData}
          getRowId={(row) => row?._id}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          loading={isLoading}
          components={{
            NoRowsOverlay: EmptyTableRowOverlay,
            LoadingOverlay: LinearProgress,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          autoHeight
          getRowClassName={getRowClassName}
        />
      </MDBox>
    </>
  );
};

export default SubscriptionSummaryTable;
