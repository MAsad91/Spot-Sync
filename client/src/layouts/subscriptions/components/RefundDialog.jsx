import { useState } from "react";
import {
    Checkbox,
    DialogContent,
    Grid,
} from "@mui/material";
import MDButton from "components/MDButton";
import { useDispatch } from "react-redux";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import * as Yup from "yup";
import { Formik } from "formik";
import { useMaterialUIController } from "context";
import CircularIndeterminate from "components/MDLoading";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import moment from "moment";
import { get } from "lodash";
import { floorAmountToShow } from "global/functions";
import { paymentRefund } from "store/slice/payment/paymentSlice";
import { getSubscriptionDetail } from "store/slice/subscriptions/subscriptionSlice";


const RefundDialog = (props) => {
    const dispatch = useDispatch();
    const { dialogOpen, onClose, data, subscriptionId, fullRefund, setFullRefund } = props;
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

    const handleIssueRefund = async (payload) => {
        setIsLoading(true);
        await dispatch(
            paymentRefund({ ...payload })
        )
            .unwrap()
            .then(async (res) => {
                const success = res?.success;
                if (success) {
                    dispatch(getSubscriptionDetail(subscriptionId))
                    setIsLoading(false);
                    onClose();
                }
                setIsLoading(false);
                setNotification({
                    ...notification,
                    color: success ? "success" : "error",
                    title: success ? "Success" : "Error",
                    content: res?.message,
                    icon: success ? "check" : "warning",
                    show: true,
                });
                onClose();
            })
            .catch((err) => {
                onClose();
                console.error("Error getting cancel:", err);
            });
    };


    const IssueRefundSchema = Yup.object().shape({
        amount: fullRefund ? Yup.number().optional() : Yup.number().required().max(floorAmountToShow(
            data?.totalAmount
        ), `Amount must be less than or equal to ${floorAmountToShow(
            data?.totalAmount
        )}`).label("Amount")
    });


    return (
        <>
            <CircularIndeterminate
                type="full"
                size={20}
                text="Issuing Refund ..."
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
                dialogTitle="Refund Confirmation!"
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
                        Are you sure you want to refund?
                    </MDTypography>
                    <MDTypography
                        display="block"
                        variant="caption"
                        className="mt-2"
                        color="text"
                    >
                        {`Transaction Date:  ${moment(get(data, "createdAt", "NA")).format(
                            "MM/DD/YYYY hh:mm A"
                        )}`}
                    </MDTypography>
                    <MDTypography
                        display="block"
                        variant="caption"
                        className="mt-2"
                        color="text"
                    >
                        {`Transaction ID: ${get(data, "paymentInfo.id", "NA")}`}
                    </MDTypography>
                    <MDTypography
                        display="block"
                        variant="caption"
                        className="mt-2"
                        color="text"
                    >
                        {`Total Amount: $${floorAmountToShow(
                            data?.totalAmount
                        )}`}
                    </MDTypography>
                    <Formik
                        initialValues={{
                            transactionId: get(data, "paymentInfo.id", "NA"),
                            fullRefund: false,
                            amount: "",
                            isClientFault: false,
                            purpose: 'SUBSCRIPTION'
                        }}
                        validationSchema={IssueRefundSchema}
                        onSubmit={(value, action) => {
                            handleIssueRefund({ ...value, amount: value.amount * 100 });
                        }}
                    >
                        {(props) => (
                            <form onSubmit={props.handleSubmit}>
                                <Grid container spacing={2} className="mt-1">
                                    <Grid item xs={12}>
                                        <MDBox display="flex" alignItems="center" ml={-1}>
                                            <Checkbox
                                                id="fullRefund"
                                                name="fullRefund"
                                                checked={props.values.fullRefund}
                                                onChange={(e) => {
                                                    props.handleChange(e);
                                                    props.setFieldValue("fullRefund", e.target.checked);
                                                    props.setFieldValue("amount", e.target.checked ? floorAmountToShow(data?.totalAmount) : "");

                                                    setFullRefund(!fullRefund)
                                                }}
                                                inputProps={{ "aria-label": "controlled" }}
                                            />
                                            <MDTypography
                                                variant="button"
                                                fontWeight="regular"
                                                color="text"
                                            >
                                                &nbsp;&nbsp;Do you want full Refund?&nbsp;
                                            </MDTypography>
                                        </MDBox>
                                    </Grid>
                                    {!props.values.fullRefund && (
                                        <>
                                            <Grid item xs={12}>
                                                <MDInput
                                                    label="Amount"
                                                    name="amount"
                                                    value={props.values.amount}
                                                    onChange={props.handleChange}
                                                    onBlur={props.handleBlur}

                                                    error={
                                                        props.errors.amount && props.touched.amount ? true : false
                                                    }
                                                    success={
                                                        props.errors.amount && props.touched.amount ? false : true
                                                    }
                                                    helperText={
                                                        props.errors.amount && props.touched.amount
                                                            ? props.errors.amount
                                                            : null
                                                    }
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <MDBox display="flex" alignItems="center" ml={-1}>
                                                    <Checkbox
                                                        id="isClientFault"
                                                        name="isClientFault"
                                                        checked={props.values.isClientFault}
                                                        onChange={(e) => {
                                                            props.handleChange(e);
                                                            props.setFieldValue("isClientFault", e.target.checked);
                                                        }}
                                                        inputProps={{ "aria-label": "controlled" }}
                                                    />
                                                    <MDTypography
                                                        variant="button"
                                                        fontWeight="regular"
                                                        color="text"
                                                    >
                                                        &nbsp;&nbsp;Is this client's fault?&nbsp;
                                                    </MDTypography>
                                                </MDBox>
                                            </Grid>
                                        </>
                                    )}
                                    <Grid item xs={12}>
                                        <MDBox display="flex" justifyContent="end" gap={2}>
                                            <MDButton
                                                color="danger"
                                                variant="contained"
                                                onClick={onClose}
                                            >
                                                Decline
                                            </MDButton>
                                            <MDButton
                                                color={sidenavColor}
                                                variant="contained"
                                                type="submit"
                                            >
                                                Issue Refund
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

export default RefundDialog;
