import {
  Autocomplete,
  Chip,
  DialogContent,
  FormControl,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
} from "@mui/material";
import MDButton from "components/MDButton";
import { useState } from "react";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import { Formik } from "formik";
import * as Yup from "yup";
import { useMaterialUIController } from "context";
import { useDispatch, useSelector } from "react-redux";
import CircularIndeterminate from "components/MDLoading";
import { useLocation } from "react-router-dom";
import { createAutomatedValidation } from "store/slice/automatedValidations/automatedValidationSlice";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import { DateRangePicker } from "rsuite";
import moment from "moment";

const CreateAutomatedValidation = (props) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { ratesData, dialogOpen, onClose, updateParentData } = props;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const [isLoading, setIsLoading] = useState(false);
  const [presetCodes, setPresetCodes] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });

  const placesData = useSelector((state) => state.places?.selectedPlace);
  let placeId =
    placesData?._id || new URLSearchParams(location?.search).get("placeId");


  const CustomPresetCodes = ['Beer', 'Bear', 'Tree', 'Fish','Rock', 'Blue', 'Lake', 'Twig', 'Deer', 'Fawn',  'Hare',  'Pony',  'Oars',  'Rack', 'Cows', 'Pigs', 'Feed', 'Logs', 'Silo', 'Land', 'Wild', 'West', 'Kagy', 'Koch', 'Rain', 'Bank','Gold', 'Cats', 'Park','Hunt', 'Walk', 'Fort', 'Howl',  'Grit', 'Bird','Hawk', 'Play', 'Pine','Ruck', 'Rail','Tent', 'Boot', 'Cold','Snow', 'Wind','Warm','Wolf','Dirt','Team'];

  function getRandomCodes(numCodes) {
    const randomCodes = [];
    for (let i = 0; i < numCodes; i++) {
      const randomIndex = Math.floor(Math.random() * CustomPresetCodes.length);
      randomCodes.push(CustomPresetCodes[randomIndex]);
    }
    return randomCodes;
  }

  const handleCreateAutomatedValidation = (automatedValidationData) => {
    setIsLoading(true);
    dispatch(createAutomatedValidation(automatedValidationData))
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
          updateParentData();
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

  const createAutomatedValidationSchema = Yup.object().shape({
    toEmail: Yup.string()
      .email("Please enter a valid Email")
      .required("Email is required!"),
    slackChannel: Yup.string(),
    ccEmails: Yup.array()
      .of(Yup.string().email("Please enter valid Email"))
      .optional(),
    validationCodes: presetCodes ? Yup.array().optional() : Yup.array().min(1, "Validation code is required").required("Validation code is required"),
    quantity: Yup.string().required().label("Quantity"),
    discount: Yup.string().required().label("Discount"),
    validFrom: Yup.string().required().label("Valid From"),
    validUntil: Yup.string().required().label("Valid Until"),
    rateId: Yup.array().min(1, "Rate is required").required("Rate is required"),
  });

  return (
    <>
      <CircularIndeterminate
        type="full"
        size={20}
        text="Creating automated validation.. "
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
        dialogTitle="Create Automated Validation"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              toEmail: "",
              ccEmails: [],
              duration: "daily",
              presetCodes: false,
              validationCodes: [],
              validFrom: '',
              validUntil: '',
              rateId: [],
              placeId: '',
              discount: '',
              quantity: '',
              slackChannel: '',
            }}
            validationSchema={createAutomatedValidationSchema}
            onSubmit={(value, action) => {
              let bodyData
              value?.presetCodes ? bodyData = {
                ...value, validationCodes: CustomPresetCodes, rateId: value?.rateId?.map(v => v?._id),
              } : bodyData = {
                ...value, rateId: value?.rateId?.map(v => v?._id),
              }
              handleCreateAutomatedValidation({ ...bodyData, placeId });
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <MDBox display="flex" alignItems="center" ml={-1}>
                      <Checkbox
                        id="presetCode"
                        name="presetCode"
                        value={props.values.presetCodes}
                        checked={props.values.presetCodes}
                        onClick={() => {
                          setPresetCodes(!props.values.presetCodes)
                          props.setFieldValue('presetCodes', !props.values.presetCodes);
                        }}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        &nbsp;Use Preset Codes&nbsp;
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  {!props.values.presetCodes &&
                    <Grid item xs={12} >
                      <Autocomplete
                        multiple
                        disableClearable
                        freeSolo
                        name="validationCodes"
                        value={props.values?.validationCodes}
                        options={[]}
                        onChange={(event, newValues) => {
                          props.setValues({
                            ...props?.values,
                            validationCodes: newValues
                          });
                        }}

                        renderInput={(params) => (
                          <MDInput label="Validation codes" fullWidth={true} {...params}
                            error={
                              props.errors.validationCodes && props.touched.validationCodes
                                ? true
                                : false
                            }
                            success={
                              props.errors.validationCodes && props.touched.validationCodes
                                ? false
                                : true
                            }
                            helperText={
                              props.errors.validationCodes && props.touched.validationCodes
                                ? props.errors.validationCodes
                                : null
                            }
                          />
                        )}
                      />
                    </Grid>}
                  <Grid item xs={12} >
                    <Autocomplete
                      multiple
                      disableClearable
                      name="rateId"
                      value={props.values?.rateId}
                      options={ratesData}
                      onChange={(event, newValues) => {
                        props.setValues({
                          ...props?.values,
                          rateId: newValues
                        });
                      }}
                      onBlur={props.handleBlur}
                      getOptionLabel={(option) => `${option?.displayName}`}
                      renderInput={(params) => (
                        <MDInput label="Rates" fullWidth={true} {...params}
                          helperText={
                            props.errors.rateId && props.touched.rateId
                              ? props.errors.rateId
                              : null
                          } />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={index}
                            variant="contained"
                            label={option?.displayName}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <RadioGroup
                      name="duration"
                      sx={{ flexDirection: "row" }}
                      value={props.values.duration || ""}
                      onChange={(e) =>
                        props.setFieldValue("duration", e.target.value)
                      }
                    >
                      <FormControlLabel
                        value="daily"
                        control={<Radio />}
                        label="Daily"
                      />
                      <FormControlLabel
                        value="weekly"
                        control={<Radio />}
                        label="Weekly"
                      />
                      <FormControlLabel
                        value="monthly"
                        control={<Radio />}
                        label="Monthly"
                      />
                      <FormControlLabel
                        value="yearly"
                        control={<Radio />}
                        label="Yearly"
                      />
                    </RadioGroup>
                  </Grid>

                  <Grid item xs={12} md={12} lg={12}>
                    <FormControl fullWidth>
                      <DateRangePicker
                        id="dateDuration"
                        placeholder="Valid From - Valid Until"
                        character=" - "
                        size="lg"
                        format="dd-MM-yyyy"
                        showMeridian
                        value={
                          props.values.validFrom && props.values.validUntil
                            ? [
                              new Date(props.values.validFrom),
                              new Date(props.values.validUntil),
                            ]
                            : undefined
                        }
                        ranges={[]}
                        onChange={(value) => {
                          if (value && value.length === 2) {
                            props.setFieldValue(
                              "validFrom",
                              moment(value[0]).format()
                            );
                            props.setFieldValue(
                              "validUntil",
                              moment(value[1]).format()
                            );
                          } else {
                            props.setFieldValue("validFrom", null);
                            props.setFieldValue("validUntil", null);
                          }
                        }}
                        onBlur={props.handleBlur}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <MDInput
                      name="quantity"
                      value={props.values.quantity}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Number Of Codes / Quantity"
                      error={
                        props.errors.quantity && props.touched.quantity
                          ? true
                          : false
                      }
                      success={
                        props.errors.quantity && props.touched.quantity
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.quantity && props.touched.quantity
                          ? props.errors.quantity
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      name="discount"
                      value={props.values.discount}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Discount In Percentage"
                      error={
                        props.errors.discount && props.touched.discount
                          ? true
                          : false
                      }
                      success={
                        props.errors.discount && props.touched.discount
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.discount && props.touched.discount
                          ? props.errors.discount
                          : null
                      }
                    />
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
                          props.setValues({
                            ...props?.values,
                            ccEmails: newValue,
                          });
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
                    <MDInput
                      name="slackChannel"
                      value={props?.values?.slackChannel}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Webhook"
                      error={
                        props.errors.slackChannel && props.touched.slackChannel
                          ? true
                          : false
                      }
                      success={
                        props.errors.slackChannel && props.touched.slackChannel
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.slackChannel && props.touched.slackChannel
                          ? props.errors.slackChannel
                          : null
                      }
                    />
                  </Grid>


                  <Grid item xs={12} className="text-right">

                    {props.errors.email_setting &&
                      (props.touched.isDaily || props.touched.isMonthly) && (
                        <div style={{ color: "red" }}>
                          {props.errors.email_setting}
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

export default CreateAutomatedValidation;
