import { Avatar, Box, Button, Typography } from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import { Stack } from "@mui/system";
import CustomerDashboardLayout from "examples/LayoutContainers/CustomerDashboardLayout";
import Header from "../dashboard/Header";
import ProfileInfo from "../dashboard/ProfileInfo";

export const ParkerButton = ({ text, fullWidth = false, onClick }) => {
  return (
    <Button
      variant="contained"
      size="small"
      color="primary"
      fullWidth={fullWidth}
      sx={{ height: "100%" }}
      onClick={onClick}
    >
      <Typography
        variant="h6"
        fontSize={13}
        fontWeight="bold"
        sx={{ color: "white !important" }}
      >
        {text}
      </Typography>
    </Button>
  );
};

const ParkerActivePaymentMethod = () => {
  return (
    <Stack
      direction="row"
      border="2px solid #cbd5e1"
      padding={3}
      justifyContent="space-between"
      alignItems="center"
      borderRadius={2}
      backgroundColor="#f0f2f5"
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Avatar sx={{ bgcolor: deepPurple[500] }}>
          {"Talha".substring(0, 1)}
        </Avatar>
        <Stack spacing={-1}>
          <Typography variant="p" fontSize={14} color="gray">
            **** **** **** 1234
          </Typography>
          <Typography variant="p" fontSize={14} color="gray">
            Expiry: 12/24
          </Typography>
        </Stack>
      </Stack>
      <ParkerButton text="Edit" />
    </Stack>
  );
};

const ParkerActivePaymentMethodInfo = () => {
  return (
    <Box
      borderBottom="2px solid gray"
      borderColor={"#cbd5e1"}
      paddingTop={3}
      paddingBottom={5}
      paddingLeft={2}
      paddingRight={2}
      sx={{ bgcolor: "#ffffff !important" }}
    >
      <Typography marginBottom={2} variant="h5" align="center">
        Active Payment Method
      </Typography>
      <ParkerActivePaymentMethod />
    </Box>
  );
};

const ParkerTransactionCard = ({ date, title, totalPaid }) => {
  return (
    <Box sx={{ bgcolor: "white !important" }}>
      <Stack
        gap={2}
        paddingTop={3}
        paddingBottom={3}
        borderBottom="2px solid #cbd5e1"
      >
        <Stack
          direction="row"
          alignItems={"center"}
          justifyContent="space-between"
          bgColor="red"
          paddingLeft={2}
          paddingRight={2}
        >
          <Typography variant="body2" fontSize={16} fontWeight="bold">
            Date
          </Typography>
          <Typography
            variant="body2"
            fontSize={16}
            fontWeight="bold"
            color="gray"
          >
            {date}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          alignItems={"center"}
          justifyContent="space-between"
          bgColor="red"
          paddingLeft={2}
          paddingRight={2}
        >
          <Typography variant="body2" fontSize={16} fontWeight="bold">
            Title
          </Typography>
          <Typography
            variant="body2"
            fontSize={16}
            fontWeight="bold"
            color="gray"
          >
            {title}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          alignItems={"center"}
          justifyContent="space-between"
          bgColor="red"
          paddingLeft={2}
          paddingRight={2}
        >
          <Typography variant="body2" fontSize={16} fontWeight="bold">
            Total Paid
          </Typography>
          <Typography
            variant="body2"
            fontSize={16}
            fontWeight="bold"
            color="gray"
          >
            {totalPaid}
          </Typography>
        </Stack>
      </Stack>
      <Stack
        direction={"row"}
        justifyContent="center"
        alignItems="center"
        padding={3}
      >
        <ParkerButton text="Download" />
      </Stack>
    </Box>
  );
};

const ParkerTransactions = () => {
  return (
    <Box
      borderBottom="2px solid #cbd5e1"
      paddingTop={3}
      paddingBottom={3}
      paddingLeft={{ xs: 2, sm: 0 }}
      paddingRight={{ xs: 2, sm: 0 }}
    >
      <Typography variant="h5" align="center" marginBottom={3}>
        Transactions
      </Typography>
      <Stack gap={3}>
        {[...Array(3)].map((_, _index) => (
          <ParkerTransactionCard
            date="12/01/2024"
            title="Subscription Renewal - # Plates"
            totalPaid="145"
          />
        ))}
      </Stack>
    </Box>
  );
};

const ParkerDashboardPaymentManagement = () => {
  return (
    <CustomerDashboardLayout>
      <Header />
      <ProfileInfo />
      <ParkerActivePaymentMethodInfo />
      <ParkerTransactions />
    </CustomerDashboardLayout>
  );
};

export default ParkerDashboardPaymentManagement;
