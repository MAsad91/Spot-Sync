import React, { useRef, useState } from "react";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MDBox from "components/MDBox";
import { Checkbox, Grid } from "@mui/material";
import MDTypography from "components/MDTypography";

function InputFileImg({ noImg, setNoImg, setCustomImg }) {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [selectedFileName, setSelectedFileName] = useState("");

  const inputRef = useRef(null);

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleImage = (e) => {
    const reader = new FileReader();
    const selectedFile = e.target.files[0];

    reader.onload = () => {
      if (reader.readyState === 2) {
        setCustomImg(reader.result);
        setSelectedFileName(selectedFile.name);
      }
    };
    reader.readAsDataURL(selectedFile);
  };
  return (
    <>
      <Grid container>
        <Grid item xs={12} sm={5}>
          <MDButton
            onClick={handleButtonClick}
            variant="contained"
            color={sidenavColor}
            startIcon={<CloudUploadIcon />}
            disabled={noImg}
          >
            Choose Image
          </MDButton>
          <input
            ref={inputRef}
            id="file"
            name="file"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImage}
            style={{ display: "none" }}
            disabled={noImg}
          />
        </Grid>
        <Grid item xs={12} sm={7}>
          <MDBox display="flex" alignItems="center" ml={-1}>
            <Checkbox
              id="noImg"
              name="noImg"
              value={noImg}
              checked={noImg}
              onClick={() => setNoImg(!noImg)}
              inputProps={{ "aria-label": "controlled" }}
            />
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;&nbsp;Without Image&nbsp;
            </MDTypography>
          </MDBox>
        </Grid>
        <Grid item xs={12}>
          {selectedFileName && !noImg && (
            <MDBox mt={1}>
              <MDTypography fontWeight="regular" variant="body2" color="text">
                {selectedFileName}
              </MDTypography>
            </MDBox>
          )}
        </Grid>
      </Grid>
    </>
  );
}

export default InputFileImg;
