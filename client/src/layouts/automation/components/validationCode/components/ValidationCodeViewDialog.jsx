import MDDialog from "components/MDDialog";
import React from "react";
import { DialogContent } from "@mui/material";
import MDTypography from "components/MDTypography";
const ValidationCodeDialog = (props) => {
  const { dialogOpen, onClose, validationCode } = props;
  return (
    <>
      <MDDialog
        dialogTitle="All Validation Codes"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <div>
               <MDTypography
               display="block"
               variant="caption"
               sx={{ color: "black.light", whiteSpace: "pre-wrap", }}
             >
     
               {validationCode?.join(", ") ?? "N/A"}
             </MDTypography>
          </div>
        </DialogContent>
      </MDDialog>
    </>
  );
};

export default ValidationCodeDialog;
