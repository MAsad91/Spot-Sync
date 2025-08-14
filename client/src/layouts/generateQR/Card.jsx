import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import PublicIcon from "@mui/icons-material/Public";
import SmsIcon from "@mui/icons-material/Sms";
import { get, upperCase } from "lodash";
import MDButton from "components/MDButton";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import CallIcon from "@mui/icons-material/Call";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import DeleteDialog from "components/UIComponents/DeleteDialog";
import CircularIndeterminate from "components/MDLoading";
import EditUrlInput from "./TComponents/EditUrlInput";
import { useMaterialUIController } from "context";
import { useDispatch, useSelector } from "react-redux";
import { deleteQRCode, updateQRCodeURL } from "store/slice/qrCode/qrCodeSlice";
import { Icon } from "@mui/material";
import { generateRandomString } from "global/functions";
import { Label } from "@mui/icons-material";
import Chip from "@mui/material/Chip";

const QRCodeCard = (props) => {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const { darkMode } = controller;
  console.log(darkMode);
  const roleModule = useSelector((state) => state.users?.meInfo?.roleId?.modules);
  const { item, updateParentData } = props;
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeId, setQrCodeId] = useState("");
  const [url, setUrl] = useState("");
   const handleDownload = (bucketUrl) => {
    const fileName = generateRandomString();
    const anchor = document.createElement("a");
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.href = bucketUrl;
    anchor.download = fileName;
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleDeleteQR = () => {
    setLoading(true);
    dispatch(deleteQRCode({ qrCodeId }))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          updateParentData();
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error deleting QR code:", err);
      });
  };

  const handleUpdateQRCodeURL = () => {
    setLoading(true);
    dispatch(updateQRCodeURL({ id: qrCodeId, url }))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          updateParentData();
          setLoading(false);
          setEditDialogOpen(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        setEditDialogOpen(false);
        console.error("Error updating QR code URL:", err);
      });
  };

  return (
    <Card className="position-relative">
      <Chip
        variant="ghost"
        color="secondary"
        className="position-absolute top-0 right-0 rounded-1 p-2"
        sx={{ fontSize: "16px" }}
        icon={item.type === "web" ? <PublicIcon /> : <SmsIcon />}
      />

      <Box>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2} lg={3}>
              <Avatar
                sx={{
                  height: "120px",
                  width: "120px",
                  backgroundColor: "primary.lighter",
                  color: "primary.main",
                }}
                variant="rounded"
                alt={upperCase(get(item, "title", "U"))}
                src={get(item, "qrCodeImage", "")}
              />
            </Grid>

            <Grid item xs={12} md={10} lg={9}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h5">{get(item, "title", "")}</Typography>
                  <Icon fontSize="small">
                    {item.type === "web" ? <PublicIcon color="text"/> : <SmsIcon color="text" />}
                  </Icon>
                </Stack>
                <Typography
                  component="p"
                  variant="caption"
                  color={darkMode ? "#ffffff" : "#1c1c1c"}

                >
                  {item.type === "web" ? (
                    <>
                      <LinkIcon color="text" /> {get(item, "url", "")} 
                    </>
                  ) : (
                    <>
                      <CallIcon color="text" /> {get(item, "mobile", "")}
                    </>
                  )}
                </Typography>
                {item.type === "sms" && (
                  <Typography
                    component="p"
                    variant="caption"
                     color={darkMode ? "#ffffff" : "#1c1c1c"}

                  >
                    <SmsIcon color="text"/> {get(item, "message", "")}
                  </Typography>
                )}

                <MDButton
                  variant="gradient"
                  fontSize="small"
                  color={sidenavColor}
                  onClick={() => {
                    handleDownload(item.qrCodeImage);
                  }}
                >
                  <DownloadIcon />
                </MDButton>
                {roleModule?.QRCode_delete &&
                <MDButton
                  variant="gradient"
                  fontSize="small"
                  color={sidenavColor}
                  sx={{ margin: "10px" }}
                  onClick={() => {
                    setQrCodeId(item._id);
                    setDialogOpen(true);
                  }}
                >
                  <DeleteIcon />
                </MDButton>
                }
                {roleModule?.QRCode_update &&
                <MDButton
                  variant="gradient"
                  fontSize="small"
                  color={sidenavColor}
                  onClick={() => {
                    setQrCodeId(item._id);
                    setUrl(item?.url);
                    setEditDialogOpen(true);
                  }}
                >
                  <EditIcon />
                </MDButton>
                }
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Box>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Please wait.. "
        open={loading}
      />
      <DeleteDialog
        dialogOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        handelClick={() => handleDeleteQR(qrCodeId)}
      />
      <EditUrlInput
        dialogOpen={editDialogOpen}
        setUrl={setUrl}
        url={url}
        onClose={() => {
          setEditDialogOpen(false);
        }}
        handelClick={() => handleUpdateQRCodeURL()}
      />
    </Card>
  );
};

export default QRCodeCard;
