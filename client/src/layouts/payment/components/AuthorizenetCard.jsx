import { useState } from 'react';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import axios from 'axios';
import MDSnackbar from "components/MDSnackbar";

const AuthorizenetCard = (props) => {
  const { cardDetails, place, customerId } = props;

  const [disableSubmit, setDisableSubmit] = useState(false);
  const [notification, setNotification] = useState({
    color: "",
    icon: "",
    title: "",
    content: "",
    show: false,
    close: () => setNotification({ ...notification, show: false }),
  });
  
  const deleteCard = async () => {
    try {
      setDisableSubmit(true);
      const paymentMethodInfo = {
        customerPaymentProfileId: cardDetails.customerPaymentProfileId,
        customerId: customerId,
        placeId: place._id,
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_END_POINT}/payment/authorizenet/paymentMethodDelete`,
        paymentMethodInfo
      );

      if (res?.data?.success && props.getPaymentMethods) {
        await props.getPaymentMethods();
      }

      const success = res?.data?.success;
      setNotification({
        ...notification,
        color: success ? "success" : "error",
        title: success ? "Success" : "Error",
        content: res?.data?.message,
        icon: success ? "check" : "warning",
        show: true,
      });
    } catch (error) {
      setNotification({
        ...notification,
        color: "error",
        title: "Error",
        content: (error?.messages?.message[0] ? error.messages?.message[0].text : "Unknown Error Occurred"),
        icon: "warning",
        show: true,
      });
    } finally {
      setDisableSubmit(false);
    }
  };

  const isListCard = props.variant === "list";
  const variantStyle = isListCard ? "caption" : "body2";
  return (
    <MDBox
      key={cardDetails.customerPaymentProfileId}
      className="my-2 bg-white"
      borderRadius="5px"
      border="1px solid #E0E0E0"
      p={2}
    >
      {isListCard &&
        <MDBox className="d-flex justify-content-end">
          <IconButton
            onClick={deleteCard}
            variant="text"
            color="error"
            size="small"
            disabled={disableSubmit}
          >
            <Icon>delete</Icon>
          </IconButton>
        </MDBox>
      }
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        className="cursor-pointer"
        onClick={props.onClick}
      >
        <MDTypography variant="body1">
          {cardDetails.payment.creditCard.cardType}
        </MDTypography>

        <MDBox>
          <MDBox>
            <MDTypography variant={variantStyle}>
                {`Card No: ${cardDetails.payment.creditCard.cardNumber}`}
            </MDTypography>
          </MDBox>
          
          <MDBox>
            <MDTypography variant={variantStyle}>
                {`Expire Date: ${cardDetails.payment.creditCard.expirationDate}`}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      
      <MDSnackbar
        color={notification.color}
        icon={notification.icon}
        title={notification.title}
        content={notification.content}
        open={notification.show}
        close={notification.close}
        bgWhite
      />
    </MDBox>
  );
}

export default AuthorizenetCard;
