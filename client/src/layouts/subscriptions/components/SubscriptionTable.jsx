import {
  LinearProgress,
  Tooltip,
  IconButton,
  Icon,
  Stack,
  Button,
  Badge,
  Checkbox,
} from "@mui/material";
import MDDataGrid from "components/MDDataGrid/MDDataGrid";
import MDTypography from "components/MDTypography";
import { centsToDollars } from "global/functions";
import MDBadge from "components/MDBadge";
import { dateToShow } from "global/functions";
import { useMaterialUIController } from "context";
import { get, isEmpty } from "lodash";
import MDBox from "components/MDBox";
import EmptyTableRowOverlay from "components/MDEmptyOverlay/EmptyTableRowOverlay";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { getSubscriptionDuration } from "global/functions";
import ConfirmationDialog from "components/UIComponents/ConfirmationDialog";
import { paymentRefund } from "store/slice/payment/paymentSlice";
import CircularIndeterminate from "components/MDLoading";
import MDSnackbar from "components/MDSnackbar";
import { getSubscriptionsByPlaceId } from "store/slice/subscriptions/subscriptionSlice";
import { deleteSubscription } from "store/slice/subscriptions/subscriptionSlice";
import { mobileNumberMasking } from "global/functions";
import SubscriptionDetail from "./SubscriptionDetails";
import { getTimezoneName } from "global/functions";
import MDButton from "components/MDButton";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import { logout } from "store/slice/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { switchToParkerDashboard } from "store/slice/customer/customerSlice";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import PauseCircle from "@mui/icons-material/PauseCircle";
import PlayCircle from "@mui/icons-material/PlayCircle";
import moment from "moment";
import SubscriptionChargeDialog from "./subscriptionChargeDialog";
import LicensePlatesDialog from "./LicensePlatesViewDialog";
import LicensePlateUpdateDialog from "./LicensePlateUpdateDialog";
import { sendPaymentLinkEmail } from "store/slice/subscriptions/subscriptionSlice";
import DownloadIcon from "@mui/icons-material/Download";
import Label from "components/Common/Label";
import PauseDialog from "./subscriptionPauseDialog";

