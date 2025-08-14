import { useEffect, useState } from "react";
import InputPicker from "./InputPicker";
import InputFileImg from "./InputFileImg";
import MDBox from "components/MDBox";
import { Grid } from "@mui/material";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { generateRandomString } from "global/functions";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import { useDispatch } from "react-redux";
import { createQRCOde } from "store/slice/qrCode/qrCodeSlice";
import { getQRCodes } from "store/slice/qrCode/qrCodeSlice";
import SelectField from "./SelectField";
import { InputRange } from "./InputRange";
import MDTypography from "components/MDTypography";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Tooltip } from "@mui/material";
import InputField from "./InputField";
import { generateShortLink } from "global/functions";

function FormQrCustom({
  qrRef,
  url,
  shortUrl,
  qrColor,
  qrBgColor,
  qrStyle,
  setQrStyle,
  noImg,
  setUrl,
  setShortUrl,
  setQrColor,
  setQrBgColor,
  setCustomImg,
  setNoImg,
  handleQrReset,
  title,
  setTitle,
  onClose,
  state,
  setState,
  qrType,
  mobile,
  setMobile,
  message,
  setMessage,
}) {
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [customEye, setCustomEye] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (downloaded) {
      const msg = setTimeout(() => setDownloaded(false), 3500);
      return () => clearTimeout(msg);
    }
  }, [downloaded]);

  const handleQrCustom = (color) => setQrColor(color.hex),
    handleQrBgCustom = (color) => setQrBgColor(color.hex),
    handleQrStyle = (e) => {
      setQrStyle(e.target.value.toLowerCase());
    };

  const downloadQrCode = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    const qrCanvas = qrRef.current.querySelector("canvas"),
      qrImage = qrCanvas.toDataURL("image/png");
    const blob = await (await fetch(qrImage)).blob();
    const file = new File(
      [blob],
      `${qrType === "web" ? url : mobile}` +
        generateRandomString() +
        "_QrCode.png",
      {
        type: "image/png",
      }
    );

    const existingFiles = [];
    existingFiles.push(file);
    if (existingFiles && existingFiles.length) {
      const createObject = {
        type: qrType,
        mobile,
        message,
        title,
        url,
        shortUrl,
        qrCode: existingFiles,
      };
      await dispatch(createQRCOde(createObject))
        .unwrap()
        .then((res) => {
          console.log("response:", res);
          if (res?.success) {
            handleQrReset();
            setDownloaded(true);
            handleGetQRCodes();
            onClose();
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error:", err);
        });
    }
    handleQrReset();
    setDownloaded(true);
  };

  const handleGetQRCodes = async () => {
    await dispatch(getQRCodes())
      .unwrap()
      .then((res) => {
        if (res?.success) {
          console.log("success=>");
        }
      });
  };

  const handleChange = ({ target }) => {
    setState((prevState) => ({ ...prevState, [target.name]: target.value }));
  };

  const buildEyeRadiusInput = (id) => {
    return (
      <InputRange
        name={id}
        type="range"
        handleChange={handleChange}
        min={0}
        max={50}
        hideLabel
        defaultValue={state[id]}
      />
    );
  };

  return (
    <>
      <MDBox>
        <form onSubmit={downloadQrCode}>
          <Grid container spacing={2} className="">
            <Grid item xs={12}>
              <InputField type="title" value={title} handleChange={setTitle} />
            </Grid>

            {qrType === "web" ? (
              <Grid item xs={12}>
                <InputField
                  type="url"
                  value={url}
                  handleChange={(value) => {
                    setUrl(value)
                    setShortUrl(generateShortLink(true, 'REDIRECT'))
                  }} />{" "}
              </Grid>
            ) : (
              <>
                <Grid item xs={12}>
                  <InputField
                    type="mobile"
                    value={mobile}
                    handleChange={setMobile}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InputField
                    type="message"
                    value={message}
                    handleChange={setMessage}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <MDBox display="flex" gap={2}>
                <InputPicker
                  label={"Qr color"}
                  id={"qrColor"}
                  customColor={qrColor}
                  handleQrCustom={handleQrCustom}
                />
                <InputPicker
                  label={"background"}
                  id={"qrBgColor"}
                  customColor={qrBgColor}
                  handleQrCustom={handleQrBgCustom}
                />
                <SelectField
                  name="qrStyle"
                  options={["Squares", "Dots"]}
                  value={qrStyle}
                  handleQrCustom={handleQrStyle}
                />
                <Tooltip title={`Customize eye`} placement="top">
                  <MDButton
                    color={sidenavColor}
                    variant="contained"
                    onClick={() => setCustomEye(!customEye)}
                  >
                    <RemoveRedEyeIcon />
                  </MDButton>
                </Tooltip>
              </MDBox>
            </Grid>
            <Grid item xs={12}></Grid>

            <Grid item xs={12}>
              <InputFileImg
                noImg={noImg}
                setNoImg={setNoImg}
                setCustomImg={setCustomImg}
              />
            </Grid>
            {customEye && (
              <>
                <Grid item xs={12}>
                  <MDBox>
                    <MDBox display="flex" flexDirection="row" gap={2}>
                      <MDBox>
                        <MDTypography style={{ fontSize: 14 }}>
                          Top left eye
                        </MDTypography>
                        <MDTypography variant="caption">Outer</MDTypography>
                        {buildEyeRadiusInput("eyeradius_0_outer_0")}
                        {buildEyeRadiusInput("eyeradius_0_outer_1")}
                        {buildEyeRadiusInput("eyeradius_0_outer_2")}
                        {buildEyeRadiusInput("eyeradius_0_outer_3")}
                        <MDTypography variant="caption">Inner</MDTypography>
                        {buildEyeRadiusInput("eyeradius_0_inner_0")}
                        {buildEyeRadiusInput("eyeradius_0_inner_1")}
                        {buildEyeRadiusInput("eyeradius_0_inner_2")}
                        {buildEyeRadiusInput("eyeradius_0_inner_3")}
                      </MDBox>
                      <MDBox>
                        <MDTypography style={{ fontSize: 14 }}>
                          Top right eye
                        </MDTypography>
                        <MDTypography variant="caption">Outer</MDTypography>
                        {buildEyeRadiusInput("eyeradius_1_outer_0")}
                        {buildEyeRadiusInput("eyeradius_1_outer_1")}
                        {buildEyeRadiusInput("eyeradius_1_outer_2")}
                        {buildEyeRadiusInput("eyeradius_1_outer_3")}
                        <MDTypography variant="caption">Inner</MDTypography>
                        {buildEyeRadiusInput("eyeradius_1_inner_0")}
                        {buildEyeRadiusInput("eyeradius_1_inner_1")}
                        {buildEyeRadiusInput("eyeradius_1_inner_2")}
                        {buildEyeRadiusInput("eyeradius_1_inner_3")}
                      </MDBox>
                      <MDBox>
                        <MDTypography style={{ fontSize: 14 }}>
                          Bottom left eye
                        </MDTypography>
                        <MDTypography variant="caption">Outer</MDTypography>
                        {buildEyeRadiusInput("eyeradius_2_outer_0")}
                        {buildEyeRadiusInput("eyeradius_2_outer_1")}
                        {buildEyeRadiusInput("eyeradius_2_outer_2")}
                        {buildEyeRadiusInput("eyeradius_2_outer_3")}
                        <MDTypography variant="caption">Inner</MDTypography>
                        {buildEyeRadiusInput("eyeradius_2_inner_0")}
                        {buildEyeRadiusInput("eyeradius_2_inner_1")}
                        {buildEyeRadiusInput("eyeradius_2_inner_2")}
                        {buildEyeRadiusInput("eyeradius_2_inner_3")}
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </Grid>
                <Grid item xs={12}>
                  <MDBox>
                    <MDBox display="flex" flexDirection="row" gap={2}>
                      <MDBox>
                        <MDTypography variant="subtitle2" fontWeight="regular">
                          Top Left
                        </MDTypography>
                        <MDTypography variant="caption">Outer</MDTypography>
                        <InputRange
                          name="eyecolor_0_outer"
                          type="color"
                          defaultValue={state.fgColor ?? "#000000"}
                          handleChange={handleChange}
                          hideLabel={true}
                        />
                        <MDTypography variant="caption">Inner</MDTypography>
                        <InputRange
                          name="eyecolor_0_inner"
                          type="color"
                          defaultValue={state.fgColor ?? "#000000"}
                          handleChange={handleChange}
                          hideLabel={true}
                        />
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="subtitle2" fontWeight="regular">
                          Top Right
                        </MDTypography>
                        <MDTypography variant="caption">Outer</MDTypography>
                        <InputRange
                          name="eyecolor_1_outer"
                          type="color"
                          defaultValue={state.fgColor ?? "#000000"}
                          handleChange={handleChange}
                          hideLabel={true}
                        />
                        <MDTypography variant="caption">Inner</MDTypography>
                        <InputRange
                          name="eyecolor_1_inner"
                          type="color"
                          defaultValue={state.fgColor ?? "#000000"}
                          handleChange={handleChange}
                          hideLabel={true}
                        />
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="subtitle2" fontWeight="regular">
                          Bottom Left
                        </MDTypography>
                        <MDTypography variant="caption">Outer</MDTypography>
                        <InputRange
                          name="eyecolor_2_outer"
                          type="color"
                          defaultValue={state.fgColor ?? "#000000"}
                          handleChange={handleChange}
                          hideLabel={true}
                        />
                        <MDTypography variant="caption">Inner</MDTypography>
                        <InputRange
                          name="eyecolor_2_inner"
                          type="color"
                          defaultValue={state.fgColor ?? "#000000"}
                          handleChange={handleChange}
                          hideLabel={true}
                        />
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </Grid>
              </>
            )}

            <Grid item xs={12} className="text-right">
              <MDButton variant="contained" color={sidenavColor} type="submit">
                Save
              </MDButton>
            </Grid>
          </Grid>
        </form>
      </MDBox>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Downloading Barcode.. "
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
    </>
  );
}

export default FormQrCustom;
