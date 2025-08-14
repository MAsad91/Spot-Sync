import MDBox from "components/MDBox";
import React, { useState } from "react";
import { Card, Avatar } from "@mui/material";
import googlePay from "../../assets/icons/google-pay.png.png";
import applePay from "../../assets/icons/apple-pay.png.png";
import CreditCard from "../../assets/icons/credit-card.png.png";
import MDTypography from "components/MDTypography";

const ChoosePaymentCard = ({
  iconName,
  label,
  selectPayment,
  setSelectPayment,
  setSelectedMethod,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    setSelectPayment(!selectPayment);
    setSelectedMethod(iconName);
  };

  let icon;
  switch (iconName) {
    case "card":
      icon = CreditCard;
      break;
    case "googlePay":
      icon = googlePay;
      break;
    case "applePay":
      icon = applePay;
      break;
    case "ach":
      icon = CreditCard;
      break;
    case "cash":
      // For cash, we'll use a text-based icon since we don't have a cash icon
      icon = null;
      break;
    default:
      break;
  }
  return (
    <>
      <MDBox p={2} onClick={handleCardClick} className="cursor-pointer">
        <Card>
          <MDBox
            p={1.5}
            display="flex"
            alignItems="center"
            justifyContent="between"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <MDBox
              display="grid"
              justifyContent="center"
              alignItems="center"
              width="3rem"
              height="3rem"
              borderRadius="lg"
              variant="gradient"
              mr={2}
              p={1}
            >
              {icon ? (
                <Avatar
                  src={icon}
                  alt={iconName}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <MDBox
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  width="100%"
                  height="100%"
                  bgcolor="primary.main"
                  borderRadius="50%"
                >
                  <MDTypography variant="h6" color="white" fontWeight="bold">
                    $
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
            <MDBox>
              <MDTypography
                variant="subtitle2"
                color={isHovered ? "info" : "text"}
                fontWeight="bold"
              >
                {label}
              </MDTypography>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
    </>
  );
};

export default ChoosePaymentCard;
