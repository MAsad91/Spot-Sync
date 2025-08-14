import React from "react";
import MDDialog from "components/MDDialog";
import { DialogContent } from "@mui/material";
import ReactJson from "react-json-view";
import { isEmpty } from "lodash";
import NoDataOverlay from "components/Common/NoDataOverlay";

const PaymentFailedInfoDialog = (props) => {
  const { dialogOpen, onClose, data } = props;

  return (
    <MDDialog
      dialogTitle="Payment Information"
      open={dialogOpen}
      dialogClose={onClose}
      closeIcon={true}
      maxWidth="sm"
    >
      <DialogContent>
        {isEmpty(data.paymentInfo) ? (
          <NoDataOverlay />
        ) : (
          <ReactJson src={data.paymentInfo} theme="monokai" collapsed={false} />
        )}
      </DialogContent>
    </MDDialog>
  );
};

export default PaymentFailedInfoDialog;
