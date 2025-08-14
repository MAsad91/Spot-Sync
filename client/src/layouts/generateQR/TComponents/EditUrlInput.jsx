import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDTypography from "components/MDTypography";
import React from "react";
import { DialogContent, Grid } from "@mui/material";
import { useMaterialUIController } from "context";
import InputField from "layouts/generateQR/TComponents/InputField";

const EditUrlInput = (props) => {
  const { dialogOpen, onClose, handelClick, url, setUrl } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  return (
    <>
      <MDDialog
        dialogTitle="Edit QR destination!"
        open={dialogOpen}
        dialogClose={onClose}
        // closeIcon={true}
        maxWidth="lg"
      >
        <DialogContent sx={{ mt: 1, mb: 2 }} >
          <Grid container direction="column" spacing={1} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <InputField
                type="url"
                value={url}
                handleChange={(value) => {
                  setUrl(value)
                }}
              />
            </Grid>
            <Grid item sx={{ display: "flex", justifyContent: "flex-end" }}>
              <MDButton
                variant="contained"
                onClick={onClose}
              >
                Cancel
              </MDButton>
              <MDButton
                color={sidenavColor}
                variant="contained"
                type="submit"
                onClick={handelClick}
              >
                Confirm
              </MDButton>
            </Grid>
          </Grid>
        </DialogContent>
      </MDDialog>
    </>
  );
};

export default EditUrlInput;
