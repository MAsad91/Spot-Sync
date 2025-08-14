import MDBox from "components/MDBox";
import { QRCode } from "react-qrcode-logo";
import { Grid } from "@mui/material";

function QrCard({
  qrRef,
  url,
  bgColor,
  qrColor,
  customImg,
  noImg,
  qrStyle,
  state,
  qrType,
  mobile,
  message,
}) {
  let imgCustom = undefined;

  noImg
    ? (imgCustom = null)
    : customImg
    ? (imgCustom = customImg)
    : (imgCustom = "./logo-apple-icon192.png");

  const qrValue =
    qrType === "sms"
      ? `SMSTO:${mobile}:${message}`
      : qrType === "web"
      ? url
      : "";

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <MDBox
            p={2}
            sx={{
              borderRadius: "31px",
              background: "#e0e0e0",
             // boxShadow: "17px 17px 27px #bebebe, -17px -17px 27px #ffffff",
             boxShadow:"2"
            }}
            display="flex"
            justifyContent="center"
            alignItems="center"
            ref={qrRef}
            style={{ backgroundColor: bgColor }}
          >
            <QRCode
              logoOnLoad={() => console.log("logo loaded")}
              logoImage={imgCustom}
              logoWidth={45}
              logoHeight={45}
              removeQrCodeBehindLogo={true}
              logoPadding={5}
              logoPaddingStyle="square"
              size={430}
              value={qrValue}
              bgColor={bgColor}
              fgColor={qrColor}
              qrStyle={qrStyle}
              ecLevel="H"
              includeMargin
              eyeRadius={[
                {
                  outer: [
                    state.eyeradius_0_outer_0,
                    state.eyeradius_0_outer_1,
                    state.eyeradius_0_outer_2,
                    state.eyeradius_0_outer_3,
                  ],
                  inner: [
                    state.eyeradius_0_inner_0,
                    state.eyeradius_0_inner_1,
                    state.eyeradius_0_inner_2,
                    state.eyeradius_0_inner_3,
                  ],
                },
                {
                  outer: [
                    state.eyeradius_1_outer_0,
                    state.eyeradius_1_outer_1,
                    state.eyeradius_1_outer_2,
                    state.eyeradius_1_outer_3,
                  ],
                  inner: [
                    state.eyeradius_1_inner_0,
                    state.eyeradius_1_inner_1,
                    state.eyeradius_1_inner_2,
                    state.eyeradius_1_inner_3,
                  ],
                },
                {
                  outer: [
                    state.eyeradius_2_outer_0,
                    state.eyeradius_2_outer_1,
                    state.eyeradius_2_outer_2,
                    state.eyeradius_2_outer_3,
                  ],
                  inner: [
                    state.eyeradius_2_inner_0,
                    state.eyeradius_2_inner_1,
                    state.eyeradius_2_inner_2,
                    state.eyeradius_2_inner_3,
                  ],
                },
              ]}
              eyeColor={[
                {
                  outer: state.eyecolor_0_outer ?? state.qrColor ?? "#000000",
                  inner: state.eyecolor_0_inner ?? state.qrColor ?? "#000000",
                },
                {
                  outer: state.eyecolor_1_outer ?? state.qrColor ?? "#000000",
                  inner: state.eyecolor_1_inner ?? state.qrColor ?? "#000000",
                },
                {
                  outer: state.eyecolor_2_outer ?? state.qrColor ?? "#000000",
                  inner: state.eyecolor_2_inner ?? state.qrColor ?? "#000000",
                },
              ]}
            />
          </MDBox>
        </Grid>
      </Grid>
    </>
  );
}

export default QrCard;
