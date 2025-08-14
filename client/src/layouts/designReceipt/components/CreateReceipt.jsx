import { useState } from "react";
import { DialogContent, Grid } from "@mui/material";
import MDButton from "components/MDButton";
import { useDispatch } from "react-redux";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import { Formik } from "formik";
import { useMaterialUIController } from "context";
import CircularIndeterminate from "components/MDLoading";
import RichTextEditor from "components/UIComponents/RichTextEditor/RichTextEditor";
import * as Yup from "yup";
import { createDesignReceipt } from "store/slice/designRecipts/designReceiptSlice";

const CreateReceipt = (props) => {
  const dispatch = useDispatch();
  const { dialogOpen, onClose } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handleCreateReceipt = (data) => {
    setIsLoading(true);
    dispatch(createDesignReceipt(data))
      .unwrap()
      .then((res) => {
        const success = res?.success;
        setIsLoading(false);
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        if (success) {
          onClose();
        }
      })
      .catch((err) => {
        console.error("Error creating brand:", err);
        setIsLoading(false);
        setNotification({
          ...notification,
          color: "error",
          title: "Error",
          content: err?.message,
          icon: "warning",
          show: true,
        });
      });
  };
  const createReceiptValidationSchema = Yup.object().shape({
    content: Yup.string().required(),
  });

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Creating receipt.. "
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
      <MDDialog
        dialogTitle="Create Receipt"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              content: "",
              isEmailTemplate: true,
            }}
            validationSchema={createReceiptValidationSchema}
            onSubmit={(value, action) => {
              handleCreateReceipt(value);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <RichTextEditor
                      name="content"
                      value={props.values.content}
                      setFieldValue={props.setFieldValue}
                      error={props.errors.content}
                      helperText={props.errors.content}
                    />
                  </Grid>

                  <Grid item xs={12} className="text-right">
                    <MDButton
                      color={sidenavColor}
                      variant="contained"
                      type="submit"
                    >
                      Create
                    </MDButton>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </DialogContent>
      </MDDialog>
    </>
  );
};

export default CreateReceipt;
