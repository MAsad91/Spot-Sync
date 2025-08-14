import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import Card from "@mui/material/Card";
import MDSnackbar from "components/MDSnackbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import bgImage from "assets/images/parking3.jpeg";
import BasicLayout from "../components/BasicLayout/index";
import { useMaterialUIController } from "context";
import { postLogin } from "store/slice/customer/customerSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import CircularIndeterminate from "components/MDLoading";

function Basic() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const loginValidationSchema = Yup.object().shape({
    emailOrMobile: Yup.string()
      .required("Email or Mobile is required!")
      .test(
        "is-email-or-mobile",
        "Please enter a valid Email or 10-digit Mobile Number",
        (value) => {
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          const isMobile = /^\+?\d{10,15}$/.test(value);
          return isEmail || isMobile;
        }
      ),
  });

  const handleLogin = (values, setFieldValue) => {
    setIsLoading(true);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.emailOrMobile);
    setFieldValue("isEmail", isEmail);
    dispatch(postLogin(values))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          navigate(`/parker-otpVerify?isOtpVerified=true`, {
            state: {
              data: res.data,
            },
          });
          setIsLoading(false);
        } else {
          setNotification({
            ...notification,
            color: "error",
            title: "Error",
            content: res?.message,
            icon: "warning",
            show: true,
          });
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log("error", err);
        setIsLoading(false);
      });
  };

  return (
    <BasicLayout image={bgImage}>
      <Formik
        initialValues={{ emailOrMobile: "", isEmail: null }}
        validationSchema={loginValidationSchema}
        onSubmit={(values, { setFieldValue }) => {
          handleLogin(values, setFieldValue);
        }}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit}>
            <Card>
              <MDBox
                variant="gradient"
                bgColor={sidenavColor}
                borderRadius="lg"
                coloredShadow={sidenavColor}
                mx={2}
                mt={-3}
                p={2}
                mb={1}
                textAlign="center"
              >
                <MDTypography
                  variant="h4"
                  fontWeight="medium"
                  color="white"
                  mt={1}
                >
                  Sign in
                </MDTypography>
              </MDBox>
              <MDBox pt={4} pb={3} px={3}>
                <MDBox mb={2}>
                  <MDInput
                    name="emailOrMobile"
                    value={props.values.emailOrMobile}
                    onChange={props.handleChange}
                    onBlur={(e) => {
                      props.handleBlur(e);
                      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                        props.values.emailOrMobile
                      );
                      props.setFieldValue("isEmail", isEmail);
                    }}
                    label="Email or Mobile"
                    error={
                      props.errors.emailOrMobile && props.touched.emailOrMobile
                    }
                    helperText={
                      props.touched.emailOrMobile && props.errors.emailOrMobile
                    }
                  />
                </MDBox>
                <MDBox mt={4} mb={1}>
                  <MDButton
                    type="submit"
                    variant="gradient"
                    color={sidenavColor}
                    fullWidth
                  >
                    Next
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </form>
        )}
      </Formik>
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />
      <CircularIndeterminate
        type="full"
        size={20}
        text="Please Wait.. "
        open={isLoading}
      />
    </BasicLayout>
  );
}

export default Basic;

// const handleLogin = (values) => {
//   const { email, password } = values;
//   dispatch(postLogin({ email, password }))
//     .unwrap()
//     .then((res) => {
//       if (res?.success) {
//         localStorage.setItem("Authorization", res?.token);
//         dispatch(getMeInfo());
//         navigate("/dashboard");
//       } else {
//         setNotification({
//           ...notification,
//           color: "error",
//           title: "Error",
//           content: res?.message,
//           icon: "warning",
//           show: true,
//         });
//       }
//     })
//     .catch((err) => {
//       console.log("error", err);
//     });
// };
