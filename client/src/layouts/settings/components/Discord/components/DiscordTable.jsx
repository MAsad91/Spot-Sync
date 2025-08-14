import { Icon, IconButton, LinearProgress, Stack, Switch } from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import { useState } from "react";
import { useDispatch } from "react-redux";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import MDTypography from "components/MDTypography";
import { useLocation } from "react-router-dom";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import { deleteDiscord, updateDiscord } from "store/slice/discord/discordSlice";

const DiscordTable = (props) => {
  const { discordData, updateParentData } = props;
  const dispatch = useDispatch();
  const location = useLocation();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [toggleLoading, setToggleLoading] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [discordId, setDiscordId] = useState("");

  let placeId = new URLSearchParams(location?.search).get("placeId");
  if (!placeId) {
    placeId = localStorage.getItem("placeId");
  }
  const handelDelete = () => {
    console.log("clicked");
    dispatch(deleteDiscord({ discordId }))
      .unwrap()
      .then(async (res) => {
        console.log("delete response:", res);
        if (res?.success) {
          updateParentData();
          setDialogOpen(false);
        }
      })
      .catch((err) => {
        console.error("Error getting brand:", err);
      });
  };

  const handleUpdateDiscord = (discordId, type) => {
    setToggleLoading(discordId);
    dispatch(updateDiscord({ placeId, discordId, type }))
      .unwrap()
      .then((res) => {
        console.log("slack response:", res);
        if (res?.success) {
          updateParentData();
        }
      })
      .catch((err) => {
        console.error("Error places:", err);
      })
      .finally(() => setToggleLoading(null));
  };

  const columnsData = [
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
      field: "channelName",
      headerName: "Channel Name",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.channelName}`}
        </MDTypography>
      ),
    },
    {
      field: "workSpace",
      headerName: "Work Space",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.workSpace}`}
        </MDTypography>
      ),
    },
    {
      field: "webhookurl",
      headerName: "Webhook URL",
      width: 350,
      editable: false,
      renderCell: ({ row }) => (
        <div className="rowscroll">
          <MDTypography
            display="block"
            variant="caption"
            sx={{ color: "black.light" }}
          >
            {` ${row.webhookURL}`}
          </MDTypography>
        </div>
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
              disabled={toggleLoading === row._id}
              checked={row?.status === 10}
              onChange={() =>
                handleUpdateDiscord(
                  row?._id,
                  row?.status === 10 ? "INACTIVE" : "ACTIVE"
                )
              }
            />
            <IconButton
              onClick={() => {
                setDialogOpen(true);
                setDiscordId(row._id);
              }}
              color="error"
            >
              <Icon fontSize="small" title="Delete">
                delete
              </Icon>
            </IconButton>
          </Stack>
        </>
      ),
    },
  ];

  return (
    <>
      <MDDataGrid
        rows={discordData ?? []}
        columns={columnsData}
        getRowId={(row) => row._id}
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
      <DeleteDialog
        dialogOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        handelClick={handelDelete}
      />
    </>
  );
};

export default DiscordTable;
