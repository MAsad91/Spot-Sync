import {
  Autocomplete,
  Chip,
  DialogContent,
  FormControl,
  Grid,
  Stack,
  Switch,
  Checkbox
} from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import { useEffect, useState } from "react";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import MDTypography from "components/MDTypography";
import { Formik, useFormikContext } from "formik";
import { createAutomatedReportValidation } from "services/validation";
import { useMaterialUIController } from "context";
import { useDispatch, useSelector } from "react-redux";
import CircularIndeterminate from "components/MDLoading";
import { createAutomatedReport } from "store/slice/automatedReports/automatedSlice";
import { getPlaces } from "store/slice/places/placeSlice";
import MDBadge from "components/MDBadge";

const CreateAutomatedReports = (props) => {
  const dispatch = useDispatch();
  const { dialogOpen, onClose } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [isTransaction, setIsTransaction] = useState(true);
  const [isRefund, setIsRefund] = useState(true)
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  let placesData = useSelector((state) => state.places.placeData).filter(
    (item) => item.status === 10
  );

  useEffect(() => {
    dispatch(getPlaces());
  }, [dispatch]);

  const handleCreateAutomatedReport = (automatedReportData) => {
    setIsLoading(true);
    dispatch(createAutomatedReport(automatedReportData))
      .unwrap()
      .then((res) => {
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
          onClose();
        }
      })
      .catch((err) => {
        console.error("Error creating:", err);
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

  const CustomSwitch = ({ name, disable = false }) => {
    const { getFieldProps, setFieldValue } = useFormikContext();

    const handleChange = (event) => {
      setFieldValue(name, event.target.checked);
    };

    return (
      <Switch
        {...getFieldProps(name)}
        checked={getFieldProps(name).value}
        onChange={handleChange}
        disabled={disable}
      />
    );
  };

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Creating automated report.. "
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
        dialogTitle="Create Automated Report"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              placeIds: [],
              toEmail: "",
              ccEmails: [],
              isDaily: true,
              isWeekly: false,
              isMonthly: false,
              isTransaction: true,
              isRefund: true
            }}
            validationSchema={createAutomatedReportValidation}
            onSubmit={(value, action) => {
              handleCreateAutomatedReport(value);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={placesData}
                        getOptionLabel={(option) =>
                          option.parkingCode ?? option
                        }
                        renderOption={(props, option) => (
                          <li {...props}>
                            <div>
                              <MDBadge
                                badgeContent={
                                  <p>{option.parkingCode.toString()}</p>
                                }
                                color="secondary"
                                variant="gradient"
                                size="md"
                              />
                              {" | "}
                              {option?.google?.formatted_address}
                            </div>
                          </li>
                        )}
                        name="placeIds"
                        autoHighlight
                        disableClearable
                        size="small"
                        value={props.values.placeIds.map((id) =>
                          placesData.find((place) => place._id === id)
                        )}
                        onChange={(_, newValue) => {
                          props.setFieldValue(
                            "placeIds",
                            newValue.map((place) => place._id)
                          );
                        }}
                        renderInput={(params) => (
                          <MDInput
                            label="Place"
                            fullWidth
                            inputProps={{
                              ...params.inputProps,
                              autoComplete: "new-password",
                            }}
                            {...params}
                            error={
                              props.errors.placeIds && props.touched.placeIds
                                ? true
                                : false
                            }
                            helperText={
                              props.errors.placeIds && props.touched.placeIds
                                ? props.errors.placeIds
                                : null
                            }
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      name="toEmail"
                      value={props?.values?.toEmail}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="To Email"
                      error={
                        props.errors.toEmail && props.touched.toEmail
                          ? true
                          : false
                      }
                      success={
                        props.errors.toEmail && props.touched.toEmail
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.toEmail && props.touched.toEmail
                          ? props.errors.toEmail
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <Autocomplete
                        multiple
                        disableClearable
                        name="ccEmails"
                        value={props.values.ccEmails}
                        options={[]}
                        onChange={(event, newValue) => {
                          props.setFieldValue("ccEmails", newValue);
                        }}
                        onBlur={props.handleBlur}
                        freeSolo
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="contained"
                              label={option}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <MDInput
                            label="CC Emails"
                            fullWidth={true}
                            {...params}
                            error={
                              props.errors.ccEmails && props.touched.ccEmails
                                ? true
                                : false
                            }
                            helperText={
                              props.errors.ccEmails && props.touched.ccEmails
                                ? props.errors.ccEmails
                                : null
                            }
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack
                      direction="row"
                      className="gap-2 justify-content-between"
                    >
                      <MDBox
                        className="flex-grow-1"
                        sx={{
                          "& :not(:first-of-type)": {
                            mb: 1.6,
                          },
                        }}
                      >
                        <MDTypography variant="h6" sx={{ mb: 1.3 }}>
                          Report Frequency
                        </MDTypography>
                        <MDTypography variant="subtitle2" gutterBottom>
                          Daily
                        </MDTypography>
                        <MDTypography variant="subtitle2" gutterBottom>
                          Weekly (Coming Soon)
                        </MDTypography>
                        <MDTypography variant="subtitle2" gutterBottom>
                          Monthly (Coming Soon)
                        </MDTypography>
                      </MDBox>
                      <MDBox className="flex-grow-1">
                        <MDTypography variant="h6" className="mb-1">
                          Action
                        </MDTypography>
                        <Stack
                          direction="row"
                          className="gap-2 mx-2 justify-content-left align-items-center"
                        >
                          <CustomSwitch name="isDaily" disable={true} />
                        </Stack>
                        <Stack
                          direction="row"
                          className="gap-2 mx-2 justify-content-left align-items-center"
                        >
                          <CustomSwitch name="isWeekly" disable={true} />
                        </Stack>
                        <Stack
                          direction="row"
                          className="gap-2 mx-2 justify-content-left align-items-center"
                        >
                          <CustomSwitch name="isMonthly" disable={true} />
                        </Stack>
                      </MDBox>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} className="text-right">
                    {props.errors.email_setting &&
                      (props.touched.isDaily || props.touched.isMonthly) && (
                        <div style={{ color: "red" }}>
                          {props.errors.email_setting}
                        </div>
                      )}
                  </Grid>
                  <Grid item xs={6}>
                    <MDBox display="flex" alignItems="center" ml={-1}>
                      <Checkbox
                        id="isTransaction"
                        name="isTransaction"
                        value={props.values.isTransaction}
                        checked={props.values.isTransaction}
                        onClick={() => {
                          props.setFieldValue('isTransaction', !props.values.isTransaction);
                        }}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        &nbsp;Is Transaction Report&nbsp;
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <MDBox display="flex" alignItems="center" ml={-1}>
                      <Checkbox
                        id="isRefund"
                        name="isRefund"
                        value={props.values.isRefund}
                        checked={props.values.isRefund}
                        onClick={() => {
                          props.setFieldValue('isRefund', !props.values.isRefund);
                        }}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        &nbsp;Is Refund Report&nbsp;
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} className="text-left">
                    {props.errors.transaction_or_refund &&
                      (props.touched.isTransaction || props.touched.isRefund) && (
                        <div style={{ color: "red" }}>
                          {props.errors.transaction_or_refund}
                        </div>
                      )}
                  </Grid>
                  <Grid item xs={12} className="text-right">
                    <MDButton
                      color={sidenavColor}
                      variant="gradient"
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

export default CreateAutomatedReports;
