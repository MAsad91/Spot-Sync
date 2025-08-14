import { useState } from "react";
import {
  Autocomplete,
  Chip,
  DialogContent,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
} from "@mui/material";
import MDButton from "components/MDButton";
import { useDispatch } from "react-redux";
import MDDialog from "components/MDDialog";
import FileUploader from "components/MDFileUploader";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import { Formik } from "formik";
import { createBrandValidationSchema } from "services/validation";
import { useMaterialUIController } from "context";
import { createBrand } from "store/slice/brands/brandSlice";
import CircularIndeterminate from "components/MDLoading";
import ReactPhoneInput from "react-phone-input-material-ui";

const CreateBrand = (props) => {
  const dispatch = useDispatch();
  const { dialogOpen, onClose, updateParentData, userList, roleLevel, userData } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const handleCreateBrand = (brandData) => {
    setIsLoading(true);
    dispatch(createBrand(brandData))
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

  console.log("userList ===>", userList);

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Creating brand.. "
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
        dialogTitle="Create Owner"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              brandLogo: [],
              brandName: "",
              shortBrandName: "",
              ownerName: "",
              brandAddress: "",
              ownerEmail: "",
              ownerMobileNumber: "",
              botcopyBotId: "",
              userId: roleLevel === 90 ? userData?.userId : null,
              userType: roleLevel === 90 ? "existing" : "new",
            }}
            validationSchema={createBrandValidationSchema}
            onSubmit={(value, action) => {
              console.log("Brand Submit => ", value);
              handleCreateBrand(value);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <Stack
                      direction="row"
                      className="align-items-center gap-2 flex-wrap justify-content-center"
                      sx={{
                        "&>p": {
                          textAlign: "center",
                        },
                      }}
                    >
                      <FileUploader
                        formikProp={props}
                        name="brandLogo"
                        size={150}
                        maxFileUpload={1}
                        acceptType=".jpg, .jpeg, .png"
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      name="brandName"
                      value={props.values.brandName}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Brand Name"
                      error={
                        props.errors.brandName && props.touched.brandName
                          ? true
                          : false
                      }
                      success={
                        props.errors.brandName && props.touched.brandName
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.brandName && props.touched.brandName
                          ? props.errors.brandName
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      name="shortBrandName"
                      value={props.values.shortBrandName}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Short Brand Name"
                      error={
                        props.errors.shortBrandName &&
                        props.touched.shortBrandName
                          ? true
                          : false
                      }
                      success={
                        props.errors.shortBrandName &&
                        props.touched.shortBrandName
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.shortBrandName &&
                        props.touched.shortBrandName
                          ? props.errors.shortBrandName
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <MDInput
                      name="brandAddress"
                      value={props.values.brandAddress}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Brand Address"
                      error={
                        props.errors.brandAddress && props.touched.brandAddress
                          ? true
                          : false
                      }
                      success={
                        props.errors.brandAddress && props.touched.brandAddress
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.brandAddress && props.touched.brandAddress
                          ? props.errors.brandAddress
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <MDInput
                      name="botcopyBotId"
                      value={props.values.botcopyBotId}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Botcopy ID (Optional)"
                      error={
                        props.errors.botcopyBotId && props.touched.botcopyBotId
                          ? true
                          : false
                      }
                      success={
                        props.errors.botcopyBotId && props.touched.botcopyBotId
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.botcopyBotId && props.touched.botcopyBotId
                          ? props.errors.botcopyBotId
                          : null
                      }
                    />
                  </Grid>

                  {roleLevel === 100 ? (
                    <>
                      <Grid item xs={12}>
                        <RadioGroup
                          name="userType"
                          sx={{ flexDirection: "row" }}
                          value={props.values.userType}
                          onChange={(e) =>
                            props.setFieldValue("userType", e.target.value)
                          }
                        >
                          <FormControlLabel
                            value="new"
                            control={<Radio color="primary" />}
                            label="New User"
                          />
                          <FormControlLabel
                            value="existing"
                            control={<Radio />}
                            label="Existing User"
                          />
                        </RadioGroup>
                      </Grid>

                      {props.values.userType === "new" ? (
                        <>
                          <Grid item xs={12} md={12}>
                            <MDInput
                              name="ownerName"
                              value={props.values.ownerName}
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              label="Owner Full Name"
                              error={
                                props.errors.ownerName &&
                                props.touched.ownerName
                                  ? true
                                  : false
                              }
                              success={
                                props.errors.ownerName &&
                                props.touched.ownerName
                                  ? false
                                  : true
                              }
                              helperText={
                                props.errors.ownerName &&
                                props.touched.ownerName
                                  ? props.errors.ownerName
                                  : null
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <MDInput
                              name="ownerEmail"
                              value={props.values.ownerEmail}
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              label="Owner Email"
                              error={
                                props.errors.ownerEmail &&
                                props.touched.ownerEmail
                                  ? true
                                  : false
                              }
                              success={
                                props.errors.ownerEmail &&
                                props.touched.ownerEmail
                                  ? false
                                  : true
                              }
                              helperText={
                                props.errors.ownerEmail &&
                                props.touched.ownerEmail
                                  ? props.errors.ownerEmail
                                  : null
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <ReactPhoneInput
                              value={props.values.ownerMobileNumber}
                              onChange={(value) =>
                                props.setValues({
                                  ...props.values,
                                  ownerMobileNumber: "+" + value,
                                })
                              }
                              onBlur={props.handleBlur}
                              label="Owner Mobile Number"
                              inputProps={{
                                name: "ownerMobileNumber",
                                error: !!props.errors.ownerMobileNumber,
                                success: !props.errors.ownerMobileNumber,
                                helperText: props.errors.ownerMobileNumber,
                              }}
                              component={MDInput}
                            />
                          </Grid>
                        </>
                      ) : props.values.userType === "existing" ? (
                        <>
                          <Grid item xs={12}>
                            <Autocomplete
                              options={(userList || []).filter(
                                (user) => user.roleId.level === 90
                              )}
                              disableClearable={false}
                              getOptionLabel={(option) =>
                                `${option?.firstName} ${option?.lastName}`
                              }
                              value={
                                userList.find(
                                  (user) => user._id === props.values.userId
                                ) || null
                              }
                              onChange={(e, value) =>
                                props.setFieldValue("userId", value?._id || "")
                              }
                              renderTags={(value, getTagProps) => (
                                <Chip
                                  key={value?._id}
                                  variant="contained"
                                  label={value?.firstName}
                                  {...getTagProps({ index: 0 })}
                                />
                              )}
                              renderOption={(props, option) => (
                                <li {...props}>
                                  <div>
                                    <strong>{`${option?.firstName} ${option?.lastName}`}</strong>
                                    <br />
                                    <span style={{ color: "#888" }}>
                                      {option?.email}
                                    </span>
                                  </div>
                                </li>
                              )}
                              renderInput={(params) => (
                                <MDInput {...params} label="Select User" />
                              )}
                            />
                          </Grid>
                        </>
                      ) : null}
                    </>
                  ) : null
                  /*(
                    <>
                      <Grid item xs={12} md={12}>
                        <MDInput
                          name="ownerName"
                          value={props.values.ownerName}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          label="Owner Full Name"
                          error={
                            props.errors.ownerName && props.touched.ownerName
                              ? true
                              : false
                          }
                          success={
                            props.errors.ownerName && props.touched.ownerName
                              ? false
                              : true
                          }
                          helperText={
                            props.errors.ownerName && props.touched.ownerName
                              ? props.errors.ownerName
                              : null
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDInput
                          name="ownerEmail"
                          value={props.values.ownerEmail}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          label="Owner Email"
                          error={
                            props.errors.ownerEmail && props.touched.ownerEmail
                              ? true
                              : false
                          }
                          success={
                            props.errors.ownerEmail && props.touched.ownerEmail
                              ? false
                              : true
                          }
                          helperText={
                            props.errors.ownerEmail && props.touched.ownerEmail
                              ? props.errors.ownerEmail
                              : null
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <ReactPhoneInput
                          value={props.values.ownerMobileNumber}
                          onChange={(value) =>
                            props.setValues({
                              ...props.values,
                              ownerMobileNumber: "+" + value,
                            })
                          }
                          onBlur={props.handleBlur}
                          label="Owner Mobile Number"
                          inputProps={{
                            name: "ownerMobileNumber",
                            error: !!props.errors.ownerMobileNumber,
                            success: !props.errors.ownerMobileNumber,
                            helperText: props.errors.ownerMobileNumber,
                          }}
                          component={MDInput}
                        />
                      </Grid>
                    </>
                  )*/
                  }

                  <Grid item xs={12} className="text-right">
                    <MDButton
                      color={sidenavColor}
                      variant="contained"
                      type="submit"
                    >
                      Create
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

export default CreateBrand;
