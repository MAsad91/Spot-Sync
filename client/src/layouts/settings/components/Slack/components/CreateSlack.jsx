import {
  DialogContent,
  Grid,
  InputLabel,
  MenuItem,
  FormControl,
} from "@mui/material";

import { Formik } from "formik";

import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";
import MDDropDown from "components/MDDropDown";
import { createSlackValidation } from "services/validation";
import { useMaterialUIController } from "context";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import { createSlack } from "store/slice/slack/slackSlice";

const CreateSlack = (props) => {
  const { dialogOpen, onClose, updateParentData } = props;
  const dispatch = useDispatch();
  const location = useLocation();
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

  let placeId = new URLSearchParams(location?.search).get("placeId");
  if (!placeId) {
    placeId = localStorage.getItem("placeId");
  }

  const handleCreateSlack = (slackData) => {
    console.log("slackData ===>", slackData);
    setIsLoading(true);
    dispatch(createSlack(slackData))
      .unwrap()
      .then((res) => {
        console.log("Slack creation response:", res);
        const success = res?.success;
        setIsLoading(false);
        updateParentData();
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        if (success) {
          console.log("res=>");
          onClose();
        }
      })
      .catch((err) => {
        console.error("Error creating Slack:", err);
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
        text="Creating Slack.. "
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
        dialogTitle="Create Notification"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              placeId: placeId,
              purpose: "",
              channelName: "",
              workSpace: "",
              webhookURL: "",
            }}
            validationSchema={createSlackValidation}
            onSubmit={(value, action) => {
              console.log("values", value);
              handleCreateSlack(value);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">
                        Select Purpose
                      </InputLabel>
                      <MDDropDown
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="Select Purpose"
                        name={"purpose"}
                        value={props.values.purpose}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        error={
                          props.errors.purpose && props.touched.purpose
                            ? true
                            : false
                        }
                        success={
                          props.errors.purpose && props.touched.purpose
                            ? false
                            : true
                        }
                        helperText={
                          props.errors.purpose && props.touched.purpose
                            ? props.errors.purpose
                            : null
                        }
                      >
                        <MenuItem value={"Payment Confirmation"}>
                          Payment Confirmation
                        </MenuItem>
                        <MenuItem value={"Validation code"}>
                          Validation code{" "}
                        </MenuItem>
                        <MenuItem value={"Enforcement"}>Enforcement</MenuItem>
                        <MenuItem value={"Violation"}>Violation</MenuItem>
                      </MDDropDown>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <MDInput
                      name="channelName"
                      value={props.values.channelName}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Channel Name"
                      error={
                        props.errors.channelName && props.touched.channelName
                          ? true
                          : false
                      }
                      success={
                        props.errors.channelName && props.touched.channelName
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.channelName && props.touched.channelName
                          ? props.errors.channelName
                          : null
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">
                        Work Space
                      </InputLabel>
                      <MDDropDown
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="Work Space"
                        name="workSpace"
                        value={props.values.workSpace}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        error={
                          props.errors.workSpace && props.touched.workSpace
                            ? true
                            : false
                        }
                        success={
                          props.errors.workSpace && props.touched.workSpace
                            ? false
                            : true
                        }
                        helperText={
                          props.errors.workSpace && props.touched.workSpace
                            ? props.errors.workSpace
                            : null
                        }
                      >
                        <MenuItem value={"SpotSync"}>SpotSync</MenuItem>
                        <MenuItem value={"PMC"}>PMC</MenuItem>
                        <MenuItem value={"SPS"}>SPS</MenuItem>
                        <MenuItem value={"Xpress"}>Xpress</MenuItem>
                        <MenuItem value={"Bozeman"}>Bozeman</MenuItem>
                        <MenuItem value={"PCA"}>PCA</MenuItem>
                        <MenuItem value={"ParkMB"}>ParkMB</MenuItem>
                      </MDDropDown>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <MDInput
                      name="webhookURL"
                      value={props.values.webhookURL}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      label="Webhook URL"
                      error={
                        props.errors.webhookURL && props.touched.webhookURL
                          ? true
                          : false
                      }
                      success={
                        props.errors.webhookURL && props.touched.webhookURL
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.webhookURL && props.touched.webhookURL
                          ? props.errors.webhookURL
                          : null
                      }
                    />
                  </Grid>

                  <Grid item xs={12} className="text-right">
                    <MDButton
                      variant="contained"
                      color={sidenavColor}
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

export default CreateSlack;
