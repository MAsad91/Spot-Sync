import { Box, Stack, Typography } from "@mui/material";

import CustomerDashboardLayout from "examples/LayoutContainers/CustomerDashboardLayout";

import { get, isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSubscriptionsList } from "store/slice/customer/customerSlice";
import { getCustomerInfo } from "store/slice/customer/customerSlice";

import Header from "./Header";
import ProfileInfo from "./ProfileInfo";
import SubscriptionAccordion from "./SubscriptionAccordion";
import CircularIndeterminate from "components/MDLoading";
import Footer from "./Footer";
import NoDataOverlay from "components/Common/NoDataOverlay";
import PaymentAccordion from "../payment/PaymentAccordion";
import { useMaterialUIController } from "context";

function Dashboard() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const [value, setValue] = useState(1);
  const dispatch = useDispatch();
  const customerDetails = useSelector(
    (state) => state.customer.customerDetails
  );
  const subscriptionList = useSelector(
    (state) => state.customer.subscriptionList
  );
  const isLoading = useSelector((state) => state.customer.loading);
console.log("customerDetails --->",customerDetails)

useEffect(() => {
    dispatch(getCustomerInfo())
      .unwrap()
      .then((result) => {
        if (get(result, "success", false)) {
          dispatch(getSubscriptionsList());
        }
      })
      .catch((err) => {
        throw err;
      });
  }, [dispatch]);

  return (
    <CustomerDashboardLayout>
      <ProfileInfo customerInfo={customerDetails} />
      {value === 1 ? (
        <Box
          paddingTop={3}
          paddingBottom={3}
          paddingLeft={{ xs: 2, sm: 0 }}
          paddingRight={{ xs: 2, sm: 0 }}
        >
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            align="center"
            color={darkMode ? "#ffffff" : "#1c1c1c"}
          >
            Your Subscriptions
          </Typography>
          {isEmpty(subscriptionList) && !isLoading ? (
            <Stack marginTop={3}>
              <NoDataOverlay />
            </Stack>
          ) : (
            <Stack marginTop={3}>
              {subscriptionList.map((item, index) => (
                <SubscriptionAccordion subscription={item} key={`subscription_${index}`} />
              ))}
            </Stack>
          )}
        </Box>
      ) : value === 2 ? (
        <Box
          paddingTop={3}
          paddingBottom={3}
          paddingLeft={{ xs: 2, sm: 0 }}
          paddingRight={{ xs: 2, sm: 0 }}
        >
          <Typography variant="subtitle2" fontWeight="bold" align="center">
            Payment History
          </Typography>
          {isEmpty(subscriptionList) && !isLoading ? (
            <Stack marginTop={3}>
              <NoDataOverlay />
            </Stack>
          ) : (
            <Stack marginTop={3}>
              <PaymentAccordion customerId={customerDetails._id} />
            </Stack>
          )}
        </Box>
      ) : null}

      <Footer value={value} setValue={setValue} />
      <CircularIndeterminate type="full" size={20} text=" " open={isLoading} />
    </CustomerDashboardLayout>
  );
}

export default Dashboard;
