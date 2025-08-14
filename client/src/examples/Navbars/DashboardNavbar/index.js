import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import { Grid, Divider } from "@mui/material";
import Icon from "@mui/material/Icon";
import { get } from "lodash";
import MDBox from "components/MDBox";
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";
import DesktopNotification from "examples/Items/NotificationItem/desktopNotification";
import { useDispatch, useSelector } from "react-redux";
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
} from "context";
import MDTypography from "components/MDTypography";
import Badge from "@mui/material/Badge";
import {
  readStatusupdate,
  clearAllNotification,
  appendNotification,
  getNotifications,
} from "store/slice/notification/notificationSlice";
import NotificationSound from "../../../services/notificationSound"
import NotificationDialog from "examples/Items/NotificationItem/NotificationDialog";
import MDButton from "components/MDButton";
import NoDataOverlay from "components/Common/NoDataOverlay";
import Pusher from "pusher-js";
import moment from "moment";

function DashboardNavbar({ absolute, light, isMini }) {
  const apiDispatch = useDispatch();
  const [navbarType, setNavbarType] = useState();
  // const [loading, setLoading] = useState();
  const [count, setCount] = useState(0);
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    transparentNavbar,
    fixedNavbar,
    darkMode,
    sidenavColor,
  } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogData, setDialogData] = useState("false");
  const route = useLocation().pathname.split("/").slice(1);
  const userData = useSelector((state) => get(state, "users.meInfo", {}));
  const notifications = useSelector((state) =>
    get(state, "notifications.notificationList", [])
  );

  //For popup notification
  const [showNotification, setShowNotification] = useState("false");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");

  const onDisplayNotification = () => {
    setShowNotification("false");
  }

  useEffect(()=>{
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: "mt1",
      forceTLS: true,
    })

    const channelName = `push-notification-${userData._id}`;
    // Make sure to subscribe after the instance is fully created
    const channel = pusher.subscribe(channelName);

    // Bind the event only after the channel subscription is successful
    channel.bind("pusher:subscription_succeeded", () => {
      channel.bind("push-notification", function(data) {
        apiDispatch(appendNotification(data));
        displayDesktopNotificaiton(data?.notification?.title, data?._id, data?.notification?.content);
        //Code which runs when your channel listens to a new message
      })
    });

    return (() => {
      pusher.unsubscribe(channelName)
      // pusher.unsubscribe(‘channel_name2’)
  })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData._id])

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(
        dispatch,
        (fixedNavbar && window.scrollY === 0) || !fixedNavbar
      );
    }
    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const displayDesktopNotificaiton = (title, tag, body) => {
    setTitle(title);
    setTag(tag);
    setBody(body);
    setShowNotification("true");
  }

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleOpenMenu = (event) => {
    if (count >= 1) {
      apiDispatch(readStatusupdate())
      .then((res) => {
        apiDispatch(getNotifications());
      })
    }
    setOpenMenu(event.currentTarget);
  };
  const handleCloseMenu = () => setOpenMenu(false);

  const handleOpenDialog = (data) => {
    setDialogData(data);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => setOpenDialog(false);

  useEffect(() => {
    apiDispatch(getNotifications());
  }, [userData]);

  useEffect(() => {
    const unreadCount = notifications?.filter(
      (notification) => notification.status === "unseen"
    ).length;
    setCount(unreadCount);
  }, [notifications]);

  const handleClearAllRead = () => {
    apiDispatch(clearAllNotification())
      .unwrap()
      .then((res) => {
        const success = res?.success;
        if (success) {
          apiDispatch(getNotifications());
        }
      })
      .catch((err) => {
        console.error("Error Clear Notification:", err);
      });
  };

  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2,}}
    >
      <Grid item xs={12} sx={{ my: 2 , width: '250px' }}>
        <MDBox
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <MDTypography
            sx={{ paddingLeft: "5px" }}
            variant="subtitle1"
            fontWeight="bold"
            color="dark"
          >
            Notifications
          </MDTypography>

          <MDButton
            color={sidenavColor}
            sx={{ padding: "5px 7px" }}
            variant="outlined"
            type="submit"
            onClick={() => handleClearAllRead()}
          >
            Clear all
          </MDButton>
        </MDBox>
      </Grid>
      <Divider />
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <NotificationItem
            key={index}
            data={notification}
            icon={<Icon sx={iconsStyle}>notifications</Icon>}
            openMsgDialog={handleOpenDialog}
          />
        ))
      ) : (
        <NoDataOverlay />
      )}

      {/* <NotificationItem
        icon={<Icon>email</Icon>}
        data={{ title: "Check new messages" }}
      />
      <NotificationItem
        icon={<Icon>podcasts</Icon>}
        data={{ title: "Manage Podcast sessions" }}
      />
      <NotificationItem
        icon={<Icon>shopping_cart</Icon>}
        data={{ title: "Payment successfully completed" }}
      /> */}
    </Menu>
  );

  const iconsStyle = ({
    palette: { dark, white, text },
    functions: { rgba },
  }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) =>
        navbar(theme, { transparentNavbar, absolute, light, darkMode })
      }
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox
          color="inherit"
          mb={{ xs: 1, md: 0 }}
          sx={(theme) => navbarRow(theme, { isMini })}
        >
          <IconButton
            size="small"
            disableRipple
            color="inherit"
            sx={navbarMobileMenu}
            onClick={handleMiniSidenav}
          >
            <Icon sx={iconsStyle} fontSize="medium">
              {miniSidenav ? "menu_open" : "menu"}
            </Icon>
          </IconButton>
          <Breadcrumbs
            icon="home"
            title={route[route.length - 1]}
            route={route}
            light={light}
          />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            {/* <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton> */}
            <MDBox display="flex" color={light ? "white" : "inherit"}>
              <Link to="/profile">
                <IconButton sx={navbarIconButton} size="small" disableRipple>
                  <Icon sx={iconsStyle}>account_circle</Icon>
                </IconButton>
              </Link>

              <MDTypography
                pt={0.5}
                variant="subtitle2"
                fontWeight="light"
                opacity={0.5}
              >
                {userData.email}
              </MDTypography>
              <Badge badgeContent={count} color="primary">
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  aria-controls="notification-menu"
                  aria-haspopup="true"
                  variant="contained"
                  onClick={handleOpenMenu}
                >
                  <Icon sx={iconsStyle}>notifications</Icon>
                </IconButton>
              </Badge>
              {renderMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
      <NotificationDialog
        dialogOpen={openDialog}
        onClose={handleCloseDialog}
        data={dialogData}
      />
      <DesktopNotification
        title={title}
        tag={tag}
        body={body}
        showNotification={showNotification}
        onDisplayNotification={onDisplayNotification}
      />
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
