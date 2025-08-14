import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import Configurator from "examples/Configurator";
import Sidenav from "examples/Sidenav/index";
import "swiper/css";
import "swiper/css/bundle";
import "rsuite/dist/rsuite-no-reset.min.css";
import theme from "assets/theme";
import "assets/styles/utility.css";
import "assets/styles/index.css";
import themeDark from "assets/theme-dark";
import privateRoutes from "privateRoutes";
import routes from "routes";
import { setMiniSidenav, useMaterialUIController } from "context";
import brandDark from "assets/images/logo-spotsync-dark.svg";
import brandWhite from "assets/images/logo-spotsync-light.svg";
import { getSession, getCustomerSession } from "services/service";
import SignIn from "layouts/authentication/sign-in";
import CustomerSignIn from "layouts/customer/authentication/sign-in";
import CustomerOtpVerify from "layouts/customer/authentication/otp-verify";
import { getMeInfo } from "store/slice/users/userSlice";
import { isEmpty } from "lodash";
import PaymentMethod from "layouts/payment/PaymentMethod";
import PaymentSuccessPage from "layouts/payment/PaymentSuccessPage";
import SubscriptionInvoice from "layouts/receipt/subscriptionInvoice";
import SubscriptionReceipt from "layouts/receipt/subscriptionReceipt";
import TestHTML from "layouts/receipt/testHTML";
import NewReceiptIndex from "layouts/receipt/index";
import NewReceiptSpotSync from "layouts/payment/paymentInvoice/spotsync";
import customerPrivateRoute from "customerPrivateRoutes";
import PaymentSuccessPageACH from "layouts/payment/PaymentSuccessPageACH";
import ParkingPayment from "layouts/payment/parking";
import AuthorizenetParkingPaymentForm from "layouts/payment/parking/AuthorizenetParkingPaymentForm";
import PaymentResultPage from "layouts/payment/parking/PaymentResultPage";
import BrandImageUpload from "layouts/public/branImageUpload";
import AuthorizenetPaymentForm from "layouts/payment/AuthorizenetPaymentForm";

export default function App() {
  const [controller] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  const { Authorization } = getSession();
  const { CustomerAuthorization } = getCustomerSession();
  const dispatch = useDispatch();
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  const brandData = selectedPlace?.brandId;

  useEffect(() => {
    if (!isEmpty(Authorization)) {
      dispatch(getMeInfo());
    }
  }, [dispatch, Authorization]);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [direction, pathname]);

  const handleMouseEvents = (enter) => {
    if (miniSidenav && enter !== onMouseEnter) {
      setMiniSidenav(dispatch, !enter);
      setOnMouseEnter(enter);
    }
  };

  const brandImage =
    (transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite;
  const displaySidenav =
    layout === "dashboard" &&
    !pathname.startsWith("/payment") &&
    !pathname.startsWith("/parking") &&
    !pathname.startsWith("/receipt") &&
    !pathname.startsWith("/sub-invoice") &&
    !pathname.startsWith("/sub-receipt") &&
    !pathname.startsWith("/test") &&
    !pathname.startsWith("/public");
  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterMoment}>
        {displaySidenav && (
          <Sidenav
            color={sidenavColor}
            brand={brandData?.brandLogo ? brandData?.brandLogo : brandImage}
            brandName=""
            routes={Authorization ? privateRoutes : routes}
            onMouseEnter={() => handleMouseEvents(true)}
            onMouseLeave={() => handleMouseEvents(false)}
          />
        )}
        <Configurator />
        <Routes>
          {Authorization && (
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          )}
          {CustomerAuthorization && (
            <>
              <Route
                path="parker-login"
                element={<Navigate to="/customer-dashboard" replace />}
              />
              <Route
                path="parker-otpVerify"
                element={<Navigate to="/customer-dashboard" replace />}
              />
            </>
          )}
          <Route path="/" element={<SignIn />} />
          <Route path="/parker-login" element={<CustomerSignIn />} />
          <Route path="/parker-otpVerify" element={<CustomerOtpVerify />} />
          {Authorization &&
            privateRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.route}
                element={route.component}
              />
            ))}
          {CustomerAuthorization &&
            customerPrivateRoute.map((route) => (
              <Route
                key={route.key}
                path={route.route}
                element={route.component}
              />
            ))}
          <Route path="/payment" element={<PaymentMethod />} />
          <Route
            path="/payment/authorizenet"
            element={<AuthorizenetPaymentForm />}
          />
          <Route
            path="/payment/payment-result"
            element={<PaymentSuccessPage />}
          />
          <Route
            path="/payment/authorizenet/payment-result"
            element={<PaymentSuccessPage />}
          />
          <Route
            path="/payment/payment-result-ach"
            element={<PaymentSuccessPageACH />}
          />
          <Route path="/receipt" element={<NewReceiptIndex />} />
          <Route path="/test" element={<TestHTML />} />
          <Route path="/sub-invoice" element={<SubscriptionInvoice />} />
          <Route path="/sub-receipt" element={<SubscriptionReceipt />} />
          <Route path="/payment/spotsyncreceipt" element={<NewReceiptSpotSync />} />

          <Route path="/parking/payment" element={<ParkingPayment />} />
          <Route
            path="/parking/payment/result"
            element={<PaymentResultPage />}
          />

          <Route
            path="/parking/payment/authorizenet"
            element={<AuthorizenetParkingPaymentForm />}
          />
          <Route
            path="/parking/payment/authorizenet/result"
            element={<PaymentResultPage />}
          />

          {/* Public Routes ========> */}

          <Route
            path="/public/upload-brand-logo"
            element={<BrandImageUpload />}
          />
          <Route
            path="/public/brand-imageUpload"
            element={<CustomerOtpVerify />}
          />

          <Route
            path="*"
            element={
              <div className="text-center">
                <h1>404 - Page Not Found</h1>
              </div>
            }
          />
        </Routes>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