const SubscriptionsTable = (props) => {
  const [controller] = useMaterialUIController();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sidenavColor } = controller;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [chargeDialogOpen, setChargeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [licensePlateUpdateDialog, setLicensePlateUpdateDialog] =
    useState(false);
  const [licensePlateView, setLicensePlateView] = useState(false);
  const [licensePlates, setLicensePlates] = useState([]);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [subscriptionData, setSubscriptionData] = useState({});
  const { subscriptionList, subscriptionType, placeData, isLoading } = props;
  const [selectedSubscriptionIds, setSelectedSubscriptionIds] = useState([]);
  const [subscriptionPauseView, setSubscriptionPauseView] = useState(false);
  const [isSubscriptionPaused, setIsSubscriptionPaused] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });
  const impersonateBy = localStorage.getItem("Authorization");
  const superAdmin = localStorage.getItem("ImpersonateBy");
  const handelSwitch = (data) => {
    setLoading(true);
    const customerId = get(data, "customerId._id", false);
    dispatch(switchToParkerDashboard({ customerId }))
      .unwrap()
      .then((res) => {
        if (res?.success) {
          dispatch(logout());
          localStorage.setItem("ImpersonateBy", impersonateBy);
          localStorage.setItem("CustomerAuthorization", res?.token);
          if (superAdmin) {
            localStorage.setItem("SuperAdmin", superAdmin);
          }
          navigate("/parker-login");
          setLoading(false);
        } else {
          setLoading(false);
          setNotification({
            ...notification,
            color: "error",
            title: "Error",
            content: res?.message,
            icon: "warning",
            show: true,
          });
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log("error", err);
      });
  };

  const getRenewStatus = ({ endDate, timezone }) => {
    const targetDate = moment.utc(endDate).tz(timezone).startOf("day");
    const yesterday = moment().tz(timezone).subtract(1, "days").startOf("day");
    return !targetDate.isSame(yesterday, "day");
  };

  const handleDownloadInvoice = (invoiceURL) => {
    if (invoiceURL) {
      window.open(invoiceURL, "_blank");
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allRowIds = subscriptionList.map((row) => row._id);
      setSelectedSubscriptionIds(allRowIds);
      setIsSubscriptionPaused(
        subscriptionList[0].isSubscriptionPaused || false
      );
    } else {
      setSelectedSubscriptionIds([]);
    }
  };
  const handleSelectRow = (checked, rowId) => {
    if (checked) {
      setSelectedSubscriptionIds((prev) => [...prev, rowId]);
      const subscriptionStatus = subscriptionList.find(
        (row) => row._id === rowId
      );
      setIsSubscriptionPaused(subscriptionStatus.isSubscriptionPaused || false);
    } else {
      setSelectedSubscriptionIds((prev) => prev.filter((id) => id !== rowId));
    }
  };

  const columnsData = [
    ...(subscriptionType === "active" || subscriptionType === "paused"
      ? [
          {
            field: "SelectAll",
            headerName: "Select All",
            width: 120,
            renderHeader: () => {
              return (
                <div>
                  <Checkbox
                    checked={
                      selectedSubscriptionIds.length ===
                        subscriptionList.length && subscriptionList.length > 0
                    }
                    onChange={(event) => handleSelectAll(event.target.checked)}
                    inputProps={{ "aria-label": "Select all rows" }}
                  />
                  <Label variant="outlined">Select All</Label>
                </div>
              );
            },
            renderCell: (params) => {
              return (
                <Checkbox
                  checked={selectedSubscriptionIds.includes(params.row._id)}
                  onChange={(event) =>
                    handleSelectRow(event.target.checked, params.row._id)
                  }
                  inputProps={{ "aria-label": "Select row" }}
                />
              );
            },
          },
        ]
      : []),
    {
      field: "subscriptionNumber",
      headerName: "Subscription ID",
      width: 120,
      editable: false,
      renderCell: ({ row }) => {
        let color;
        switch (row.subscriptionStatus) {
          case "failed":
            color = "red";
            break;
          case "refunded":
            color = "#1b6be4";
            break;
          case "cancel":
            color = "#f5b642";
            break;
        }
        return (
          <>
            {row.licensePlateGetUpdated ? (
              <IconButton
                onClick={() => {
                  setSubscriptionData(row);
                  setLicensePlateUpdateDialog(true);
                }}
              >
                <Tooltip title="Updates in license plate" placement="top">
                  <MDBox sx={{ position: "relative", display: "inline-block" }}>
                    <Badge
                      badgeContent=""
                      color="success"
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      sx={{
                        position: "absolute",
                        left: "-5px",
                        top: "2px",
                      }}
                    />
                    <MDTypography
                      component="span"
                      variant="caption"
                      style={{ color }}
                    >
                      {row.subscriptionNumber || "-"}
                    </MDTypography>
                  </MDBox>
                </Tooltip>
              </IconButton>
            ) : (
              <MDTypography display="block" variant="caption" style={{ color }}>
                {` ${row.subscriptionNumber || "-"}`}
              </MDTypography>
            )}
          </>
        );
      },
    },
    ...(subscriptionType !== "pending" && subscriptionType !== "refunded"
      ? [
          {
            field: "firstStartDate",
            headerName: "First Start Date",
            width: 150,
            editable: false,
            renderCell: ({ row }) => (
              <MDTypography
                display="block"
                F
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {dateToShow(row.createdAt)}
              </MDTypography>
            ),
          },
          {
            field: "paymentMethodType",
            headerName: "Payment Method",
            width: 120,
            editable: false,
            renderCell: ({ row }) => (
              <MDTypography
                display="block"
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {row.paymentMethodType === "card"
                  ? "Credit card"
                  : row.paymentMethodType === "ACH"
                  ? "ACH"
                  : "-"}
              </MDTypography>
            ),
          },
        ]
      : []),

    {
      field: "duration",
      headerName: "Duration",
      width: 180,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography display="block" variant="caption">
          {getSubscriptionDuration({
            startDate: row.startDate,
            endDate: row.endDate,
            tz: getTimezoneName(),
          })}
        </MDTypography>
      ),
    },
    ...(subscriptionType === "canceled"
      ? [
          {
            field: "subscriptionCancelDate",
            headerName: "Cancel On",
            width: 150,
            editable: false,
            renderCell: ({ row }) => (
              <MDTypography
                display="block"
                F
                variant="caption"
                sx={{ color: "black.light" }}
              >
                {dateToShow(row.subscriptionCancelDate)}
              </MDTypography>
            ),
          },
        ]
      : []),
    {
      field: "licensePlate",
      headerName: "License Plates",
      width: 170,
      editable: false,
      renderCell: ({ row }) => (
        <>
          <div>
            <MDBadge
              badgeContent={`${row.licensePlate[0].licensePlateNumber}`}
              color={sidenavColor}
              variant="gradient"
              size="sm"
              sx={{ marginRight: 1 }}
              max={9999999999}
            />
            {row.licensePlate.filter((obj) => obj.status === 10).length > 1 && (
              <Button
                color={sidenavColor}
                sx={{ padding: 0 }}
                disableRipple
                onClick={() => {
                  setLicensePlateView(true);
                  setLicensePlates(
                    row.licensePlate.filter((obj) => obj.status === 10)
                  );
                }}
              >
                ...
                {row.licensePlate.filter((obj) => obj.status === 10).length - 1}
                more
              </Button>
            )}
          </div>
        </>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 180,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.customerId?.email || "-"}`}
        </MDTypography>
      ),
    },
    {
      field: "cellPhone",
      headerName: "Cell Phone",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${
            row.customerId?.isEmailPrimary
              ? row.customerId?.secondaryMobile &&
                row.customerId?.secondaryMobile !== "N/A"
                ? mobileNumberMasking(row.customerId.secondaryMobile)
                : "-"
              : row.customerId?.mobile
              ? mobileNumberMasking(row.customerId.mobile)
              : "-"
          }`}
        </MDTypography>
      ),
    },

    {
      field: "name",
      headerName: "Name",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {` ${row.customerId?.firstName || ""} ${
            row.customerId?.lastName || ""
          }`}
        </MDTypography>
      ),
    },

    {
      field: "subscriptionType",
      headerName: "Subscription Type",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row.isMonthly ? "Monthly" : "Custom"}
        </MDTypography>
      ),
    },
    {
      field: "isDirectChargeSubscription",
      headerName: "Direct Charge",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row.isDirectChargeSubscription ? "Yes" : "No"}
        </MDTypography>
      ),
    },
    {
      field: "isAutoRenew",
      headerName: "Is Auto Renew",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <MDTypography
          display="block"
          variant="caption"
          sx={{ color: "black.light" }}
        >
          {row.isAutoRenew ? "Yes" : "No"}
        </MDTypography>
      ),
    },

    {
      field: "baseRate",
      headerName: "Base Rate",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isMonthly &&
          row.renewalCount === 0 &&
          row?.baseRate !== row?.firstMonthBaseRate ? (
            <>
              <Stack direction="row" spacing={1}>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light", textDecoration: "line-through" }}
                >
                  {`$${centsToDollars(row?.baseRate)}`}
                </MDTypography>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light" }}
                >
                  {`$${centsToDollars(row?.firstMonthBaseRate)}`}
                </MDTypography>
              </Stack>
            </>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.light" }}
            >
              {`$${centsToDollars(row?.baseRate)}`}
            </MDTypography>
          )}
        </>
      ),
    },

    {
      field: "tax",
      headerName: "Tax",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isMonthly &&
          row.renewalCount === 0 &&
          row?.tax !== row?.firstMonthTax ? (
            <>
              <Stack direction="row" spacing={1}>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light", textDecoration: "line-through" }}
                >
                  {`$${centsToDollars(row?.tax)}`}
                </MDTypography>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light" }}
                >
                  {`$${centsToDollars(row?.firstMonthTax)}`}
                </MDTypography>
              </Stack>
            </>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.light" }}
            >
              {`$${centsToDollars(row?.tax)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    {
      field: "cityTax",
      headerName: "City Tax",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isMonthly &&
          row.renewalCount === 0 &&
          row?.cityTax !== row?.firstMonthCityTax ? (
            <>
              <Stack direction="row" spacing={1}>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light", textDecoration: "line-through" }}
                >
                  {`$${centsToDollars(row?.cityTax || 0)}`}
                </MDTypography>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light" }}
                >
                  {`$${centsToDollars(row?.firstMonthCityTax || 0)}`}
                </MDTypography>
              </Stack>
            </>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.light" }}
            >
              {`$${centsToDollars(row?.cityTax || 0)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    {
      field: "countyTax",
      headerName: "County Tax",
      width: 120,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isMonthly &&
          row.renewalCount === 0 &&
          row?.countyTax !== row?.firstMonthCountyTax ? (
            <>
              <Stack direction="row" spacing={1}>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light", textDecoration: "line-through" }}
                >
                  {`$${centsToDollars(row?.countyTax || 0)}`}
                </MDTypography>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light" }}
                >
                  {`$${centsToDollars(row?.firstMonthCountyTax || 0)}`}
                </MDTypography>
              </Stack>
            </>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.light" }}
            >
              {`$${centsToDollars(row?.countyTax || 0)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    {
      field: "serviceFee",
      headerName: "Service Fee",
      width: 100,
      editable: false,
      renderCell: ({ row }) => (
        <>
          <MDTypography
            display="block"
            variant="caption"
            sx={{ color: "black.light" }}
          >
            {row.isApplyServiceFee ? `$${centsToDollars(row.serviceFee)}` : 0}
          </MDTypography>
        </>
      ),
    },
    {
      field: "paymentGatewayFee",
      headerName: "Payment Gateway Fee",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isMonthly &&
          row.renewalCount === 0 &&
          row?.paymentGatewayFee !== row?.firstMonthPaymentGatewayFee ? (
            <>
              <Stack direction="row" spacing={1}>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light", textDecoration: "line-through" }}
                >
                  {`$${centsToDollars(
                    row.paymentGatewayFeePayBy === "customer"
                      ? row?.paymentGatewayFee
                      : 0
                  )}`}
                </MDTypography>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light" }}
                >
                  {`$${centsToDollars(
                    row.paymentGatewayFeePayBy === "customer"
                      ? row?.firstMonthPaymentGatewayFee
                      : 0
                  )}`}
                </MDTypography>
              </Stack>
            </>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.light" }}
            >
              {`$${centsToDollars(row?.paymentGatewayFee)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      width: 150,
      editable: false,
      renderCell: ({ row }) => (
        <>
          {row.isMonthly &&
          row.renewalCount === 0 &&
          row?.totalAmount !== row?.firstMonthTotalAmount ? (
            <>
              <Stack direction="row" spacing={1}>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light", textDecoration: "line-through" }}
                >
                  {`$${centsToDollars(row?.totalAmount)}`}
                </MDTypography>
                <MDTypography
                  display="block"
                  variant="caption"
                  sx={{ color: "black.light" }}
                >
                  {`$${centsToDollars(row?.firstMonthTotalAmount)}`}
                </MDTypography>
              </Stack>
            </>
          ) : (
            <MDTypography
              display="block"
              variant="caption"
              sx={{ color: "black.light" }}
            >
              {`$${centsToDollars(row?.totalAmount)}`}
            </MDTypography>
          )}
        </>
      ),
    },
    ...(subscriptionType === "paused"
      ? [
        {
          field: "resumeDate",
          headerName: "Resume Date",
          width: 150,
          renderCell: ({ row }) => (
            <MDTypography
              display="block"
              F
              variant="caption"
              sx={{ color: "black.light" }}
            >
              {dateToShow(row.resumeDate)}
            </MDTypography>
          ),
        },
      ]
      : []),
    {
      field: "actions",
      headerName: "Actions",
      width:
        subscriptionType === "active"
          ? 400
          : subscriptionType === "pending"
          ? 250
          : subscriptionType === "expired" || subscriptionType === "failed"
          ? 250
          : 240,

      renderCell: ({ row }) => (
        <>
          <Stack direction="row" alignItems="center" gap={2}>
            <Tooltip title="View Details" placement="top">
              <IconButton
                color="success"
                onClick={() => {
                  setDetailsDialogOpen(true);
                  setSubscriptionId(row._id);
                }}
              >
                <Icon fontSize="small">visibility</Icon>
              </IconButton>
            </Tooltip>

            <Tooltip title={`Impersonate To Parker Dashboard`} placement="left">
              <MDButton
                variant="gradient"
                onClick={() => handelSwitch(row)}
                fontSize="small"
                color={sidenavColor}
              >
                <SelfImprovementIcon />
              </MDButton>
            </Tooltip>

            {subscriptionType === "active" && (
              <>
                <Tooltip title={`Download Invoice`} placement="left">
                  <MDButton
                    variant="gradient"
                    fontSize="small"
                    color={sidenavColor}
                    onClick={() => handleDownloadInvoice(row.invoiceURL)}
                  >
                    <DownloadIcon />
                  </MDButton>
                </Tooltip>
                <MDButton
                  variant="gradient"
                  fontSize="small"
                  color={sidenavColor}
                  onClick={() => {
                    setSubscriptionData(row);
                    setChargeDialogOpen(true);
                  }}
                >
                  <CurrencyExchangeIcon />
                </MDButton>
              </>
            )}

            {(subscriptionType === "expired" ||
              subscriptionType === "upcoming") && (
              <>
                <MDButton
                  variant="gradient"
                  fontSize="small"
                  color={sidenavColor}
                  onClick={() => {
                    setSubscriptionData(row);
                    setChargeDialogOpen(true);
                  }}
                >
                  <CurrencyExchangeIcon />
                </MDButton>
              </>
            )}
            {subscriptionType === "failed" && (
              <>
                <MDButton
                  variant="gradient"
                  fontSize="small"
                  color={sidenavColor}
                  onClick={() => {
                    setSubscriptionData(row);
                    setChargeDialogOpen(true);
                  }}
                >
                  <CurrencyExchangeIcon />
                </MDButton>
              </>
            )}

            {subscriptionType === "pending" && (
              <>
                <IconButton
                  color="error"
                  onClick={() => {
                    setDialogOpen(true);
                    setSubscriptionId(row._id);
                  }}
                >
                  <Icon fontSize="small">delete</Icon>
                </IconButton>
                <Tooltip title="Resend Payment Link" placement="top">
                  <IconButton
                    color={sidenavColor}
                    onClick={() => {
                      setEmailDialogOpen(true);
                      setSubscriptionId(row._id);
                    }}
                  >
                    <Icon fontSize="small">send</Icon>
                  </IconButton>
                </Tooltip>
              </>
            )}
            {subscriptionType === "active" && (
              <>
                <Tooltip
                  title={`${
                    row?.isSubscriptionPaused ? "Resume" : "Pause"
                  } Subscription`}
                  placement="top"
                >
                  <MDButton
                    variant="gradient"
                    fontSize="small"
                    color={sidenavColor}
                    onClick={() => {
                      setSubscriptionPauseView(true);
                      setIsSubscriptionPaused(
                        row.isSubscriptionPaused || false
                      );
                      setSelectedSubscriptionIds([row._id]);
                    }}
                  >
                    {row?.isSubscriptionPaused ? (
                      <PlayCircle />
                    ) : (
                      <PauseCircle />
                    )}
                  </MDButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </>
      ),
    },
  ];

  const handelDelete = () => {
    setLoading(true);
    dispatch(deleteSubscription(subscriptionId))
      .unwrap()
      .then(async (res) => {
        const success = res?.success;
        if (success) {
          await dispatch(getSubscriptionsByPlaceId(placeData?.placeId));
          setLoading(false);
          setDialogOpen(false);
        }
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        setLoading(false);
        setDialogOpen(false);
      })
      .catch((err) => {
        console.error("Error getting delete:", err);
      });
  };

  const handelRefund = () => {
    setLoading(true);
    dispatch(paymentRefund(subscriptionId))
      .unwrap()
      .then(async (res) => {
        const success = res?.success;
        if (success) {
          await dispatch(getSubscriptionsByPlaceId(placeData?._id));
          setLoading(false);
          setConfirmationDialogOpen(false);
        }
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        setLoading(false);
        setConfirmationDialogOpen(false);
      })
      .catch((err) => {
        console.error("Error getting refund:", err);
      });
  };

  const getRowClassName = (params) => {
    return params.row.licensePlateGetUpdated ? "updateAvailable" : "";
  };

  const handelResendEmail = async () => {
    setLoading(true);
    dispatch(sendPaymentLinkEmail(subscriptionId))
      .unwrap()
      .then(async (res) => {
        const success = res?.success;
        if (success) {
          setLoading(false);
          setEmailDialogOpen(false);
        }
        setNotification({
          ...notification,
          color: success ? "success" : "error",
          title: success ? "Success" : "Error",
          content: res?.message,
          icon: success ? "check" : "warning",
          show: true,
        });
        setLoading(false);
        setEmailDialogOpen(false);
      })
      .catch((err) => {
        console.error("Error getting delete:", err);
      });
  };

  return (
    <>
      <MDBox mt={selectedSubscriptionIds.length > 0 ? 0 : 2}>
        {(subscriptionType === "active" || subscriptionType === "paused") &&
          selectedSubscriptionIds.length > 0 && (
            <MDBox display="flex" justifyContent="end" mb={1}>
              <MDButton
                variant="contained"
                size="small"
                color={sidenavColor}
                onClick={() => {
                  setSubscriptionPauseView(true);
                }}
              >
                Action
              </MDButton>
            </MDBox>
          )}
        <MDDataGrid
          rows={!isEmpty(subscriptionList) ? subscriptionList : []}
          columns={columnsData}
          getRowId={(row) => row._id}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          loading={isLoading}
          components={{
            NoRowsOverlay: EmptyTableRowOverlay,
            LoadingOverlay: LinearProgress,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          autoHeight
          getRowClassName={getRowClassName}
        />
      </MDBox>
      <ConfirmationDialog
        title="Delete Confirmation!"
        description="Are you sure you want to delete this subscription?"
        dialogOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        handelClick={handelDelete}
      />
      <ConfirmationDialog
        title="Refund Confirmation!"
        description="Are you sure you want to refund this subscription?"
        dialogOpen={confirmationDialogOpen}
        onClose={() => {
          setConfirmationDialogOpen(false);
        }}
        handelClick={() => handelRefund()}
      />
      <ConfirmationDialog
        title="Resend payment link confirmation!"
        description="Are you sure you want to resend payment link?"
        dialogOpen={emailDialogOpen}
        onClose={() => {
          setEmailDialogOpen(false);
        }}
        handelClick={() => handelResendEmail()}
      />
      <LicensePlateUpdateDialog
        dialogOpen={licensePlateUpdateDialog}
        onClose={() => {
          setLicensePlateUpdateDialog(false);
        }}
        subscription={subscriptionData}
      />
      <SubscriptionDetail
        subscriptionId={subscriptionId}
        dialogOpen={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
        }}
      />
      <SubscriptionChargeDialog
        subscriptionData={subscriptionData}
        dialogOpen={chargeDialogOpen}
        onClose={() => {
          setChargeDialogOpen(false);
        }}
      />
      <LicensePlatesDialog
        licensePlates={licensePlates}
        dialogOpen={licensePlateView}
        onClose={() => {
          setLicensePlateView(false);
        }}
      />
      <PauseDialog
        subscriptionIds={selectedSubscriptionIds}
        dialogOpen={subscriptionPauseView}
        isSubscriptionPaused={isSubscriptionPaused}
        onClose={() => {
          setSubscriptionPauseView(false);
          setSelectedSubscriptionIds([]);
        }}
        placeData={placeData}
      />

      <CircularIndeterminate
        type="full"
        size={20}
        text="Please wait..."
        open={loading}
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
    </>
  );
};

export default SubscriptionsTable;
