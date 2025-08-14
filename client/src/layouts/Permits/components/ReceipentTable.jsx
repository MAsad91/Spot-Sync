import { Icon, IconButton, LinearProgress, Stack } from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import { useState } from "react";
import MDBadge from "components/MDBadge";
import MDSnackbar from "components/MDSnackbar";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import MDTypography from "components/MDTypography";
import { getStatusInfo } from "global/functions";
import CircularIndeterminate from "components/MDLoading";
import { capitalizeAndReplace } from "global/functions";
import { useDispatch } from "react-redux";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import { deleteAutomatedReport } from "store/slice/automatedReports/automatedSlice";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import AddReceipent from "./AddReceipent";
import { useSelector } from "react-redux";

const ReceipentTable = (props) => {
    const { receipentData, updateParentData } = props;
    const dispatch = useDispatch();
    const [controller] = useMaterialUIController();
    const { sidenavColor } = controller;
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [reportId, setReportId] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addReceipentDialog, setAddReceipentDialog] = useState(false)
    const selectedPlace = useSelector((state) => state.places?.selectedPlace);

    const [notification, setNotification] = useState({
        color: "",
        icon: "",
        title: "",
        content: "",
        show: false,
        close: () => setNotification({ ...notification, show: false }),
    });

    let placeId = selectedPlace?._id;
    const tz = selectedPlace?.timeZoneId || "America/Los_Angeles";
    if (!placeId) {
        placeId = localStorage.getItem("placeId");
    }
    const filteredReceipents = receipentData.filter(receipent => receipent.isPermit === true);

    const handelDelete = () => {
        setIsLoading(true);
        dispatch(deleteAutomatedReport(reportId))
            .unwrap()
            .then(async (res) => {
                const success = res?.success;
                setIsLoading(false);
                setNotification({
                    ...notification,
                    color: success ? "success" : "error",
                    title: success ? "Success" : "Error",
                    content: res?.message,
                    icon: success ? "check" : "warning",
                    show: true,
                });
                if (success) {
                    updateParentData();
                    setDialogOpen(false);
                }
            })
            .catch((err) => {
                setIsLoading(false);
                setNotification({
                    ...notification,
                    color: "error",
                    title: "Error",
                    content: err?.message,
                    icon: "warning",
                    show: true,
                });
            });
    };

    const columnsData = [
        {
            field: "toEmail",
            headerName: "To Email",
            width: 200,
            editable: false,
            renderCell: ({ row }) => (
                <MDTypography
                    display="block"
                    variant="caption"
                    sx={{ color: "black.light" }}
                >
                    {row?.toEmail ?? "N/A"}
                </MDTypography>
            ),
        },
        {
            field: "ccEmails",
            headerName: "CC Emails",
            width: 200,
            editable: false,
            renderCell: ({ row }) => (
                <MDTypography
                    display="block"
                    variant="caption"
                    sx={{
                        color: "black.light",
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    {row?.ccEmails?.join(", ")}
                </MDTypography>
            ),
        },
        {
            field: "status",
            headerName: "Status",
            width: 120,
            editable: false,
            renderCell: ({ row }) => {
                return (
                    <MDBadge
                        badgeContent={getStatusInfo(row?.status, "text")}
                        color={getStatusInfo(row?.status, "color")}
                        variant="gradient"
                        size="sm"
                    />
                );
            },
        },

        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: ({ row }) => (
                <>
                    <Stack direction="row" alignItems="center">
                        <IconButton
                            onClick={() => {
                                setDialogOpen(true);
                                setReportId(row._id);
                            }}
                            color="error"
                        >
                            <Icon fontSize="small">delete</Icon>
                        </IconButton>
                    </Stack>
                </>
            ),
        },
    ];

    return (
        <>
            <CircularIndeterminate
                type="full"
                size={20}
                text="Deleting Receipent.. "
                open={isLoading}
            />
            <MDSnackbar
                color={notification.color}
                icon={notification.icon}
                title={notification.title}
                content={notification.content}
                open={notification.show}
                close={notification.close}
                bgWhite
            />
            <MDBox display="flex" justifyContent="end" mb={1}>
                <MDButton
                    variant="contained"
                    size="small"
                    color={sidenavColor}
                    onClick={() => {
                        setAddReceipentDialog(true);
                    }}
                >
                    Add Receipent
                </MDButton>
            </MDBox>
            <MDDataGrid
                rows={filteredReceipents ?? []}
                columns={columnsData}
                getRowId={(row) => row?._id}
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
                onClose={() => setDialogOpen(false)}
                handelClick={handelDelete}
            />
            <AddReceipent
                placeId={placeId}
                dialogOpen={addReceipentDialog}
                onClose={() => setAddReceipentDialog(false)}
                updateParentData={updateParentData}
            />
        </>
    );
};

export default ReceipentTable;
