import React, { useEffect, useState } from "react";
import { Card, FormHelperText } from "@mui/material";
import MDSnackbar from "components/MDSnackbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import bgImage from "assets/images/parking3.jpeg";
import BasicLayout from "../components/BasicLayout/index";
import { useMaterialUIController } from "context";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import CircularIndeterminate from "components/MDLoading";
import OtpInput from "react-otp-input";
import { get } from "lodash";
import { postOtpVerify } from "store/slice/customer/customerSlice";
import { postOtpResend } from "store/slice/customer/customerSlice";

function OtpVerify() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [errorAlert, setErrorAlert] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isOtpVerified = queryParams.get("isOtpVerified");

  useEffect(() => {
    if (isOtpVerified === "false" || isOtpVerified === null) {
      navigate("/parker-login");
    }
  }, [isOtpVerified, navigate]);

  const handleChange = (code) => {
    setOtpCode(code);
  };

  const handleSubmitOtp = async () => {
    if (otpCode.length === 4) {
      setErrorAlert(false);
      setIsLoading(true);
      const payload = {
        emailOrMobile: get(state, "data.isEmail", false)
          ? get(state, "data.email", "")
          : get(state, "data.mobile", ""),
        otp: otpCode,
        isEmail: get(state, "data.isEmail", false),
      };

      await dispatch(postOtpVerify(payload))
        .unwrap()
        .then((res) => {
          if (res?.success) {
            localStorage.setItem("CustomerAuthorization", res?.token);
            navigate("/customer-dashboard");
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
    } else {
      setErrorAlert(true);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    const payload = {
      emailOrMobile: get(state, "data.isEmail", false)
        ? get(state, "data.email", "")
        : get(state, "data.mobile", ""),
      isEmail: get(state, "data.isEmail", false),
    };
    await dispatch(postOtpResend(payload))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          setIsLoading(false);
          setNotification({
            ...notification,
            color: "success",
            title: "Success",
            content: "OTP Resend Successfully",
            icon: "success",
            show: true,
          });
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
      .catch((error) => {
        console.log("OTP resend error========>", error);
      });
  };

  return (
    <BasicLayout image={bgImage}>
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
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            OTP Verification
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDTypography
            variant="subtitle2"
            fontSize="small"
            fontWeight="regular"
            align="center"
            mb={2}
          >
            Code sent to
            <MDTypography
              variant="subtitle2"
              fontSize="small"
              fontWeight="regular"
              color={sidenavColor}
              component="span"
              ml={1}
            >
              {get(state, "data.isEmail", false)
                ? get(state, "data.email", "")
                : get(state, "data.mobile", "")}
            </MDTypography>
          </MDTypography>
          <MDBox mb={2}>
            <OtpInput
              value={otpCode}
              onChange={handleChange}
              numInputs={4}
              separator={<span style={{ width: "8px" }}></span>}
              isInputNum={true}
              shouldAutoFocus={true}
              containerStyle={{
                alignItems: "center",
                justifyContent: "center",
              }}
              hasErrored={errorAlert}
              errorStyle={{ color: "#b71c1c", borderColor: "#b71c1c" }}
              inputStyle={{
                border: "1px solid #CFD3DB",
                borderRadius: "8px",
                width: "40px",
                height: "40px",
                fontSize: "16px",
                color: "#777E89",
                fontWeight: "400",
                caretColor: "#777E89",
                margin: "0 auto",
              }}
              focusStyle={{
                border: "1px solid #CFD3DB",
                outline: "none",
              }}
            />
            {errorAlert && (
              <FormHelperText error={true} sx={{ textAlign: "center", mt: 1 }}>
                All fields are required!
              </FormHelperText>
            )}
            <MDTypography
              variant="subtitle2"
              fontSize="small"
              fontWeight="regular"
              align="center"
              mt={2}
            >
              Did not get code?
              <MDTypography
                variant="subtitle2"
                color={sidenavColor}
                fontSize="small"
                fontWeight="regular"
                component="span"
                sx={{ cursor: "pointer" }}
                ml={1}
                onClick={resendOtp}
              >
                Request again
              </MDTypography>
            </MDTypography>
          </MDBox>
          <MDBox mt={4} mb={1}>
            <MDButton
              type="submit"
              variant="gradient"
              color={sidenavColor}
              fullWidth
              onClick={handleSubmitOtp}
            >
              Submit
            </MDButton>
          </MDBox>
        </MDBox>
      </Card>

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

export default OtpVerify;
