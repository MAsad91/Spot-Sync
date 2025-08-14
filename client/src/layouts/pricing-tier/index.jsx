import { Card } from "@mui/material";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { useMaterialUIController } from "context";
import { useState, useEffect, useCallback, useMemo } from "react";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useDispatch, useSelector } from "react-redux";
import { getPricingTier } from "store/slice/pricingTier/pricingTierSlice";
import PlacePicker from "components/MDPlacePicker/PlacePicker";
import { useLocation } from "react-router-dom";
import MDSnackbar from "components/MDSnackbar";
import PaymentGatewayCard from "./components/PaymentGatewayCard";
import { debounce, map } from "lodash";
import CreateServiceFee from "./components/CreateAndUpdateServiceFee";
import IsbRevenueCard from "./components/IsbRevenueCard";
import ServiceFeeCard from "./components/ServiceFeeCard";
import SaasSubscriptionCard from "./components/SaasSubscriptionCard";
import ApplyTaxOnServiceFeeCard from "./components/ApplyTaxOnServiceFeeCard";
import SubscriptionIsbRevenueCard from "./components/SubscriptionIsbRevenueCard";
import StripePaymentTypeCard from "./components/StripePaymentTypeCard";
import SurchargeCard from "./components/SurchargeCard";
import SubscriptionSurchargeCard from "./components/SubscriptionSurchargeCard";
import PaymentGatewayFeeCard from "./components/PaymentGatewayFeeCard";
import StripeSpecialRevenueSplitCard from "./components/StripeSpecialRevenueSplitCard";

function Pricing() {
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const userData = useSelector((state) => state.users?.meInfo);
  const roleModules = userData?.roleModules || {};
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });
  const location = useLocation();

  const pricingData = useSelector((state) => state.pricingTier?.pricingData);
  const defaultAvailable = useSelector(
    (state) => state.pricingTier?.defaultAvailable
  );
  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  let placeId =
    selectedPlace?._id || new URLSearchParams(location?.search).get("placeId");

  const getPricingData = useCallback(async () => {
    dispatch(getPricingTier(placeId));
  }, [dispatch, placeId]);

  const debounceFn = useMemo(
    () => debounce(getPricingData, 1000),
    [getPricingData]
  );

  useEffect(() => {
    debounceFn();
  }, [debounceFn]);

  return (
    <MDBox>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={2} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Card>
                <MDBox
                  mx={1}
                  mt={-2}
                  py={1}
                  px={1}
                  variant="gradient"
                  bgColor={sidenavColor}
                  borderRadius="lg"
                  coloredShadow={sidenavColor}
                  className="d-flex align-items-center gap-2"
                >
                  <MDTypography
                    variant="h6"
                    color="white"
                    className="flex-grow-1"
                  >
                    Pricing Tier
                  </MDTypography>
                </MDBox>
                <MDBox p={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <PlacePicker />
                    </Grid>
                    {placeId && (
                      <Grid item xs={12} sm={6} md={4}>
                        <PaymentGatewayCard userRole={userData.roleLevel} />
                      </Grid>
                    )}
                    {placeId && (
                      <Grid item xs={12} sm={6} md={4}>
                        <ApplyTaxOnServiceFeeCard
                          userRole={userData.roleLevel}
                        />
                      </Grid>
                    )}
                    {placeId && (
                      <Grid item xs={12} sm={6} md={4}>
                        <SurchargeCard userRole={userData.roleLevel} />
                      </Grid>
                    )}
                    {placeId && (
                      <Grid item xs={12} sm={6} md={4}>
                        <SubscriptionSurchargeCard userRole={userData.roleLevel} />
                      </Grid>
                    )}
                    {placeId && (
                      <Grid item xs={12} sm={6} md={4}>
                        <SaasSubscriptionCard userRole={userData.roleLevel} />
                      </Grid>
                    )}
                    {placeId && (
                      <Grid item xs={12} sm={6} md={4}>
                        <IsbRevenueCard userRole={userData.roleLevel} />
                      </Grid>
                    )}
                    {placeId && (
                      <Grid item xs={12} sm={6} md={4}>
                        <SubscriptionIsbRevenueCard
                          userRole={userData.roleLevel}
                        />
                      </Grid>
                    )}
                    {placeId && (
                      <Grid item xs={12} sm={6} md={4}>
                        <StripePaymentTypeCard userRole={userData.roleLevel} />
                      </Grid>
                    )}
                    {placeId && (
                      <Grid item xs={12} sm={6} md={4}>
                        <PaymentGatewayFeeCard userRole={userData.roleLevel} />
                      </Grid>
                    )}
                    
                    {placeId && selectedPlace.paymentGateway === "STRIPE" && (
                      <Grid item xs={12} sm={6} md={4}>
                        <StripeSpecialRevenueSplitCard
                          userRole={userData.roleLevel}
                        />
                      </Grid>
                    )}
                  </Grid>
                </MDBox>
                <MDBox p={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} mt={0}>
                      {roleModules.Pricing_add && placeId && (
                        <MDButton
                          color={sidenavColor}
                          variant="outlined"
                          onClick={() => setDialogOpen(true)}
                        >
                          {`Add ${
                            !defaultAvailable ? "Default" : "Conditional"
                          } Service Fee`}
                        </MDButton>
                      )}
                    </Grid>
                    {map(pricingData ?? [], (item, index) => (
                      <>
                        <Grid item xs={12}>
                          <ServiceFeeCard
                            isDefault={defaultAvailable}
                            serviceFeeData={item}
                          />
                        </Grid>
                      </>
                    ))}
                  </Grid>

                  <CreateServiceFee
                    isDefault={defaultAvailable}
                    dialogOpen={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
        <Footer />
        <MDSnackbar
          color={notification.color}
          icon={notification.icon}
          title={notification.title}
          content={notification.content}
          open={notification.show}
          close={notification.close}
          bgWhite
        />
      </DashboardLayout>
    </MDBox>
  );
}

export default Pricing;
