import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { find, get } from "lodash";
import React, { useEffect, useState } from "react";
import amexLogo from "../../../assets/images/card-logo/amex.svg";
import dinersLogo from "../../../assets/images/card-logo/diners.svg";
import discoverLogo from "../../../assets/images/card-logo/discover.svg";
import jcbLogo from "../../../assets/images/card-logo/jcb.svg";
import mastercardLogo from "../../../assets/images/card-logo/mastercard.svg";
import unionpayLogo from "../../../assets/images/card-logo/unionpay.svg";
import visaLogo from "../../../assets/images/card-logo/visa.svg";
import { Stack } from "@mui/material";
import { useDispatch } from "react-redux";
import { getPaymentMethod } from "store/slice/customer/customerSlice";

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
  paymentMethodId,
  customerId,
  isACHPayment,
  paymentData,
  isDirectCharge
}) => {
  const dispatch = useDispatch();
  const [paymentMethodData, setPaymentMethodData] = useState({});

  useEffect(() => {
    const params = {
      customerId,
      paymentMethodId,
      authorizenetCustomerId: paymentData?.authorizenetCustomerId,
      placeId: paymentData?.placeId,
      isDirectCharge: isDirectCharge
    };
    dispatch(getPaymentMethod(params))
      .unwrap()
      .then((result) => {
        console.log("result ---->",result)
        if (result.success) {
          setPaymentMethodData(result.data);
        }
      })
      .catch((err) => {
        throw err;
      });
  }, [customerId, dispatch, paymentMethodId]);
  const cardLogo = find(
    logoObj,
    (data) => data.name === (paymentMethodData?.card?.brand || "visa")
  );

  console.log("paymentMethodData ===>", paymentMethodData);
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
                {`${paymentMethodData?.us_bank_account?.bank_name}`}
              </MDTypography>
              <MDTypography variant="p" fontSize={14} color="gray">
                {`**** **** **** ${
                  paymentMethodData?.us_bank_account?.last4 || "0000"
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
              {paymentData.paymentStatus === "failed" ? (
                <>
                  <MDTypography variant="p" fontSize={14} color="gray">
                    {`**** **** **** ${
                      paymentData?.paymentInfo?.payment_method?.card?.last4 ||
                      paymentData?.paymentInfo?.transactionResponse?.accountNumber?.slice(-4) ||
                      "0000"
                    }`}
                  </MDTypography>
                  <MDTypography variant="p" fontSize={14} color="gray">
                    {`Expiry:${
                      paymentData?.paymentInfo?.payment_method?.card
                        ?.exp_month || "XX"
                    }/${
                      paymentData?.paymentInfo?.payment_method?.card?.exp_year %
                        100 || "XX"
                    }`}
                  </MDTypography>
                </>
              ) : (
                <>
                  <MDTypography variant="p" fontSize={14} color="gray">
                    {`**** **** **** ${
                      paymentMethodData?.card?.last4 || "0000"
                    }`}
                  </MDTypography>
                  <MDTypography variant="p" fontSize={14} color="gray">
                    {`Expiry:${paymentMethodData?.card?.exp_month || "01"}/${
                      paymentMethodData?.card?.exp_year % 100 || "XX"
                    }`}
                  </MDTypography>
                </>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    </MDBox>
  );
};

export default PaymentMethod;
