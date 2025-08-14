import { useCallback, useEffect, useMemo, useState } from "react";
import { DialogContent, Grid, Autocomplete, Chip } from "@mui/material";
import MDButton from "components/MDButton";
import { useSelector, useDispatch } from "react-redux";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import { Formik } from "formik";
import { debounce } from "lodash";
import { createUserValidationSchema } from "services/validation";
import { useMaterialUIController } from "context";
import CircularIndeterminate from "components/MDLoading";
import { createUsers, updateUser } from "store/slice/users/userSlice";
import { getRoles } from "store/slice/roles/roleSlice";
import { getPlaces } from "store/slice/places/placeSlice";
import ReactPhoneInput from "react-phone-input-material-ui";

const CreateUser = (props) => {
  const dispatch = useDispatch();
  const { editUserData, dialogOpen, onClose, updateParentData } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [rolesData, setRolesData] = useState([]);

  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });
  const getPlacesData = useCallback(async () => {
    dispatch(getPlaces());
  }, [dispatch]);

  const debounceFn = useMemo(
    () => debounce(getPlacesData, 1000),
    [getPlacesData]
  );

  useEffect(() => {
    debounceFn();
  }, [debounceFn]);

  const locations = useSelector((state) => state.places?.placesList);

  const handleGetRoles = () => {
    dispatch(getRoles())
      .unwrap()
      .then((res) => {
        if (res?.success) {
          const roles = res?.roles.filter((role) => role.level === 80);
          setRolesData(roles || []);
        }
      })
      .catch((err) => {
        console.error("Error creating brand:", err);
      });
  };

  useState(() => {
    handleGetRoles();
  }, []);

  const handleCreateUser = (userData) => {
    setIsLoading(true);
    dispatch(createUsers(userData))
      .unwrap()
      .then((res) => {
        const success = res?.success;
        updateParentData();
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
          onClose();
        }
      })
      .catch((err) => {
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

  const handleUpdateUser = (userData) => {
    setIsLoading(true);
    dispatch(updateUser(userData))
      .unwrap()
      .then((res) => {
        const success = res?.success;
        updateParentData();
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
          onClose();
        }
      })
      .catch((err) => {
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

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text={editUserData ? "Updating User.. " : "Creating User.. "}
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
        dialogTitle={editUserData ? "Update User" : "Create User"}
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              userId: editUserData ? editUserData?._id : "",
              firstName: editUserData ? editUserData?.firstName : "",
              lastName: editUserData ? editUserData?.lastName : "",
              email: editUserData ? editUserData?.email : "",
              mobile: editUserData ? editUserData?.mobile : "",
              roleId: editUserData ? editUserData?.roleId?._id : "",
              locations: editUserData
                ? editUserData?.locations?.map((location) => location._id)
                : [],
            }}
            validationSchema={createUserValidationSchema}
            onSubmit={(values) => {
              const userData = {
                ...values,
                locations: values.locations,
              };

              if (!editUserData) {
                handleCreateUser(userData);
              } else {
                handleUpdateUser(userData);
              }
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12} md={6}>
                    <MDInput
                      name="firstName"
                      value={props.values.firstName}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="First Name"
                      error={
                        props.errors.firstName && props.touched.firstName
                          ? true
                          : false
                      }
                      success={
                        props.errors.firstName && props.touched.firstName
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.firstName && props.touched.firstName
                          ? props.errors.firstName
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      name="lastName"
                      value={props.values.lastName}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Last Name"
                      error={
                        props.errors.lastName && props.touched.lastName
                          ? true
                          : false
                      }
                      success={
                        props.errors.lastName && props.touched.lastName
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.lastName && props.touched.lastName
                          ? props.errors.lastName
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      name="email"
                      value={props.values.email}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      disabled={editUserData}
                      label="Email"
                      error={
                        props.errors.email && props.touched.email ? true : false
                      }
                      success={
                        props.errors.email && props.touched.email ? false : true
                      }
                      helperText={
                        props.errors.email && props.touched.email
                          ? props.errors.email
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ReactPhoneInput
                      value={props.values.mobile}
                      onChange={(value) =>
                        props.setValues({
                          ...props.values,
                          mobile: "+" + value,
                        })
                      }
                      onBlur={props.handleBlur}
                      label="Mobile"
                      inputProps={{
                        name: "mobile",
                        error: !!props.errors.mobile,
                        success: !props.errors.mobile,
                        helperText: props.errors.mobile,
                      }}
                      component={MDInput}
                      disabled={editUserData}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={rolesData}
                      getOptionLabel={(option) => option.title ?? ""}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <div>{option.title}</div>
                        </li>
                      )}
                      name="roleId"
                      autoHighlight
                      disableClearable
                      size="small"
                      value={
                        rolesData.find(
                          (role) => role._id === props.values.roleId
                        ) ?? null
                      }
                      onChange={(e, value) =>
                        props.setFieldValue("roleId", value._id)
                      }
                      renderInput={(params) => (
                        <MDInput
                          {...params}
                          label="Select Role"
                          error={
                            props.errors.roleId && props.touched.roleId
                              ? true
                              : false
                          }
                          helperText={
                            props.errors.roleId && props.touched.roleId
                              ? props.errors.roleId
                              : null
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        options={locations.length > 1 ? ["All", ...locations] : locations}
                        disableClearable={false}
                        getOptionLabel={(option) =>
                          option === "All" ? "All Places" : `(${option?.parkingCode}) ${option?.lotName}`
                        }
                        value={locations.filter((location) =>
                          props.values.locations.includes(location._id)
                        )}
                        onChange={(e, value) =>{
                          if (value.includes("All")) {
                            props.setFieldValue("locations", locations.map(location => location._id));
                          } else {
                            props.setFieldValue("locations", value.map((v) => v._id));
                          }
                        }}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              key={index}
                              variant="contained"
                              label={option?.parkingCode}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <MDInput {...params} label="Locations" />
                        )}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <MDButton
                      color={sidenavColor}
                      fullWidth
                      type="submit"
                      disabled={isLoading}
                    >
                      {editUserData ? "Update" : "Create"}
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

export default CreateUser;
