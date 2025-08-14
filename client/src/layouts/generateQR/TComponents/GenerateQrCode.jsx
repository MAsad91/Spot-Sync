import { Grid, DialogContent } from "@mui/material";
import MDBox from "components/MDBox";
import { useRef, useState } from "react";
import FormQrCustom from "./FormQrCustom";
import QrCard from "./QrCard";
import MDSnackbar from "components/MDSnackbar";
import MDDialog from "components/MDDialog";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import * as React from 'react';
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
function GenerateQrCode(props) {
  const { dialogOpen, onClose } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;

  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });
  const qrRef = useRef();
  const [state, setState] = useState({});
  const [url, setUrl] = useState(""),
    [shortUrl, setShortUrl] = useState(""),
    [title, setTitle] = useState(""),
    [qrColor, setQrColor] = useState("#1C1C1C"),
    [qrBgColor, setQrBgColor] = useState("#fff"),
    [qrStyle, setQrStyle] = useState("squares"),
    [customImg, setCustomImg] = useState(""),
    [noImg, setNoImg] = useState(false),
    [qrType, setQrType] = useState("web"),
    [mobile, setMobile] = useState(""),
    [message, setMessage] = useState("");
 const handleChange=(event)=>{
  setQrType(event.target.value)
 }
  const handleQrReset = () => {
    setUrl("");
    setShortUrl("");
    setTitle("");
    setState({});
    setQrStyle("squares");
    setQrColor("#1C1C1C");
    setQrBgColor("#2c7dfa");
    setCustomImg("");
    setNoImg(false);
    setQrType("web");
  };

  return (
    <>
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />
      <MDDialog
        dialogTitle="Generate QR Code"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="lg"
      >
        <DialogContent>
          <MDBox p={2}>
            <Grid container spacing={2}>
             {/* <Grid item xs={12} md={4} className="text-right">
                <FormControlLabel
                control={
                  <Radio
                  checked={qrType==="web"}
                  onChange={handleChange}
                  value="web"
                
                />
                }
                label="WEB QR"/>
                </Grid>
                <Grid item xs={12} md={4} className="text-right">
                <FormControlLabel
                control={
                  <Radio
                  checked={qrType==="sms"}
                  onChange={handleChange}
                  value="sms"/>

                }
                label="SMS QR"/>
                
              </Grid> */}
              <Grid item xs={12} md={6} lg={6}>
                <FormQrCustom
                  onClose={onClose}
                  title={title}
                  setTitle={setTitle}
                  qrRef={qrRef}
                  url={url}
                  setUrl={setUrl}
                  setShortUrl={setShortUrl}
                  mobile={mobile}
                  setMobile={setMobile}
                  message={message}
                  setMessage={setMessage}
                  qrColor={qrColor}
                  qrBgColor={qrBgColor}
                  qrStyle={qrStyle}
                  setQrStyle={setQrStyle}
                  noImg={noImg}
                  setQrColor={setQrColor}
                  setQrBgColor={setQrBgColor}
                  setCustomImg={setCustomImg}
                  setNoImg={setNoImg}
                  handleQrReset={handleQrReset}
                  state={state}
                  setState={setState}
                  qrType={qrType}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={6}>
                <QrCard
                  qrRef={qrRef}
                  url={url}
                  shortUrl={shortUrl}
                  mobile={mobile}
                  message={message}
                  qrColor={qrColor}
                  bgColor={qrBgColor}
                  qrStyle={qrStyle}
                  customImg={customImg}
                  noImg={noImg}
                  state={state}
                  qrType={qrType}
                />
              </Grid>
            </Grid>
          </MDBox>
        </DialogContent>
      </MDDialog>
    </>
  );
}

export default GenerateQrCode;
