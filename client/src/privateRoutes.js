/*
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// layouts
import Dashboard from "layouts/dashboard";
import Roles from "layouts/roles";
import Places from "layouts/places";
import Brands from "layouts/brands";
import Reservation from "layouts/reservations";
// import Tables from "layouts/tables";
// import Billing from "layouts/billing";
import Rates from "layouts/rates";
// import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import Settings from "layouts/settings";
// import SignIn from "layouts/authentication/sign-in";
// import SignUp from "layouts/authentication/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";
import PlaceDetails from "layouts/places/components/PlaceDetails";
import Pricing from "layouts/pricing-tier";
// import PricingClient from "layouts/pricing-tier-client";
import Cron from "layouts/cron";
import MyUsers from "layouts/my-users";
import Validation from "layouts/validation";
import AssignRates from "layouts/assignRates";
import Reports from "layouts/reports";
// import AutomatedReports from "layouts/automatedReports";
import Subscriptions from "layouts/subscriptions";
import SubscriptionsStatistics from "layouts/subscriptions/SummariesStatistics";
import Automation from "layouts/automation";
import DesignReceipt from "layouts/designReceipt";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import GenerateQRCode from "layouts/generateQR";
import Transactions from "layouts/transactions";
import CustomerActivityLogs from "layouts/customerActivityLogs";
import Permits from "layouts/Permits"


import SummarizeIcon from "@mui/icons-material/Summarize";
import DepositReports from "layouts/depositReports";

const privateRoutes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Places",
    key: "places",
    icon: (
      <Icon className="material-symbols-outlined" fontSize="small">
        pin_drop
      </Icon>
    ),
    route: "/places",
    component: <Places />,
  },
  {
    key: "places_view",
    route: "/place/detail",
    component: <PlaceDetails />,
  },
  {
    key: "settings",
    route: "/settings",
    component: <Settings />,
  },
  {
    type: "collapse",
    name: "Brands",
    key: "brands",
    icon: <Icon className="material-icons">diversity_2</Icon>,
    route: "/brands",
    component: <Brands />,
  },
  {
    type: "collapse",
    name: "Roles",
    key: "roles",
    icon: (
      <Icon className="material-icons" fontSize="medium">
        manage_accounts
      </Icon>
    ),
    route: "/roles",
    component: <Roles />,
  },
  {
    type: "collapse",
    name: "Rates",
    key: "rates",
    icon: <Icon fontSize="small">paid</Icon>,
    route: "/rates",
    component: <Rates />,
  },
  {
    type: "collapse",
    name: "Assign Rates",
    key: "assign_rates",
    icon: <Icon fontSize="small">paid</Icon>,
    route: "/assign_rates",
    component: <AssignRates />,
  },
  {
    type: "collapse",
    name: "Reservations",
    key: "reservations",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/reservations",
    component: <Reservation />,
  },
  {
    type: "collapse",
    name: "Deposit Reports",
    key: "depositReports",
    icon: <Icon fontSize="small">book_online</Icon>,
    route: "/depositReports",
    component: <DepositReports />,
  },
  {
    type: "collapse",
    name: "Permits",
    key: "permits",
    icon: <Icon fontSize="small">book_online</Icon>,
    route: "/permits",
    component: <Permits />,
  },
  {
    type: "collapse",
    name: "Transactions",
    key: "transactions",
    icon: <Icon fontSize="small">account_balance</Icon>,
    route: "/transactions",
    component: <Transactions />,
  },
  {
    type: "collapse",
    name: "Customer Activity Logs",
    key: "customer_activity_logs",
    icon: <Icon fontSize="small">settings_accessibility</Icon>,
    route: "/customer-activity-logs",
    component: <CustomerActivityLogs />,
  },
  {
    type: "collapse",
    name: "Automation",
    key: "automation",
    icon: <Icon fontSize="small">mail</Icon>,
    route: "/automation",
    component: <Automation />,
  },
  {
    type: "collapse",
    name: "Pricing Tier",
    key: "pricing_tier",
    icon: <Icon fontSize="small">paid</Icon>,
    route: "/pricing_tier",
    component: <Pricing />,
  },


  {
    type: "collapse",
    name: "QR Code",
    key: "generate_qr_code",
    icon: (
      <Icon fontSize="small">
        <QrCode2Icon />
      </Icon>
    ),
    route: "/generate_qr_code",
    component: <GenerateQRCode />,
  },
  {
    type: "collapse",
    name: "Notification",
    key: "notification",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notification",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Cron Jobs",
    key: "cron_jobs",
    icon: <Icon fontSize="small">updateicon</Icon>,
    route: "/cron",
    component: <Cron />,
  },
  {
    type: "collapse",
    name: "My Users",
    key: "users",
    icon: <Icon fontSize="small">group</Icon>,
    route: "/users",
    component: <MyUsers />,
  },
  {
    type: "collapse",
    name: "Design Receipt",
    key: "design_receipt",
    icon: <Icon fontSize="small">receipt</Icon>,
    route: "/design_receipt",
    component: <DesignReceipt />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Validation",
    key: "validation",
    icon: <Icon className="material-icons">rules</Icon>,
    route: "/validation",
    component: <Validation />,
  },
  {
    type: "collapse",
    name: "Subscriptions",
    key: "subscriptions",
    icon: <Icon className="material-icons">subscriptions</Icon>,
    route: "/subscriptions",
    component: <Subscriptions />,
  },
  {
    type: "collapse",
    name: "SubscriptionsStatistics",
    key: "SubscriptionsStatistics",
    icon: <Icon className="material-icons">subscriptions</Icon>,
    route: "/subscriptions/Statistics",
    component: <SubscriptionsStatistics />,
  },
  {
    type: "collapse",
    name: "Settings",
    key: "settings",
    icon: <Icon className="material-icons">settings</Icon>,
    route: "/settings",
    component: <Settings />,
  },
  {
    type: "collapse",
    name: "Reports",
    key: "reports",
    icon: (
      <Icon className="material-icons">
        <SummarizeIcon />
      </Icon>
    ),
    route: "/reports",
    component: <Reports />,
  },
];

export default privateRoutes;
