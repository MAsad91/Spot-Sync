import { useEffect, useState } from "react";

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// PMS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// PMS example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";
import { useDispatch } from "react-redux";
import { logout } from "store/slice/auth/authSlice";
// PMS context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";
import { useSelector } from "react-redux";
import CircularIndeterminate from "components/MDLoading";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const dispatchRedux = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const logoutDash = async () => {
    setIsLoading(true);
    await dispatchRedux(logout());
    setIsLoading(false);
    window.location.href = "/";
  };

  const IsImpersonate = localStorage.getItem("ImpersonateBy");
  const handelBack = async () => {
    setIsLoading(true);
    localStorage.setItem("Authorization", IsImpersonate);
    localStorage.removeItem("ImpersonateBy");
    setIsLoading(false);
    window.location.href = "/";
  };

  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    transparentSidenav,
    whiteSidenav,
    darkMode,
    sidenavColor,
  } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }
  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(
        dispatch,
        window.innerWidth < 1200 ? false : transparentSidenav
      );
      setWhiteSidenav(
        dispatch,
        window.innerWidth < 1200 ? false : whiteSidenav
      );
    }
    window.addEventListener("resize", handleMiniSidenav);
    handleMiniSidenav();

    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location, transparentSidenav, whiteSidenav]);

  // const userData =  useSelector((state) => state.users?.meInfo);
  // const userRole =   userData?.roleLevel || '';
  // const allowedRoutes = {
  //   100: ["dashboard", "brands", "roles", "users", "pricing_tier", "profile", "settings"],
  //   80: ["dashboard", "places", "rates", "assign_rates", "pricing_client", "roles", "users", "validation", "profile"]
  // };

  // const filteredRoutes = userRole ? routes.filter(({ key }) => allowedRoutes[userRole]?.includes(key)) : routes;

  const userData = useSelector((state) => state.users?.meInfo);
  const roleModules = userData?.roleModules || {};
  const allowedRoutes = {
    dashboard: "Dashboard_view",
    brands: "Brand_view",
    roles: "Role_view",
    users: "MyUser_view",
    pricing_tier: "Pricing_view",
    profile: "Profile_view",
    settings: "Setting_view",
    places: "Place_view",
    rates: "Rate_view",
    assign_rates: "Assign_rate_view",
    validation: "Validation_view",
    automated_reports: "Automated_reports_view",
    subscriptions: "Subscription_view",
    // design_receipt: "Design_receipt_view",
    notification: "Notification_view",
    reservations: "Reservation_view",
    generate_qr_code: "QRCode_view",
    transactions: "Transaction_view",
    reports: "Report_view",
    depositReports: "Deposit_Report_view",
    permits: "Permit_view",
        customer_activity_logs: "Customer_activity_log_view"

  };

  const filteredRoutes = routes.filter(
    ({ key }) => roleModules[allowedRoutes[key]]
  );
  const indexing = [
    "dashboard",
    "brands",
    "subscriptions",
    "reservations",
    "permits",
    "customer_activity_logs",
    "transactions",
    "reports",
    "pricing_tier",
    "places",
    "assign_rates",
    "rates",
    "validation",


    "roles",
    "users",
    "notification",
    "automated_reports",
    "generate_qr_code",
    "settings",
  ];
  // Create a map to easily access the index of each key
  const indexMap = indexing.reduce((acc, key, index) => {
    acc[key] = index;
    return acc;
  }, {});

  // Sort the data array based on the index of the 'key' property in the indexing array
  const data = filteredRoutes.sort((a, b) => {
    const indexA = indexMap[a.key];
    const indexB = indexMap[b.key];
    return indexA - indexB;
  });
  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = data.map(
    ({ type, name, icon, title, noCollapse, key, href, route }) => {
      let returnValue;

      if (type === "collapse") {
        returnValue = href ? (
          <Link
            href={href}
            key={key}
            target="_blank"
            rel="noreferrer"
            sx={{ textDecoration: "none" }}
          >
            <SidenavCollapse
              name={name}
              icon={icon}
              active={key === collapseName}
              noCollapse={noCollapse}
            />
          </Link>
        ) : (
          <NavLink key={key} to={route}>
            <SidenavCollapse
              name={name}
              icon={icon}
              active={key === collapseName}
            />
          </NavLink>
        );
      } else if (type === "title") {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = (
          <Divider
            key={key}
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
        );
      }

      return returnValue;
    }
  );

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox component={NavLink} to="/" display="flex" alignItems="center">
          {brand && (
            <MDBox component="img" src={brand} alt="Brand" width="3rem" />
          )}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography
              component="h6"
              variant="button"
              fontWeight="medium"
              color={textColor}
            >
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      <List>{renderRoutes}</List>
      <MDBox p={2} mt="auto" display="flex" flexDirection="column" gap={2}>
        {IsImpersonate && (
          <>
            <MDButton
              component="a"
              onClick={handelBack}
              rel="noreferrer"
              variant="gradient"
              color={sidenavColor}
              fullWidth
            >
              Back to super admin
            </MDButton>
            <CircularIndeterminate
              type="full"
              size={20}
              text=""
              open={isLoading}
            />
          </>
        )}
      </MDBox>
      <MDBox p={2} mt="auto" display="flex" flexDirection="column" gap={2}>
        <MDButton
          component="a"
          onClick={() => logoutDash()}
          rel="noreferrer"
          variant="gradient"
          color={sidenavColor}
          fullWidth
        >
          Logout
        </MDButton>
        <CircularIndeterminate type="full" size={20} text="" open={isLoading} />
      </MDBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
  ]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
