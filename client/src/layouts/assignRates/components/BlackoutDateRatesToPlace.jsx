import { DialogContent, Grid, FormControl } from "@mui/material";
import { Formik } from "formik";
import { DateRangePicker } from "rsuite";
import MDButton from "components/MDButton";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import MDInput from "components/MDInput";
import { useMaterialUIController } from "context";
import { useState } from "react";
import { useDispatch } from "react-redux";
import CircularIndeterminate from "components/MDLoading";
import { blackoutDayRates } from "store/slice/rates/rateSlice";
import { getAssignRatesByPlaceId } from "store/slice/rates/rateSlice";
import { getCalenderDataByPlaceId } from "store/slice/rates/rateSlice";
import { getAssignRatesTableDataByPlaceId } from "store/slice/rates/rateSlice";

import moment from "moment";

const BlackoutDateRatesToPlace = (props) => {
  const { dialogOpen, onClose, placeId, updateParentData } = props;
  const dispatch = useDispatch();
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

  const handleBlackoutDates =  (rateData) => {
    setIsLoading(true);
    dispatch(blackoutDayRates(rateData))
      .unwrap()
      .then(async(res) => {
        const success = res?.success;
        console.log("res====>", res);
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
          await dispatch(getAssignRatesByPlaceId(placeId));
          await dispatch(getCalenderDataByPlaceId(placeId));
          await dispatch(getAssignRatesTableDataByPlaceId(placeId));
          onClose();
        }
      })
      .catch((err) => {
        console.error("Error assigning rate:", err);
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
        text="Creating blackouts..."
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
        dialogTitle="Blackout Dates"
        open={dialogOpen}
        dialogClose={onClose}
        closeIcon={true}
        maxWidth="sm"
      >
        <DialogContent>
          <Formik
            initialValues={{
              startDate: "",
              endDate: "",
              message: "",
              startDateObj: null,
              endDateObj: null,
            }}
            // validationSchema={createRateValidation}
            onSubmit={(value, action) => {
              const payload = {
                placeId,
                startDate: moment(value.startDate).format(),
                endDate: moment(value.endDate).format(),
                message: value.message,
                isBlackout: true,
              };

              console.log("payload", payload);
              handleBlackoutDates(payload);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit}>
                <Grid container spacing={2} className="mt-1">
                  <Grid item xs={12} md={12} lg={12}>
                    <FormControl fullWidth>
                      <DateRangePicker
                        id="timeDuration"
                        placeholder="Start Date - End Date"
                        character=" - "
                        size="lg"
                        format="dd-MM-yyyy hh:mm a"
                        showMeridian
                        value={
                          props.values.startDate && props.values.endDate
                            ? [
                                new Date(props.values.startDate),
                                new Date(props.values.endDate),
                              ]
                            : undefined
                        }
                        ranges={[]}
                        onChange={(value) => {
                          if (value && value.length === 2) {
                            props.setFieldValue("startDate", value[0]);
                            props.setFieldValue("endDate", value[1]);
                          } else {
                            props.setFieldValue("startDate", null);
                            props.setFieldValue("endDate", null);
                          }
                        }}
                        onBlur={props.handleBlur}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={12} lg={12}>
                    <MDInput
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      name="message"
                      value={props.values?.message}
                      label="Message"
                      onBlur={props.handleBlur}
                      onChange={props.handleChange}
                      error={
                        props.errors.message && props.touched.message
                          ? true
                          : false
                      }
                      success={
                        props.errors.message && props.touched.message
                          ? false
                          : true
                      }
                      helperText={
                        props.errors.message && props.touched.message
                          ? props.errors.message
                          : null
                      }
                    />
                  </Grid>

                  <Grid item xs={12} className="text-right">
                    <MDButton
                      color={sidenavColor}
                      variant="contained"
                      type="submit"
                    >
                      Submit
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

export default BlackoutDateRatesToPlace;
