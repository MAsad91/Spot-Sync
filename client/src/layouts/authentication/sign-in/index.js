import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import MDSnackbar from "components/MDSnackbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/parking3.jpeg";
import { useDispatch } from "react-redux";
import { postLogin } from "store/slice/auth/authSlice";
import { useMaterialUIController } from "context";
import { Formik } from "formik";
import { loginValidationSchema } from "services/validation";
import { getMeInfo } from "store/slice/users/userSlice";
import CircularIndeterminate from "components/MDLoading";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

function Basic() {
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const handleSetRememberMe = () => setRememberMe(!rememberMe);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Add this function to handle mouse down event on the icon button
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLogin = (values) => {
    setIsLoading(true);
    const { email, password } = values;
    dispatch(postLogin({ email, password }))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          localStorage.setItem("Authorization", res?.token);
          dispatch(getMeInfo());
          navigate("/dashboard");
          setIsLoading(false);
        } else {
          setIsLoading(false);
          setNotification({
            ...notification,
            color: "error",
            title: "Error",
            content: res?.message,
            icon: "warning",
            show: true,
          });
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("error", err);
      });
  };
  return (
    <BasicLayout image={bgImage}>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginValidationSchema}
        onSubmit={(values) => {
          handleLogin(values);
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
                    name="email"
                    value={props.values.email}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    label="Email"
                    error={
                      props.errors.email && props.touched.email ? true : false
                    }
                    success={
                      props.errors.email && props.touched.email ? false : true
                    }
                    helperText={
                      props.errors.email && props.touched.email
                        ? props.errors.email
                        : null
                    }
                  />
                </MDBox>
                <MDBox mb={2}>
                  <TextField
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={props.values.password}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    label="Password"
                    error={
                      props.errors.password && props.touched.password
                        ? true
                        : false
                    }
                    helperText={
                      props.errors.password && props.touched.password
                        ? props.errors.password
                        : null
                    }
                    variant="outlined" // Adjust based on your UI
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </MDBox>
                <MDBox display="flex" alignItems="center" ml={-1}>
                  <Switch checked={rememberMe} onChange={handleSetRememberMe} />
                  <MDTypography
                    variant="button"
                    fontWeight="regular"
                    color="text"
                    onClick={handleSetRememberMe}
                    sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                  >
                    &nbsp;&nbsp;Remember me
                  </MDTypography>
                </MDBox>
                <MDBox mt={4} mb={1}>
                  <MDButton
                    type="submit"
                    variant="gradient"
                    color={sidenavColor}
                    fullWidth
                    // onClick={handleLogin}
                  >
                    sign in
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </form>
        )}
      </Formik>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Please wait...! "
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
    </BasicLayout>
  );
}

export default Basic;
