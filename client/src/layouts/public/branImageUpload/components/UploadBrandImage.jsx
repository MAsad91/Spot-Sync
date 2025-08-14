import { useState } from "react";
import { Grid, Stack } from "@mui/material";
import MDButton from "components/MDButton";
import { useDispatch } from "react-redux";
import FileUploader from "components/MDFileUploader";
import MDSnackbar from "components/MDSnackbar";
import { Formik } from "formik";
import { uploadImageValidationSchema } from "services/validation";
import { useMaterialUIController } from "context";
import CircularIndeterminate from "components/MDLoading";
import MDBox from "components/MDBox";
import { imageUploadBrandPublic } from "store/slice/public/publicSlice";

const UploadBrandImage = (props) => {
  const dispatch = useDispatch();
  const { brandId, isSignUp } = props;
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

  const handleUploadBrandImage = (brandData) => {
    setIsLoading(true);
    dispatch(imageUploadBrandPublic(brandData))
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
          if (typeof window.postMessage !== "undefined") {
            const responseObj = {
              eventData: { brandLogo: res.brandLogo },
              eventName: isSignUp ? "signupSuccess" : "brand-onboarding-success",
            };
            window.parent.postMessage(responseObj, "*");
          }
        } else {
          if (typeof window.postMessage !== "undefined") {
            const responseObj = {
              eventData: { message: res.message },
              eventName: "error",
            };
            window.parent.postMessage(responseObj, "*");
          }
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
  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Uploading brand image.. "
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
      <MDBox>
        <Formik
          initialValues={{
            brandLogo: [],
          }}
          validationSchema={uploadImageValidationSchema}
          onSubmit={(value, action) => {
            const payload = {
              brandLogo: value.brandLogo,
              brandId,
            };
            handleUploadBrandImage(payload);
          }}
        >
          {(props) => (
            <form onSubmit={props.handleSubmit}>
              <Grid container spacing={2} className="mt-1">
                <Grid item xs={12}>
                  <Stack
                    direction="row"
                    className="align-items-center gap-2 flex-wrap justify-content-center"
                    sx={{
                      "&>p": {
                        textAlign: "center",
                      },
                    }}
                  >
                    <FileUploader
                      formikProp={props}
                      name="brandLogo"
                      size={150}
                      maxFileUpload={1}
                      acceptType=".jpg, .jpeg, .png"
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} className="text-center">
                  <MDButton
                    color={sidenavColor}
                    variant="contained"
                    type="submit"
                  >
                    Next
                  </MDButton>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      </MDBox>
    </>
  );
};

export default UploadBrandImage;
