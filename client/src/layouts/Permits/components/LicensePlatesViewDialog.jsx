import MDDialog from "components/MDDialog";
import React from "react";
import { DialogContent } from "@mui/material";
import { useMaterialUIController } from "context";
import MDBadge from "components/MDBadge";

const LicensePlatesDialog = (props) => {
  const { dialogOpen, onClose, licensePlates } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  return (
    <>
      <MDDialog
        dialogTitle="All License Plates"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <div>
            {licensePlates.map((plate) => (
              <MDBadge
                key={plate}
                badgeContent={plate}
                color={sidenavColor}
                variant="gradient"
                size="sm"
                max={9999999999}
                sx={{ marginRight: 1 }}
              />
            ))}
          </div>
        </DialogContent>
      </MDDialog>
    </>
  );
};

export default LicensePlatesDialog;
