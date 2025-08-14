import {
  BottomNavigation,
  BottomNavigationAction,
  CssBaseline,
  Paper,
  useMediaQuery,
} from "@mui/material";
import MDBox from "components/MDBox";
import React from "react";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useDispatch } from "react-redux";
import { customerLogout } from "store/slice/customer/customerSlice";

const Footer = ({ value, setValue }) => {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width:600px)");

  const ImpersonateBy = localStorage.getItem("ImpersonateBy");
  const superAdmin = localStorage.getItem("SuperAdmin");

  const handelLogout = () => {
    dispatch(customerLogout());
    window.location.href = "/parker-login";
  };

  const handelBack = async () => {
    localStorage.setItem("Authorization", ImpersonateBy);
    localStorage.removeItem("ImpersonateBy");
    if (superAdmin) {
      localStorage.setItem("ImpersonateBy", superAdmin);
      localStorage.removeItem("SuperAdmin");
    }
    window.location.href = "/subscriptions";
  };

  return (
    <>
      <MDBox mt={5}>
        <CssBaseline />
        <Paper
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
          elevation={3}
        >
          <BottomNavigation
            showLabels={!isMobile}
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
          >
            {ImpersonateBy ? (
              <BottomNavigationAction
                label={isMobile ? "" : "Back To Subscriptions"}
                icon={<ArrowBack />}
                onClick={handelBack}
              />
            ) : null}
            <BottomNavigationAction
              label={isMobile ? "" : "Subscriptions"}
              icon={<PendingActionsIcon />}
            />
            <BottomNavigationAction
              label={isMobile ? "" : "Payment History"}
              icon={<HistoryIcon />}
            />
            <BottomNavigationAction
              label={isMobile ? "" : "Logout"}
              icon={<LogoutIcon />}
              onClick={handelLogout}
            />
          </BottomNavigation>
        </Paper>
      </MDBox>
    </>
  );
};

export default Footer;
