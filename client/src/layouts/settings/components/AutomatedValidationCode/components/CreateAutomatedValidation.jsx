import {
  Autocomplete,
  Chip,
  DialogContent,
  FormControl,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import MDButton from "components/MDButton";
import { useState } from "react";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import { Formik } from "formik";
import { useMaterialUIController } from "context";
import { useDispatch, useSelector } from "react-redux";
import CircularIndeterminate from "components/MDLoading";
import { useLocation } from "react-router-dom";
import { createAutomatedValidationSchema } from "services/validation";
import { createAutomatedValidation } from "store/slice/automatedValidations/automatedValidationSlice";

const CreateAutomatedValidation = (props) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { dialogOpen, onClose, updateParentData } = props;
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

  const placesData = useSelector((state) => state.places?.selectedPlace);
  let placeId =
    placesData?._id || new URLSearchParams(location?.search).get("placeId");

  const handleCreateAutomatedValidation = (automatedValidationData) => {
    setIsLoading(true);
    dispatch(createAutomatedValidation(automatedValidationData))
      .unwrap()
      .then((res) => {
        console.log(" creation response:", res);
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
            }}
            validationSchema={createAutomatedValidationSchema}
            onSubmit={(value, action) => {
              console.log("values ===>", value);
              handleCreateAutomatedValidation({ ...value, placeId });
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
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

                  <Grid item xs={12} className="text-right">
                    {console.log(props.touched, "<<touched")}
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
