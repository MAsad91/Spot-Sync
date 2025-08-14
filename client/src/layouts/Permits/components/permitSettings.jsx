import {
  DialogContent,
  Grid,
  Autocomplete,
  Chip,
  Switch,
} from "@mui/material";
import { Formik } from "formik";
import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import MDInput from "components/MDInput";
import { useMaterialUIController } from "context";
import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CircularIndeterminate from "components/MDLoading";
import MDTypography from "components/MDTypography";
import {
  createPermitsOption,
  updatePermitsOption,
} from "store/slice/permitsOptions/permitsOptionSlice";
import { get } from "lodash";

const PermitSettings = (props) => {
  const formikRef = useRef(null);
  const dispatch = useDispatch();
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const { 
    dialogOpen,
    onClose,
  } = props;

  const selectedPlace = useSelector((state) => state.places?.selectedPlace);
  const ratesByPlace = useSelector((state) => state.rates?.ratesByPlace);
  const permitsOptions = useSelector((state) => state.permitsOptions?.permitsOptions);
  const loading = useSelector((state) => state.permitsOptions?.loading);

  const [isLoading, setIsLoading] = useState(false);
  const [customRates, setCustomRates] = useState([]);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  useEffect(() => {
    if (ratesByPlace) {
      const customRates = ratesByPlace.filter(rate => rate.rateType === 'custom')

      setCustomRates(customRates);
    }
  }, [ratesByPlace]);

  useEffect(() => {
    if (permitsOptions && permitsOptions.length > 0) {
      formikRef?.current?.setFieldValue(
        "customRates",
        get(permitsOptions, "[0].customRates", [])
      );
      formikRef?.current?.setFieldValue(
        "customConfirmationMessage",
        get(permitsOptions, "[0].customConfirmationMessage", "")
      );
      formikRef?.current?.setFieldValue(
        "displayUnitNumber",
        get(permitsOptions, "[0].displayUnitNumber", false)
      );
      formikRef?.current?.setFieldValue(
        "selectedPermitType",
        get(permitsOptions, "[0]", "")
      );
      formikRef?.current?.setFieldValue(
        "id",
        get(permitsOptions, "[0]._id", "")
      );
    }
  }, [permitsOptions]);

  const handleSavePermitsOption = async (params) => {
    try {
      setIsLoading(true);
      const res = await dispatch(updatePermitsOption(params)).unwrap();
      const success = res?.success;
      setNotification({
        ...notification,
        color: success ? "success" : "error",
        title: success ? "Success" : "Error",
        content: res?.message || "An unexpected error occurred.",
        icon: success ? "check" : "warning",
        show: true,
      });
      // if (success) {
      //   onClose();
      // }
    } catch (err) {
      console.error("Error creating permit:", err);
      setNotification({
        ...notification,
        color: "error",
        title: "Error",
        content: err?.message || "An error occurred while creating permit.",
        icon: "warning",
        show: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text={"Please wait..!"}
        open={isLoading || loading}
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
        dialogTitle="Permit Settings"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            innerRef={formikRef}
            initialValues={{
              placeId: selectedPlace?._id,
              id: get(permitsOptions, "[0]._id", ""),
              newPermitType: "",
              customRates: get(permitsOptions, "[0].customRates", []),
              customConfirmationMessage: get(permitsOptions, "[0].customConfirmationMessage", ""),
              selectedPermitType: get(permitsOptions, "[0]", []),
              displayUnitNumber: get(permitsOptions, "[0].displayUnitNumber", false),
            }}
            enableReinitialize
            // validationSchema={CreatePermitSchema}
            onSubmit={(value, action) => {
              const payload = {
                id: value.id,
                customRates: value.customRates,
                customConfirmationMessage: value.customConfirmationMessage,
                displayUnitNumber: value.displayUnitNumber,
              };

              handleSavePermitsOption(payload);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item className="mb-4" xs={12}>
                    <MDInput
                      name="newPermitType"
                      value={props.values.newPermitType}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="New Permit Type"
                      error={!!props.errors.newPermitType && props.touched.newPermitType}
                      success={!(props.errors.newPermitType && props.touched.newPermitType)}
                      helperText={props.errors.newPermitType && props.touched.newPermitType ? props.errors.newPermitType : ''}
                    />

                    <Grid className="d-flex justify-content-end">
                      <MDButton
                        color={sidenavColor}
                        variant="contained"
                        disabled={props.values.newPermitType.trim() === ""}
                        onClick={() => {
                          if (props.values.newPermitType.trim() !== "") {
                            dispatch(
                              createPermitsOption({
                                placeId: selectedPlace._id,
                                type: props.values.newPermitType.trim(),
                              })
                            ).then((res) => {
                              const success = res?.payload?.success;

                              if (!success) {
                                setNotification({
                                  ...notification,
                                  color: "error",
                                  title: "error",
                                  content: res?.payload?.message,
                                  icon: "warning",
                                  show: true,
                                });
                              }
                            });
                          }
                        }}
                        className="mt-2"
                      >
                        Add New Type
                      </MDButton>
                    </Grid>
                  </Grid>

                  {permitsOptions && permitsOptions.length > 0 && (
                    <Grid container className="ms-0" spacing={2} >
                      <Grid item xs={12} md={12} lg={12}>
                        <Autocomplete
                          disableClearable
                          name="Permit Type"
                          value={props.values?.selectedPermitType || []}
                          options={permitsOptions?.filter(
                            (option) => !props.values?.selectedPermitType?.type !== option.type
                          )}
                          onChange={(event, newValue) => {
                            props.setValues({
                              ...props?.values,
                              selectedPermitType: newValue,
                              customConfirmationMessage: newValue.customConfirmationMessage,
                              customRates: newValue.customRates,
                              id: newValue._id,
                              displayUnitNumber: newValue.displayUnitNumber,
                            });
                          }}
                          onBlur={props.handleBlur}
                          getOptionLabel={(option) => option.type} // Display the label (rate name)
                          renderInput={(params) => (
                            <MDInput label="Permit Type" fullWidth={true} {...params} />
                          )}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                key={index}
                                variant="contained"
                                label={option.type}
                                {...getTagProps({ index })}
                              />
                            ))
                          }
                        />
                      </Grid>

                      <Grid className="d-flex justify-content-between ms-1" item xs={12}>
                        <MDTypography variant="h6" fontWeight="regular">
                          Display Unit Number
                        </MDTypography>
                        <Switch
                          checked={props.values.displayUnitNumber}
                          onChange={(e) => {
                            props.setValues({
                              ...props.values,
                              displayUnitNumber: e.target.checked,
                            });
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={12} lg={12}>
                        <Autocomplete
                          multiple
                          disableClearable
                          name="customRates"
                          value={props.values?.customRates || []}
                          options={customRates.filter(
                            (option) => !props.values?.customRates?.includes(option)
                          )}
                          onChange={(event, newValues) => {
                            props.setValues({
                              ...props?.values,
                              customRates: newValues
                            });
                          }}
                          onBlur={props.handleBlur}
                          getOptionLabel={(option) => option.displayName} // Display the label (rate name)
                          renderInput={(params) => (
                            <MDInput label="Custom Rate" fullWidth={true} {...params} />
                          )}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                key={index}
                                variant="contained"
                                label={option.displayName}
                                {...getTagProps({ index })}
                              />
                            ))
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <MDInput
                          name="customConfirmationMessage"
                          value={props.values.customConfirmationMessage}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          label="Custom Confirmation Message"
                          error={!!props.errors.customConfirmationMessage && props.touched.customConfirmationMessage}
                          success={!(props.errors.customConfirmationMessage && props.touched.customConfirmationMessage)}
                          helperText={props.errors.customConfirmationMessage && props.touched.customConfirmationMessage ? props.errors.customConfirmationMessage : ''}
                        />
                      </Grid>

                      <Grid item xs={12} className="text-right">
                        <MDButton
                          color={sidenavColor}
                          variant="contained"
                          type="submit"
                        >
                          Save
                        </MDButton>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </form>
            )}
          </Formik>
        </DialogContent>
      </MDDialog>
    </>
  );
};

export default PermitSettings;
