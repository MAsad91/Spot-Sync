import { useState } from "react";
import { DialogContent, Grid } from "@mui/material";
import MDButton from "components/MDButton";
import { useDispatch } from "react-redux";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import { Formik } from "formik";
import { useMaterialUIController } from "context";
import CircularIndeterminate from "components/MDLoading";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import {
  updateLicensePlate,
  getSubscriptionDetail,
} from "store/slice/subscriptions/subscriptionSlice";
import { EditLicensePlateValidationSchema } from "services/validation";
import { editLicensePlate } from "store/slice/subscriptions/subscriptionSlice";

const LicensePlateEditDialog = (props) => {
  const dispatch = useDispatch();
  const {
    dialogOpen,
    onClose,
    licensePlateData,
    subscriptionId,
    setNotification,
  } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateLicensePlate = async (payload) => {
    try {
      setIsLoading(true);
      const res = await dispatch(
        editLicensePlate({ subscriptionId, ...payload })
      ).unwrap();
      const success = res?.success;
      if (success) {
        await dispatch(getSubscriptionDetail(subscriptionId));
        onClose();
      }
      setNotification({
        color: success ? "success" : "error",
        title: success ? "Success" : "Error",
        content: res?.message,
        icon: success ? "check" : "warning",
        show: true,
      });
    } catch (err) {
      console.error("Error updating license plate:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MDDialog
        dialogTitle="Edit License Plate"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              _id: licensePlateData?._id,
              licensePlateNumber: licensePlateData?.licensePlateNumber || "",
              assignName: licensePlateData?.assignName || "",
              price: licensePlateData?.price / 100 || "",
            }}
            validationSchema={EditLicensePlateValidationSchema}
            onSubmit={(value, action) => {
              console.log("values ---->", value);
              handleUpdateLicensePlate({
                licensePlate: value,
              });
            }}
          >
            {({
              values,
              handleChange,
              handleBlur,
              handleSubmit,
              errors,
              touched,
              dirty,
              isValid,
            }) => (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12} md={4}>
                    <MDInput
                      label="License Plate"
                      name="licensePlateNumber"
                      value={values.licensePlateNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(
                        touched.licensePlateNumber && errors.licensePlateNumber
                      )}
                      helperText={
                        touched.licensePlateNumber && errors.licensePlateNumber
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <MDInput
                      label="Assigned Name (Optional)"
                      name="assignName"
                      value={values.assignName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDInput
                      label="Price"
                      name="price"
                      value={values.price}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.price && errors.price)}
                      helperText={touched.price && errors.price}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDBox display="flex" justifyContent="end">
                      <MDButton
                        color={sidenavColor}
                        variant="contained"
                        type="submit"
                        disabled={!dirty || !isValid}
                      >
                        Submit
                      </MDButton>
                    </MDBox>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
          <CircularIndeterminate
            type="full"
            size={20}
            text="Updating License Plate.. "
            open={isLoading}
          />
        </DialogContent>
      </MDDialog>
    </>
  );
};

export default LicensePlateEditDialog;
