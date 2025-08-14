import { useState, useEffect } from "react";
import { DialogContent, Grid, Stack, FormControl, InputLabel, MenuItem, Card, FormControlLabel, RadioGroup, Radio, Switch, Checkbox } from "@mui/material";
import MDDropDown from "components/MDDropDown";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import { useDispatch, useSelector } from "react-redux";
import MDDialog from "components/MDDialog";
import MDSnackbar from "components/MDSnackbar";
import { Formik } from "formik";
import { updateBrandDefaultSettingsValidationSchema } from "services/validation";
import { useMaterialUIController } from "context";
import { updateBrandDefaultSettings } from "store/slice/brands/brandSlice";
import CircularIndeterminate from "components/MDLoading";
import { getPlivos, setPlivos } from "store/slice/plivo/plivoSlice";
import { getConnectAccounts, setConnectAccounts } from "store/slice/paymentGateway/paymentGatewaySlice";

const DefaultFields = (props) => {
    const dispatch = useDispatch();
    const { dialogOpen, onClose, brandData, updateParentData } = props;
    const [controller] = useMaterialUIController();
    const { sidenavColor } = controller;
    const [isLoading, setIsLoading] = useState(false);
    const plivos = useSelector((state) => state.plivos?.plivos);
    const [connectAccountData, setConnectAccountData] = useState([]);
    const connectAccounts = useSelector(
        (state) => state.paymentGateway?.connectAccounts
    );
    const [plivoNumbers, setPlivoNumbers] = useState([]);
    const [notification, setNotification] = useState({
        color: "",
        icon: "",
        title: "",
        content: "",
        show: false,
        close: () => setNotification({ ...notification, show: false }),
    });

    useEffect(() => {
        getPlivo();
        getConnectAccountList();
    }, [plivoNumbers]);

    function getConnectAccountList() {
        if (connectAccounts && connectAccounts.length < 1) {
            dispatch(getConnectAccounts())
                .unwrap()
                .then((res) => {
                    if (res?.success) {
                        dispatch(setConnectAccounts(res?.connectAccounts));
                        setConnectAccountData(res?.connectAccounts);
                    }
                })
                .catch((err) => {
                    console.error("Error creating:", err);
                    setNotification({
                        ...notification,
                        color: "error",
                        title: "Error",
                        content: err?.message,
                        icon: "warning",
                        show: true,
                    });
                });
        } else {
            setConnectAccountData(connectAccounts);
        }
    }

    function getPlivo() {
        if (plivos && plivos.length < 1) {
            dispatch(getPlivos())
                .unwrap()
                .then((res) => {
                    if (res?.success) {
                        setPlivoNumbers(res?.plivos);
                        dispatch(setPlivos(res?.plivos));
                    }
                });
        } else {
            setPlivoNumbers(plivos);
        }
    }

    const handledefaultSettings = (brandData) => {
        setIsLoading(true);
        dispatch(updateBrandDefaultSettings(brandData))
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

    const initialValues = {
        _id: brandData._id,
        plivoNumber: brandData.plivoNumber ? brandData.plivoNumber : plivoNumbers[0]?.number,
        paymentGateway: brandData.paymentGateway ? brandData.paymentGateway : "STRIPE",
        connectAccountId: brandData.connectAccountId ? brandData.connectAccountId : connectAccountData[0]?.connectAccountId,
        paymentGatewayFeePayBy: brandData.paymentGatewayFeePayBy ? brandData.paymentGatewayFeePayBy : "customer",
        isDirectChargeLocation: brandData.isDirectChargeLocation ? brandData.isDirectChargeLocation : false,
        applyTaxOnServiceFee: brandData.applyTaxOnServiceFee ? brandData.applyTaxOnServiceFee : false,
        isbpRevenue: brandData.isbpRevenue ? brandData.isbpRevenue : 0,
        isbpRevenueType: brandData.isbpRevenueType ? brandData.isbpRevenueType : "fixed",
        isbpRevenuePercentOf: brandData.isbpRevenuePercentOf ? brandData.isbpRevenuePercentOf : "baseRate",
        subscriptionIsbpRevenue: brandData.subscriptionIsbpRevenue ? brandData.subscriptionIsbpRevenue : 0,
        subscriptionIsbpRevenueType: brandData.subscriptionIsbpRevenueType ? brandData.subscriptionIsbpRevenueType : "fixed",
        subscriptionIsbpRevenuePercentOf: brandData.subscriptionIsbpRevenuePercentOf ? brandData.subscriptionIsbpRevenuePercentOf : "baseRate",
        paymentGatewayFeePercentage: brandData.paymentGatewayFeePercentage ? brandData.paymentGatewayFeePercentage : 2.9,
        paymentGatewayFeeFixedCents: brandData.paymentGatewayFeeFixedCents ? brandData.paymentGatewayFeeFixedCents : 30,
        subscriptionStateTax: brandData.subscriptionStateTax ? brandData.subscriptionStateTax : 0,
        subscriptionCityTax: brandData.subscriptionCityTax ? brandData.subscriptionCityTax : 0,
        subscriptionCountyTax: brandData.subscriptionCountyTax ? brandData.subscriptionCountyTax : 0,
        transientStateTax: brandData.transientStateTax ? brandData.transientStateTax : 0,
        transientCityTax: brandData.transientCityTax ? brandData.transientCityTax : 0,
        transientCountyTax: brandData.transientCountyTax ? brandData.transientCountyTax : 0,
        serviceFee: brandData.serviceFee ? brandData.serviceFee : 0,
        subscriptionServiceFee: brandData.subscriptionServiceFee ? brandData.subscriptionServiceFee : 0,
        isPaymentByCard: true,
        isPaymentByAch: brandData.isPaymentByAch ?? true,
        isPaymentByGooglePay: brandData.isPaymentByGooglePay ?? true,
        isPaymentByApplePay: brandData.isPaymentByApplePay ?? true,
        isPaymentByCrypto: brandData.isPaymentByCrypto ?? true,
        isPaymentByCash: brandData.isPaymentByCash ?? true,
    }

    return (
        <>
            <CircularIndeterminate
                type="full"
                size={20}
                text="Updating default values.. "
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
                dialogTitle="Update default values"
                open={dialogOpen}
                dialogClose={onClose}
                closeIcon={true}
                maxWidth="xl"
            >
                <DialogContent>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={updateBrandDefaultSettingsValidationSchema}
                        onSubmit={(value, action) => {
                            handledefaultSettings(value);
                        }}
                    >
                        {(props) => (
                            <form onSubmit={props.handleSubmit}>
                                <Grid container spacing={2} className="mt-1">
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel >Select Plivo Number</InputLabel>
                                            <MDDropDown
                                                value={props.values.plivoNumber}
                                                label="Select Plivo Number"
                                                name="plivoNumber"
                                                onChange={props.handleChange}
                                            >
                                                {plivoNumbers?.map((number, index) => (
                                                    <MenuItem key={index} value={number?.number}>
                                                        {number?.number}
                                                    </MenuItem>
                                                ))}
                                            </MDDropDown>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} display="flex" alignItems="center">
                                        <Grid item xs={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Select Payment Gateway</InputLabel>
                                                <MDDropDown
                                                    value={props.values.paymentGateway}
                                                    label="Select Payment Gatway"
                                                    name="paymentGateway"
                                                    onChange={props.handleChange}
                                                >
                                                    <MenuItem value={"AUTHORIZENET"}>Authorize.net (PMC)</MenuItem>
                                                    <MenuItem value={"AUTHORIZENET_PMC"}>Authorize.net ( PMC-2)</MenuItem>
                                                    <MenuItem value={"STRIPE"}>Stripe</MenuItem>
                                                    <MenuItem value={"STRIPE_PMC"}>Stripe (PMC)</MenuItem>
                                                </MDDropDown>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6} marginLeft={1}>
                                            <FormControl fullWidth>
                                                <InputLabel >Select Connect Account</InputLabel>
                                                <MDDropDown
                                                    value={props.values.connectAccountId}
                                                    label="Select Connect Account"
                                                    name="connectAccountId"
                                                    onChange={props.handleChange}
                                                >
                                                    {props.values.paymentGateway === "STRIPE" &&
                                                        connectAccountData.map((account, index) => (
                                                            <MenuItem key={index} value={account.connectAccountId}>
                                                                {account.connectAccountId}
                                                            </MenuItem>
                                                        ))}
                                                </MDDropDown>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel>Select Payment Gatway Fee Paid By</InputLabel>
                                            <MDDropDown
                                                value={props.values.paymentGatewayFeePayBy}
                                                label="Select Payment Gatway Fee Paid By"
                                                name="paymentGatewayFeePayBy"
                                                onChange={props.handleChange}
                                            >
                                                <MenuItem value="isbp">ISBParking</MenuItem>
                                                <MenuItem value="customer">Customer</MenuItem>
                                                <MenuItem value="client">Client</MenuItem>

                                            </MDDropDown>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel>Select Apply Tax on Service Fee</InputLabel>
                                            <MDDropDown
                                                value={props.values.applyTaxOnServiceFee}
                                                label="Select Apply Tax on Service Fee"
                                                name="applyTaxOnServiceFee"
                                                onChange={props.handleChange}
                                            >
                                                <MenuItem key="yes" value={true}>Yes</MenuItem>
                                                <MenuItem key="no" value={false}>No</MenuItem>

                                            </MDDropDown>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel>Select Payment Type</InputLabel>
                                            <MDDropDown
                                                value={props.values.isDirectChargeLocation}
                                                label="Select Payment Type"
                                                name="isDirectChargeLocation"
                                                onChange={props.handleChange}
                                            >
                                                <MenuItem value={false}>Destination Charge</MenuItem>
                                                <MenuItem value={true}>Direct Charge</MenuItem>
                                            </MDDropDown>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card sx={{ boxShadow: 3, marginLeft: 0, marginTop: 1 }}>
                                            <MDBox p={2}>
                                                <Grid item xs={12} container alignItems="center">
                                                    <MDTypography
                                                        color="dark"
                                                        display="block"
                                                        variant="subtitle2"
                                                        fontWeight="bold"
                                                        sx={{ flex: 1 }}
                                                    >
                                                        ISBParking Revenue
                                                    </MDTypography>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <RadioGroup
                                                        name="isbpRevenueType"
                                                        sx={{ flexDirection: "row" }}
                                                        value={props.values.isbpRevenueType}
                                                        onChange={(e) =>
                                                            props.setFieldValue("isbpRevenueType", e.target.value)
                                                        }
                                                    >
                                                        <FormControlLabel
                                                            value="fixed"
                                                            control={<Radio />}
                                                            label="Fixed"
                                                        />
                                                        <FormControlLabel
                                                            value="percentage"
                                                            control={<Radio />}
                                                            label="Percentage"
                                                        />
                                                    </RadioGroup>
                                                </Grid>
                                                <Grid item xs={12} display={"flex"}>
                                                    {props.values.isbpRevenueType === "percentage" && (
                                                        <Grid item xs={12}>
                                                            <FormControl fullWidth>
                                                                <InputLabel >
                                                                    Percent OF
                                                                </InputLabel>
                                                                <MDDropDown
                                                                    name="isbpRevenuePercentOf"
                                                                    value={props.values.isbpRevenuePercentOf}
                                                                    label="ISBParking Revenue Type"
                                                                    onChange={props.handleChange}
                                                                    onBlur={props.handleBlur}
                                                                    error={
                                                                        props.errors.isbpRevenuePercentOf &&
                                                                            props.touched.isbpRevenuePercentOf
                                                                            ? true
                                                                            : false
                                                                    }
                                                                    success={
                                                                        props.errors.isbpRevenuePercentOf &&
                                                                            props.touched.isbpRevenuePercentOf
                                                                            ? false
                                                                            : true
                                                                    }
                                                                    helperText={
                                                                        props.errors.isbpRevenuePercentOf &&
                                                                            props.touched.isbpRevenuePercentOf
                                                                            ? props.errors.isbpRevenuePercentOf
                                                                            : null
                                                                    }
                                                                >
                                                                    <MenuItem value={"baseRate"}>Base Rate</MenuItem>
                                                                    <MenuItem value={"serviceFee"}>
                                                                        Service Fee
                                                                    </MenuItem>
                                                                    <MenuItem value={"totalAmount"}>
                                                                        Total Amount
                                                                    </MenuItem>
                                                                </MDDropDown>
                                                            </FormControl>
                                                        </Grid>
                                                    )}
                                                    <Grid
                                                        item
                                                        xs={12}
                                                    >
                                                        <MDInput
                                                            name="isbpRevenue"
                                                            value={props.values.isbpRevenue}
                                                            onChange={props.handleChange}
                                                            onBlur={props.handleBlur}
                                                            label={`ISBParking Revenue (${props.values.isbpRevenueType === "percentage"
                                                                ? "%"
                                                                : "$"
                                                                }) `}
                                                            error={
                                                                props.errors.isbpRevenue && props.touched.isbpRevenue
                                                                    ? true
                                                                    : false
                                                            }
                                                            success={
                                                                props.errors.isbpRevenue && props.touched.isbpRevenue
                                                                    ? false
                                                                    : true
                                                            }
                                                            helperText={
                                                                props.errors.isbpRevenue && props.touched.isbpRevenue
                                                                    ? props.errors.isbpRevenue
                                                                    : null
                                                            }
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </MDBox>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card sx={{ boxShadow: 3, marginLeft: 2, marginTop: 1 }}>
                                            <MDBox p={2}>
                                                <Grid item xs={12} container alignItems="center">
                                                    <MDTypography
                                                        color="dark"
                                                        display="block"
                                                        variant="subtitle2"
                                                        fontWeight="bold"
                                                        sx={{ flex: 1 }}
                                                    >
                                                        Subscription ISBParking Revenue
                                                    </MDTypography>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <RadioGroup
                                                        name="subscriptionIsbpRevenueType"
                                                        sx={{ flexDirection: "row" }}
                                                        value={props.values.subscriptionIsbpRevenueType}
                                                        onChange={(e) =>
                                                            props.setFieldValue("subscriptionIsbpRevenueType", e.target.value)
                                                        }
                                                    >
                                                        <FormControlLabel
                                                            value="fixed"
                                                            control={<Radio />}
                                                            label="Fixed"
                                                        />
                                                        <FormControlLabel
                                                            value="percentage"
                                                            control={<Radio />}
                                                            label="Percentage"
                                                        />
                                                    </RadioGroup>
                                                </Grid>
                                                <Grid item xs={12} display={"flex"}>

                                                    {props.values.subscriptionIsbpRevenueType === "percentage" && (
                                                        <>
                                                            <Grid
                                                                item
                                                                xs={12}
                                                            >
                                                                <FormControl fullWidth>
                                                                    <InputLabel >
                                                                        Percent OF
                                                                    </InputLabel>
                                                                    <MDDropDown
                                                                        name="subscriptionIsbpRevenuePercentOf"
                                                                        value={props.values.subscriptionIsbpRevenuePercentOf}
                                                                        label="ISBParking Revenue Type"
                                                                        onChange={props.handleChange}
                                                                        onBlur={props.handleBlur}
                                                                        error={
                                                                            props.errors.subscriptionIsbpRevenuePercentOf &&
                                                                                props.touched.subscriptionIsbpRevenuePercentOf
                                                                                ? true
                                                                                : false
                                                                        }
                                                                        success={
                                                                            props.errors.subscriptionIsbpRevenuePercentOf &&
                                                                                props.touched.subscriptionIsbpRevenuePercentOf
                                                                                ? false
                                                                                : true
                                                                        }
                                                                        helperText={
                                                                                props.errors.subscriptionIsbpRevenuePercentOf &&
                                                                                props.touched.subscriptionIsbpRevenuePercentOf
                                                                                ? props.errors.subscriptionIsbpRevenuePercentOf
                                                                                : null
                                                                        }
                                                                    >
                                                                        <MenuItem value={"baseRate"}>Base Rate</MenuItem>
                                                                        <MenuItem value={"serviceFee"}>
                                                                            Service Fee
                                                                        </MenuItem>
                                                                        <MenuItem value={"totalAmount"}>
                                                                            Total Amount
                                                                        </MenuItem>
                                                                    </MDDropDown>
                                                                </FormControl>
                                                            </Grid>
                                                        </>
                                                    )}

                                                    <Grid
                                                        item
                                                        xs={12}
                                                    >
                                                        <MDInput
                                                            name="subscriptionIsbpRevenue"
                                                            value={props.values.subscriptionIsbpRevenue}
                                                            onChange={props.handleChange}
                                                            onBlur={props.handleBlur}
                                                                label={`ISBParking Revenue (${props.values.subscriptionIsbpRevenueType === "percentage"
                                                                ? "%"
                                                                : "$"
                                                                }) `}
                                                            error={
                                                                props.errors.subscriptionIsbpRevenue && props.touched.subscriptionIsbpRevenue
                                                                    ? true
                                                                    : false
                                                            }
                                                            success={
                                                                props.errors.subscriptionIsbpRevenue && props.touched.subscriptionIsbpRevenue
                                                                    ? false
                                                                    : true
                                                            }
                                                            helperText={
                                                                props.errors.subscriptionIsbpRevenue && props.touched.subscriptionIsbpRevenue
                                                                    ? props.errors.subscriptionIsbpRevenue
                                                                    : null
                                                            }
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </MDBox>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Card sx={{ boxShadow: 3, marginTop: 1 }}>
                                            <MDBox p={2}>
                                                <Grid item xs={12} container alignItems="center">
                                                    <MDTypography
                                                        color="dark"
                                                        display="block"
                                                        variant="subtitle2"
                                                        fontWeight="bold"
                                                        sx={{ flex: 1 }}
                                                    >
                                                        Transient Tax
                                                    </MDTypography>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <MDTypography
                                                            variant="subtitle2"
                                                            style={{ minWidth: "120px" }}
                                                        >
                                                            State Tax:
                                                        </MDTypography>
                                                        <MDInput
                                                            name="transientStateTax"
                                                            value={props.values.transientStateTax}
                                                            onChange={props.handleChange}
                                                            onBlur={props.handleBlur}
                                                            error={props.errors.transientStateTax && props.touched.transientStateTax}
                                                            success={!props.errors.transientStateTax && props.touched.transientStateTax}
                                                            helperText={
                                                                props.errors.transientStateTax &&
                                                                props.touched.transientStateTax &&
                                                                props.errors.transientStateTax
                                                            }
                                                        />
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <MDTypography
                                                            variant="subtitle2"
                                                            style={{ minWidth: "120px" }}
                                                        >
                                                            City Tax:
                                                        </MDTypography>
                                                        <MDInput
                                                            name="transientCityTax"
                                                            value={props.values.transientCityTax}
                                                            onChange={props.handleChange}
                                                            onBlur={props.handleBlur}
                                                            error={props.errors.transientCityTax && props.touched.transientCityTax}
                                                            success={
                                                                !props.errors.transientCityTax && props.touched.transientCityTax
                                                            }
                                                            helperText={
                                                                props.errors.transientCityTax &&
                                                                props.touched.transientCityTax &&
                                                                props.errors.transientCityTax
                                                            }
                                                        />
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <MDTypography
                                                            variant="subtitle2"
                                                            style={{ minWidth: "120px" }}
                                                        >
                                                            County Tax:
                                                        </MDTypography>
                                                        <MDInput
                                                            name="transientCountyTax"
                                                            value={props.values.transientCountyTax}
                                                            onChange={props.handleChange}
                                                            onBlur={props.handleBlur}
                                                            error={
                                                                props.errors.transientCountyTax && props.touched.transientCountyTax
                                                            }
                                                            success={
                                                                !props.errors.transientCountyTax && props.touched.transientCountyTax
                                                            }
                                                            helperText={
                                                                props.errors.transientCountyTax &&
                                                                props.touched.transientCountyTax &&
                                                                props.errors.transientCountyTax
                                                            }
                                                        />
                                                    </div>
                                                </Grid>
                                            </MDBox>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Card sx={{ boxShadow: 3, marginTop: 1 }}>
                                            <MDBox p={2}>
                                                <Grid item xs={12} container alignItems="center">
                                                    <MDTypography
                                                        color="dark"
                                                        display="block"
                                                        variant="subtitle2"
                                                        fontWeight="bold"
                                                        sx={{ flex: 1 }}
                                                    >
                                                        Subscription Tax
                                                    </MDTypography>
                                                </Grid>

                                                <Grid item xs={12} >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <MDTypography
                                                            variant="subtitle2"
                                                            style={{ minWidth: "120px" }}
                                                        >
                                                            State Tax:
                                                        </MDTypography>
                                                        <MDInput
                                                            name="subscriptionStateTax"
                                                            value={props.values.subscriptionStateTax}
                                                            onChange={props.handleChange}
                                                            onBlur={props.handleBlur}
                                                            error={props.errors.subscriptionStateTax && props.touched.subscriptionStateTax}
                                                            success={!props.errors.subscriptionStateTax && props.touched.subscriptionStateTax}
                                                            helperText={
                                                                props.errors.subscriptionStateTax &&
                                                                props.touched.subscriptionStateTax &&
                                                                props.errors.subscriptionStateTax
                                                            }
                                                        />
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <MDTypography
                                                            variant="subtitle2"
                                                            style={{ minWidth: "120px" }}
                                                        >
                                                            City Tax:
                                                        </MDTypography>
                                                        <MDInput
                                                            name="subscriptionCityTax"
                                                            value={props.values.subscriptionCityTax}
                                                            onChange={props.handleChange}
                                                            onBlur={props.handleBlur}
                                                            error={props.errors.subscriptionCityTax && props.touched.subscriptionCityTax}
                                                            success={
                                                                !props.errors.subscriptionCityTax && props.touched.subscriptionCityTax
                                                            }
                                                            helperText={
                                                                props.errors.subscriptionCityTax &&
                                                                props.touched.subscriptionCityTax &&
                                                                props.errors.subscriptionCityTax
                                                            }
                                                        />
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <MDTypography
                                                            variant="subtitle2"
                                                            style={{ minWidth: "120px" }}
                                                        >
                                                            County Tax:
                                                        </MDTypography>
                                                        <MDInput
                                                            name="subscriptionCountyTax"
                                                            value={props.values.subscriptionCountyTax}
                                                            onChange={props.handleChange}
                                                            onBlur={props.handleBlur}
                                                            error={
                                                                props.errors.subscriptionCountyTax && props.touched.subscriptionCountyTax
                                                            }
                                                            success={
                                                                !props.errors.subscriptionCountyTax && props.touched.subscriptionCountyTax
                                                            }
                                                            helperText={
                                                                props.errors.subscriptionCountyTax &&
                                                                props.touched.subscriptionCountyTax &&
                                                                props.errors.subscriptionCountyTax
                                                            }
                                                        />
                                                    </div>
                                                </Grid>
                                            </MDBox>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Card sx={{ boxShadow: 3, marginTop: 1 }}>
                                            <MDBox p={2}>
                                                <Grid item xs={12} container alignItems="center">
                                                    <MDTypography
                                                        color="dark"
                                                        display="block"
                                                        variant="subtitle2"
                                                        fontWeight="bold"
                                                        sx={{ flex: 1 }}
                                                    >
                                                        Payment Gatway Fee
                                                    </MDTypography>
                                                </Grid>

                                                <Grid item xs={12} >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <MDTypography
                                                            variant="subtitle2"
                                                            style={{ minWidth: "120px" }}
                                                        >
                                                            Percentage:
                                                        </MDTypography>
                                                        <MDInput
                                                            name="paymentGatewayFeePercentage"
                                                            value={props.values.paymentGatewayFeePercentage}
                                                            onChange={props.handleChange}
                                                            onBlur={props.handleBlur}
                                                            error={props.errors.paymentGatewayFeePercentage && props.touched.paymentGatewayFeePercentage}
                                                            success={!props.errors.paymentGatewayFeePercentage && props.touched.paymentGatewayFeePercentage}
                                                            helperText={
                                                                props.errors.paymentGatewayFeePercentage &&
                                                                props.touched.paymentGatewayFeePercentage &&
                                                                props.errors.paymentGatewayFeePercentage
                                                            }
                                                        />
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <MDTypography
                                                            variant="subtitle2"
                                                            style={{ minWidth: "120px" }}
                                                        >
                                                            Fixed Cents:
                                                        </MDTypography>
                                                        <MDInput
                                                            name="paymentGatewayFeeFixedCents"
                                                            value={props.values.paymentGatewayFeeFixedCents}
                                                            onChange={props.handleChange}
                                                            onBlur={props.handleBlur}
                                                            error={props.errors.paymentGatewayFeeFixedCents && props.touched.paymentGatewayFeeFixedCents}
                                                            success={
                                                                !props.errors.paymentGatewayFeeFixedCents && props.touched.paymentGatewayFeeFixedCents
                                                            }
                                                            helperText={
                                                                props.errors.paymentGatewayFeeFixedCents &&
                                                                props.touched.paymentGatewayFeeFixedCents &&
                                                                props.errors.paymentGatewayFeeFixedCents
                                                            }
                                                        />
                                                    </div>
                                                </Grid>
                                            </MDBox>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card sx={{ boxShadow: 3, marginTop: 1 }}>
                                            <MDBox p={2}>
                                                <Grid item xs={12}>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <MDTypography
                                                            color="dark"
                                                            display="block"
                                                            fontWeight="bold"
                                                            variant="subtitle2"
                                                            style={{ minWidth: "120px" }}
                                                        >
                                                            Service Fee:
                                                        </MDTypography>
                                                        <MDInput
                                                            name="serviceFee"
                                                            value={props.values.serviceFee}
                                                            onChange={props.handleChange}
                                                            onBlur={props.handleBlur}
                                                            error={props.errors.serviceFee && props.touched.serviceFee}
                                                            success={!props.errors.serviceFee && props.touched.serviceFee}
                                                            helperText={
                                                                props.errors.serviceFee &&
                                                                props.touched.serviceFee &&
                                                                props.errors.serviceFee
                                                            }
                                                        />
                                                    </div>

                                                </Grid>
                                            </MDBox>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card sx={{ boxShadow: 3, marginLeft: 3, marginTop: 1 }}>
                                            <MDBox p={2} >
                                                <Grid item xs={12}>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <MDTypography
                                                            color="dark"
                                                            display="block"
                                                            fontWeight="bold"
                                                            variant="subtitle2"
                                                            style={{ minWidth: "200px" }}
                                                        >
                                                            Subscription Service Fee:
                                                        </MDTypography>
                                                        <MDInput
                                                            name="subscriptionServiceFee"
                                                            value={props.values.subscriptionServiceFee}
                                                            onChange={props.handleChange}
                                                            onBlur={props.handleBlur}
                                                            error={props.errors.subscriptionServiceFee && props.touched.subscriptionServiceFee}
                                                            success={!props.errors.subscriptionServiceFee && props.touched.subscriptionServiceFee}
                                                            helperText={
                                                                props.errors.subscriptionServiceFee &&
                                                                props.touched.subscriptionServiceFee &&
                                                                props.errors.subscriptionServiceFee
                                                            }
                                                        />
                                                    </div>

                                                </Grid>
                                            </MDBox>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Card sx={{ boxShadow: 3, marginTop: 1 }}>
                                            <MDBox p={2}>
                                                <Grid item xs={12}>
                                                    <MDBox display="flex" alignItems="center" ml={-1}>
                                                        <Checkbox
                                                            id="isPaymentByCard"
                                                            name="isPaymentByCard"
                                                            value={props.values.isPaymentByCard}
                                                            checked={props.values.isPaymentByCard}
                                                            onClick={() => {
                                                                props.setFieldValue('isPaymentByCard', !props.values.isPaymentByCard);
                                                            }}
                                                            inputProps={{ "aria-label": "controlled" }}
                                                            disabled

                                                        />
                                                        <MDTypography
                                                            color="dark"
                                                            display="block"
                                                            variant="subtitle2"
                                                            fontWeight="bold"
                                                            sx={{ flex: 1 }}
                                                        >
                                                            Payment By Card
                                                        </MDTypography>
                                                    </MDBox>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <MDBox display="flex" alignItems="center" ml={-1}>
                                                        <Checkbox
                                                            id="isPaymentByAch"
                                                            name="isPaymentByAch"
                                                            value={props.values.isPaymentByAch}
                                                            checked={props.values.isPaymentByAch}
                                                            onClick={() => {
                                                                props.setFieldValue('isPaymentByAch', !props.values.isPaymentByAch);
                                                            }}
                                                            inputProps={{ "aria-label": "controlled" }}
                                                        />
                                                        <MDTypography
                                                            color="dark"
                                                            display="block"
                                                            variant="subtitle2"
                                                            fontWeight="bold"
                                                            sx={{ flex: 1 }}
                                                        >
                                                            Payment By ACH
                                                        </MDTypography>
                                                    </MDBox>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <MDBox display="flex" alignItems="center" ml={-1}>
                                                        <Checkbox
                                                            id="isPaymentByGooglePay"
                                                            name="isPaymentByGooglePay"
                                                            value={props.values.isPaymentByGooglePay}
                                                            checked={props.values.isPaymentByGooglePay}
                                                            onClick={() => {
                                                                props.setFieldValue('isPaymentByGooglePay', !props.values.isPaymentByGooglePay);
                                                            }}
                                                            inputProps={{ "aria-label": "controlled" }}
                                                        />
                                                        <MDTypography
                                                            color="dark"
                                                            display="block"
                                                            variant="subtitle2"
                                                            fontWeight="bold"
                                                            sx={{ flex: 1 }}
                                                        >
                                                            Payment By Google Pay
                                                        </MDTypography>
                                                    </MDBox>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <MDBox display="flex" alignItems="center" ml={-1}>
                                                        <Checkbox
                                                            id="isPaymentByApplePay"
                                                            name="isPaymentByApplePay"
                                                            value={props.values.isPaymentByApplePay}
                                                            checked={props.values.isPaymentByApplePay}
                                                            onClick={() => {
                                                                props.setFieldValue('isPaymentByApplePay', !props.values.isPaymentByApplePay);
                                                            }}
                                                            inputProps={{ "aria-label": "controlled" }}
                                                        />
                                                        <MDTypography
                                                            color="dark"
                                                            display="block"
                                                            variant="subtitle2"
                                                            fontWeight="bold"
                                                            sx={{ flex: 1 }}
                                                        >
                                                            Payment By Apple Pay
                                                        </MDTypography>
                                                    </MDBox>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <MDBox display="flex" alignItems="center" ml={-1}>
                                                        <Checkbox
                                                            id="isPaymentByCash"
                                                            name="isPaymentByCash"
                                                            value={props.values.isPaymentByCash}
                                                            checked={props.values.isPaymentByCash}
                                                            onClick={() => {
                                                                props.setFieldValue('isPaymentByCash', !props.values.isPaymentByCash);
                                                            }}
                                                            inputProps={{ "aria-label": "controlled" }}
                                                        />
                                                        <MDTypography
                                                            color="dark"
                                                            display="block"
                                                            variant="subtitle2"
                                                            fontWeight="bold"
                                                            sx={{ flex: 1 }}
                                                        >
                                                            Payment By Cash
                                                        </MDTypography>
                                                    </MDBox>
                                                </Grid>
                                                { /*<Grid item xs={12}>
                                                    <MDBox display="flex" alignItems="center" ml={-1}>
                                                        <Checkbox
                                                            id="isPaymentByCrypto"
                                                            name="isPaymentByCrypto"
                                                            value={props.values.isPaymentByCrypto}
                                                            checked={props.values.isPaymentByCrypto}
                                                            onClick={() => {
                                                                props.setFieldValue('isPaymentByCrypto', !props.values.isPaymentByCrypto);
                                                            }}
                                                            inputProps={{ "aria-label": "controlled" }}
                                                        />
                                                        <MDTypography
                                                            color="dark"
                                                            display="block"
                                                            variant="subtitle2"
                                                            fontWeight="bold"
                                                            sx={{ flex:1 }}
                                                        >
                                                            Payment By Crypto
                                                        </MDTypography>
                                                    </MDBox>
                                                </Grid>*/}

                                            </MDBox>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} className="text-right">
                                        <MDButton
                                            color={sidenavColor}
                                            variant="contained"
                                            type="submit"
                                        >
                                            Update
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

export default DefaultFields;
