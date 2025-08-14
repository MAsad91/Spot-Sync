import { AppBar, IconButton, Menu, MenuItem, Toolbar } from "@mui/material";
import MDTypography from "components/MDTypography";
import React from "react";
import { AccountCircle } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { customerLogout } from "store/slice/customer/customerSlice";
import CircularIndeterminate from "components/MDLoading";
const Header = ({ userName }) => {
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [loading, setLoading] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handelLogout = () => {
    setLoading(true);
    dispatch(customerLogout());
    window.location.href = "/parker-login";
  };
  return (
    <AppBar position="static">
      <Toolbar>
        <MDTypography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {userName}
        </MDTypography>

        <div>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handelLogout}>Logout</MenuItem>
          </Menu>
        </div>
      </Toolbar>
      <CircularIndeterminate type="full" size={20} text=" " open={loading} />
    </AppBar>
  );
};

export default Header;
