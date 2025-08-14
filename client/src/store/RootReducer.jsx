import { combineReducers } from "@reduxjs/toolkit";
import authReducers from "./slice/auth/authSlice";
import brandReducers from "./slice/brands/brandSlice";
import roleReducer from "./slice/roles/roleSlice";
import placeReducer from "./slice/places/placeSlice";
import rateReducer from "./slice/rates/rateSlice";
import validationReducer from "./slice/validation/validationSlice";
import userReducer from "./slice/users/userSlice";
import plivoReducer from "./slice/plivo/plivoSlice";
import slackReducer from "./slice/slack/slackSlice";
import discordReducer from "./slice/discord/discordSlice"
import pricingTierReducer from "./slice/pricingTier/pricingTierSlice";
import qrCodeReducer from "./slice/qrCode/qrCodeSlice";
import notificationReducer from "./slice/notification/notificationSlice";
import subscriptionsReducer from "./slice/subscriptions/subscriptionSlice";
import transactionsReducer from "./slice/transactions/transactionSlice";
import enforcementReducer from "./slice/enforcements/enforcementSlice";
import reservationsReducer from "./slice/reservation/reservationSlice";
import paymentReducer from "./slice/payment/paymentSlice";
import customerReducers from "./slice/customer/customerSlice";
import paymentGatewaySlice from "./slice/paymentGateway/paymentGatewaySlice";

import dashboardReducer from "./slice/homePage/homePageSlice";
import publicReducer from "./slice/public/publicSlice";
import reportReducer from "./slice/reports/reportSlice";
import permitReducer from "./slice/permits/permitSlice";
import permitsOptionReducer from "./slice/permitsOptions/permitsOptionSlice";
import otherReducer from "./slice/other/otherSlice";
import customerActivityLogReducer from "./slice/customerActivityLogs/customerActivityLogsSlice";


const combinedReducer = combineReducers({
  auth: authReducers,
  roles: roleReducer,
  brands: brandReducers,
  places: placeReducer,
  rates: rateReducer,
  users: userReducer,
  plivos: plivoReducer,
  slacks: slackReducer,
  discord: discordReducer,
  pricingTier: pricingTierReducer,
  validations: validationReducer,
  qrCodes: qrCodeReducer,
  notifications: notificationReducer,
  subscriptions: subscriptionsReducer,
  transactions: transactionsReducer,
  enforcements: enforcementReducer,
  reservations: reservationsReducer,
  payment: paymentReducer,
  customer: customerReducers,
  paymentGateway: paymentGatewaySlice,

  dashboard: dashboardReducer,
  public: publicReducer,
  report: reportReducer,
  permit: permitReducer,
  permitsOptions: permitsOptionReducer,
  other: otherReducer,
  customerActivityLog: customerActivityLogReducer,

});

export const rootReducer = (state, action) => {
  if (action.type === "auth/logout/fulfilled") {
    state = undefined;
  }
  return combinedReducer(state, action);
};
