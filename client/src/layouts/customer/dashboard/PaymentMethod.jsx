import { Icon, IconButton, Stack, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { find, get } from "lodash";
import React from "react";
import amexLogo from "../../../assets/images/card-logo/amex.svg";
import dinersLogo from "../../../assets/images/card-logo/diners.svg";
import discoverLogo from "../../../assets/images/card-logo/discover.svg";
import jcbLogo from "../../../assets/images/card-logo/jcb.svg";
import mastercardLogo from "../../../assets/images/card-logo/mastercard.svg";
import unionpayLogo from "../../../assets/images/card-logo/unionpay.svg";
import visaLogo from "../../../assets/images/card-logo/visa.svg";

const logoObj = [
  {
    name: "visa",
    logo: visaLogo,
  },
  {
    name: "amex",
    logo: amexLogo,
  },
  {
    name: "mastercard",
    logo: mastercardLogo,
  },
  {
    name: "discover",
    logo: discoverLogo,
  },
  {
    name: "diners",
    logo: dinersLogo,
  },
  {
    name: "jcb",
    logo: jcbLogo,
  },
  {
    name: "unionpay",
    logo: unionpayLogo,
  },
];

const PaymentMethod = ({
  setPaymentMethodEdit,
  paymentMethodData,
  setUpdateCard,
  isCanceled,
  isACHPayment,
}) => {
  const cardLogo = find(
    logoObj,
    (data) => data.name === (paymentMethodData?.card?.brand || "visa")
  );
  return (
    <MDBox
      borderColor={"#cbd5e1"}
      paddingTop={3}
      paddingBottom={5}
      paddingLeft={2}
      paddingRight={2}
      sx={{ bgcolor: "#ffffff !important" }}
    >
      <Stack
        direction="row"
        border="2px solid #cbd5e1"
        padding={3}
        justifyContent="space-between"
        alignItems="center"
        borderRadius={2}
        backgroundColor="#f0f2f5"
      >
        {isACHPayment ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <MDBox
              component="img"
              src="https://img.icons8.com/dotty/80/bank-building.png"
              sx={{ width: "40px" }}
            />
            <Stack spacing={-1}>
              <MDTypography variant="p" fontSize={14} color="gray">
                {`${paymentMethodData.us_bank_account.bank_name}`}
              </MDTypography>
              <MDTypography variant="p" fontSize={14} color="gray">
                {`**** **** **** ${
                  paymentMethodData.us_bank_account.last4 || "0000"
                }`}
              </MDTypography>
            </Stack>
          </Stack>
        ) : (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <MDBox
              component="img"
              src={get(cardLogo, "logo", "visa")}
              sx={{ width: "40px" }}
            />
            <Stack spacing={-1}>
              <MDTypography variant="p" fontSize={14} color="gray">
                {`**** **** **** ${paymentMethodData?.card?.last4 || "0000"}`}
              </MDTypography>
              <MDTypography variant="p" fontSize={14} color="gray">
                {`Expiry:${paymentMethodData?.card?.exp_month || "XX"}/${
                  paymentMethodData?.card?.exp_year % 100 || "XX"
                }`}
              </MDTypography>
            </Stack>
          </Stack>
        )}

        <Stack direction="row" alignItems="center" spacing={1}>
          {!isCanceled && !isACHPayment && (
            <Tooltip title="Edit" placement="top">
              <IconButton
                size="small"
                onClick={() => {
                  setUpdateCard(true);
                }}
              >
                <Icon>edit</Icon>
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Cancel" placement="top">
            <IconButton
              size="small"
              onClick={() => {
                setPaymentMethodEdit(false);
                setUpdateCard(false);
              }}
            >
              <Icon>cancel</Icon>
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </MDBox>
  );
};

export default PaymentMethod;
