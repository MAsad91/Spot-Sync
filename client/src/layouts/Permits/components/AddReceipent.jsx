import {
    Autocomplete,
    Chip,
    DialogContent,
    FormControl,
    Grid,
} from "@mui/material";
import * as Yup from "yup";
import MDButton from "components/MDButton";
import { useEffect, useState } from "react";
import MDDialog from "components/MDDialog";
import MDInput from "components/MDInput";
import MDSnackbar from "components/MDSnackbar";
import { Formik } from "formik";
import { useMaterialUIController } from "context";
import { useDispatch } from "react-redux";
import CircularIndeterminate from "components/MDLoading";
import { createAutomatedReport } from "store/slice/automatedReports/automatedSlice";
import { getPlaces } from "store/slice/places/placeSlice";

const AddReceipent = (props) => {
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

    const AddReceipentValidation = Yup.object()
        .shape({
            toEmail: Yup.string().email("Please enter a valid Email").required("Email is required!"),
            ccEmails: Yup.array().of(Yup.string().email("Please enter valid Email")).optional(),
            placeIds: Yup.array().of(Yup.string().required("Place ID is required")).min(1, "At least one place is required"),
            isDaily: Yup.boolean(),
            isMonthly: Yup.boolean(),
            isWeekly: Yup.boolean(),
            isTransaction: Yup.boolean(),
            isRefund: Yup.boolean(),
            isPermit: Yup.boolean(),
        })

    useEffect(() => {
        dispatch(getPlaces());
    }, [dispatch]);

    const handleAddReceipents = (receipentData) => {
        setIsLoading(true);
        dispatch(createAutomatedReport(receipentData))
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

    return (
        <>
            <CircularIndeterminate
                type="full"
                size={20}
                text="Adding Receipent.. "
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
                dialogTitle="Add Receipent"
                open={dialogOpen}
                dialogClose={onClose}
                closeIcon={true}
                maxWidth="sm"
            >
                <DialogContent>
                    <Formik
                        initialValues={{
                            placeIds: [placeId],
                            toEmail: "",
                            ccEmails: [],
                            isPermit: true,
                            isDaily: false,
                            isMonthly: false,
                            isWeekly: false,
                            isTransaction: false,
                            isRefund: false,
                        }}
                        validationSchema={AddReceipentValidation}
                        onSubmit={(value, action) => {
                            handleAddReceipents(value);
                        }}
                    >
                        {(props) => (
                            <form onSubmit={props.handleSubmit}>
                                <Grid container spacing={2} className="mt-1">
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

export default AddReceipent;
