import { Button, Dialog, DialogContent } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const PendingMessageDialog = (props) => {
  const { dialogOpen, onClose, licensePlateState } = props;
  return (
    <>
      <Dialog open={dialogOpen} onClose={onClose}>
        <DialogContent>
          <MDTypography variant="subtitle2">
            {`${
              licensePlateState === "pending"
                ? "It is subject to approval."
                : licensePlateState === "decline"
                ? "Your request has been declined!"
                : licensePlateState === "refunded"
                ? "This license plate number has been refunded!"
                : ""
            } `}
          </MDTypography>
          <MDBox display="flex" justifyContent="end">
            <Button onClick={onClose}>OK</Button>
          </MDBox>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingMessageDialog;
