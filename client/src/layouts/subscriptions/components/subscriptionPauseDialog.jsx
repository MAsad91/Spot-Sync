import { useState } from "react";
import {
    DialogContent,
    Grid,
    FormControl
} from "@mui/material";
import MDButton from "components/MDButton";
import { useDispatch } from "react-redux";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import { Formik } from "formik";
import { useMaterialUIController } from "context";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import moment from "moment";
import { updateSubscriptionPauseStatus, getSubscriptionsByPlaceId } from "store/slice/subscriptions/subscriptionSlice";
import { DatePicker } from "rsuite";
import { DateRangePicker } from "rsuite";

const { beforeToday } = DateRangePicker

const PauseDialog = (props) => {
    const dispatch = useDispatch();
    const { dialogOpen, onClose, subscriptionIds, isSubscriptionPaused, placeData } = props;
    const [controller] = useMaterialUIController();
    const { sidenavColor } = controller;
    console.log(props)
    const [notification, setNotification] = useState({
        color: "",
        icon: "",
        title: "",
        content: "",
        show: false,
        close: () => setNotification({ ...notification, show: false }),
    });

    const handelUpdatePauseStatus = async (data) => {
        dispatch(updateSubscriptionPauseStatus(data))
            .unwrap()
            .then(async (res) => {
                const success = res?.success;
                if (success) {
                    await dispatch(getSubscriptionsByPlaceId(placeData?._id));
                    onClose()
                }
                setNotification({
                    ...notification,
                    color: success ? "success" : "error",
                    title: success ? "Success" : "Error",
                    content: res?.message,
                    icon: success ? "check" : "warning",
                    show: true,
                });
                onClose()
            })
            .catch((err) => {
                console.error("Error updating subscription:", err);
            });
    }

    return (
        <>
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
                dialogTitle={`${isSubscriptionPaused ? "Resume" : "Pause"} Subscription Confirmation!`}
                open={dialogOpen}
                dialogClose={onClose}
                closeIcon={true}
                maxWidth="sm"
            >
                <DialogContent>
                    <MDTypography
                        display="block"
                        variant="caption"
                        sx={{ color: "black.dark", fontSize: '16px' }}
                    >
                        Are you sure you want to {isSubscriptionPaused ? "Resume" : "Pause"} the subscription?
                    </MDTypography>
                    <MDTypography
                        display="block"
                        variant="caption"
                        sx={{ color: "black.dark", fontSize: '16px' }}
                    >
                        Number of selected subscription: {subscriptionIds.length}
                    </MDTypography>

                    <Formik
                        initialValues={{
                            resumeDate: !isSubscriptionPaused ? new Date() : null,
                            subscriptionIds: subscriptionIds,
                            isSubscriptionPaused: isSubscriptionPaused,
                        }}
                        onSubmit={(value, action) => {
                            handelUpdatePauseStatus(value);
                        }}
                    >
                        {(props) => (
                            <form onSubmit={props.handleSubmit}>
                                <Grid container spacing={2} className="mt-1">
                                    {!isSubscriptionPaused &&
                                        <Grid item xs={12} md={12} lg={12}>
                                            <FormControl fullWidth>
                                                <DatePicker
                                                    id="resumeDate"
                                                    placeholder="Resume Date"
                                                    character=" - "
                                                    size="lg"
                                                    format="MM-dd-yyyy"
                                                    showMeridian
                                                    block
                                                    placement="top"
                                                    shouldDisableDate={beforeToday()}
                                                    value={props.values.resumeDate ? new Date(props.values.resumeDate) : undefined}
                                                    onChange={(value) => {
                                                        if (value) {
                                                            props.setFieldValue("resumeDate", moment(value).format());
                                                        } else {
                                                            props.setFieldValue("resumeDate", null);
                                                        }
                                                    }}
                                                    onBlur={props.handleBlur}
                                                />
                                            </FormControl>
                                        </Grid>
                                    }
                                    <Grid item xs={12}>
                                        <MDBox display="flex" justifyContent="end" gap={2}>
                                            <MDButton
                                                color="white"
                                                variant="contained"
                                                onClick={onClose}
                                            >
                                                Cancel
                                            </MDButton>
                                            <MDButton
                                                color={sidenavColor}
                                                variant="contained"
                                                type="submit"
                                            >
                                                {isSubscriptionPaused ? "Resume" : "Pause"}
                                            </MDButton>
                                        </MDBox>
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

export default PauseDialog;
