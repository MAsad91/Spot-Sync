import { DialogContent, Grid } from "@mui/material";
import MDButton from "components/MDButton";
import { useState, useLayoutEffect } from "react";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import { Formik } from "formik";
import { createRolesValidationSchema } from "services/validation";
import { useMaterialUIController } from "context";
import { updateRole, getRoleById } from "store/slice/roles/roleSlice";
import { useDispatch } from "react-redux";
import CircularIndeterminate from "components/MDLoading";
import PlacePermissionCard from "./PermissionCards/PlacePermissionCard";
import BrandPermissionCard from "./PermissionCards/BrandPermissionCard";
import RatePermissionCard from "./PermissionCards/RatePermissionCard";
import PricingPermissionCard from "./PermissionCards/PricingTierPermissionCard";
import UsersPermissionCard from "./PermissionCards/MyUsersPermissionCard";
import ValidationPermissionCard from "./PermissionCards/ValidationPermissionCard";
import QRCodePermissionCard from "./PermissionCards/QRCodePermissionCard";
import SettingPermissionCard from "./PermissionCards/SettingPermissionCard";
import SubscriptionPermissionCard from "./PermissionCards/SubscriptionPermissionCard";
import ReservationPermissionCard from "./PermissionCards/ReservationPermissionCard";
import TransactionPermissionCard from "./PermissionCards/TransactionPermissionCard";
import DashboardPermissionCard from "./PermissionCards/DashboardPermissionCard";
import RolePermissionCard from "./PermissionCards/RolePermissionCard";
import ReportPermissionCard from "./PermissionCards/ReportPermissionCard";
import ProfilePermissionCard from "./PermissionCards/ProfilePermissionCard";
import AssignRatePermissionCard from "./PermissionCards/AssignRatePermissionCard";
import PermitPermissionCard from "./PermissionCards/PermitPermissionCard";

const UpdateRoles = (props) => {
  const dispatch = useDispatch();
  const { dialogOpen, onClose, data } = props;
  console.log(data);
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState();
  const [roleId, setRoleId] = useState();
  const [title, setTitle] = useState();
  useLayoutEffect(() => {
    if (data && data.modules) {
      setModules(data.modules);
      setRoleId(data._id);
      setTitle(data.title);
    }
  }, [data]);

  console.log(data.modules, modules, 31);

  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });
  console.log(modules);
  const handleUpdateRole = (roleData) => {
    setIsLoading(true);
    dispatch(updateRole(roleData))
      .unwrap()
      .then((res) => {
        console.log("Role creation response:", res);
        const success = res?.success;
        setIsLoading(false);
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        if (success) {
          console.log(res);
          setModules(res?.updatedRole?.modules);
          setTitle(res?.updatedRole?.title);
          //  updateParentData();
          onClose();
        }
      })
      .catch((err) => {
        console.error("Error creating brand:", err);
        setIsLoading(false);
        setNotification({
          ...notification,
          color: "error",
          title: "Error",
          content: err?.message,
          icon: "warning",
          show: true,
        });
      });
  };

  console.log("roleData ===>", data);

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Updating role.. "
        open={isLoading}
      />
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />
      <MDDialog
        dialogTitle="Update Role"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              title: title,
            }}
            validationSchema={createRolesValidationSchema}
            onSubmit={(value, action) => {
              handleUpdateRole({ ...value, modules, roleId });
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <MDInput
                      name="title"
                      value={props.values.title}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Role Title"
                      error={
                        props.errors.title && props.touched.title ? true : false
                      }
                      success={
                        props.errors.title && props.touched.title ? false : true
                      }
                      helperText={
                        props.errors.title && props.touched.title
                          ? props.errors.title
                          : null
                      }
                    />
                  </Grid>
                  {data.level === 100 ? (
                    <>
                      <Grid item sx={{ width: "100%" }}>
                        <ReportPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={12}>
                        <BrandPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={{ width: "100%" }}>
                        <ReservationPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={{ width: "100%" }}>
                        <PermitPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={12}>
                        <PlacePermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={12}>
                        <RatePermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={{ width: "100%" }}>
                        <AssignRatePermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={12}>
                        <SubscriptionPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={{ width: "100%" }}>
                        <TransactionPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={12}>
                        <QRCodePermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={12}>
                        <PricingPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={12}>
                        <RolePermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={12}>
                        <UsersPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={12}>
                        <QRCodePermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={12}>
                        <ValidationPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={{ width: "100%" }}>
                        <ProfilePermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                      <Grid item sx={12}>
                        <SettingPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                    {modules?.Brand_view &&
                      <Grid item sx={12}>
                        <BrandPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                    {modules?.Report_view &&
                      <Grid item sx={{ width: "100%" }}>
                        <ReportPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                    {modules?.Reservation_view &&
                      <Grid item sx={{ width: "100%" }}>
                        <ReservationPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                    {modules?.Permit_view &&
                      <Grid item sx={{ width: "100%" }}>
                        <PermitPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                    {modules?.Transaction_view &&
                      <Grid item sx={{ width: "100%" }}>
                        <TransactionPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                    {modules?.Place_view &&
                      <Grid item sx={12}>
                        <PlacePermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                    {modules?.Rate_view &&
                      <Grid item sx={12}>
                        <RatePermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                    {modules?.Assign_rate_view &&
                      <Grid item sx={{ width: "100%" }}>
                        <AssignRatePermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                    {modules?.Pricing_view &&
                      <Grid item sx={12}>
                        <PricingPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                    {modules?.Role_view &&
                    <Grid item sx={12}>
                      <RolePermissionCard
                        modules={modules}
                        setModules={setModules}
                      />
                    </Grid>
                    }
                    {modules?.MyUser_view &&
                      <Grid item sx={12}>
                        <UsersPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                    {modules?.QRCode_view &&
                      <Grid item sx={12}>
                        <QRCodePermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                    {modules?.Validation_view &&
                      <Grid item sx={12}>
                        <ValidationPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                    {modules?.Subscription_view &&
                      <Grid item sx={12}>
                        <SubscriptionPermissionCard
                          modules={modules}
                          setModules={setModules}
                        />
                      </Grid>
                    }
                  </>
                  )}

                  <Grid item xs={12} className="text-right">
                    <MDButton
                      color={sidenavColor}
                      variant="gradient"
                      type="submit"
                    >
                      Update
                    </MDButton>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </DialogContent>
      </MDDialog>
    </>
  );
};

export default UpdateRoles;
