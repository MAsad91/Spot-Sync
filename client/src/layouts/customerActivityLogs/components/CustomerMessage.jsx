import React from "react";
import moment from 'moment';
const { get } = require("lodash");

const getCustomerNameInitials = (customer) => {
  const initials = `${customer?.firstName ? customer.firstName[0] : ''} ${customer?.lastName ? customer.lastName[0] : ''}`.trim();
  return initials ? initials : 'UC'
}

const getContext = (body) => {
  const context = body?.queryResult?.outputContexts;
  return context;
};

const getFormDetails = (activityLog) => {
  const context = getContext(activityLog.requestBody);
  const refContext = context?.find((c) =>
    c.name.includes("botcopy-form-context")
  );

  const botcopyFormValues = get(
    refContext,
    "parameters",
    null
  );

  let formDetails = "";
  if (botcopyFormValues) {
    Object.keys(botcopyFormValues).forEach((key) => {
      let value = botcopyFormValues[key];

      if (key === "isAutoRenew" && botcopyFormValues[key]) {
        value = botcopyFormValues[key]["isAutoRenew"];
      }

      formDetails = `${formDetails}${key}: ${value}\n`;
    }
  )};

  return formDetails;
}

const TextMessage = ({ activityLog, customerActivityLog }) => {
  const customer = customerActivityLog?.customerId ? customerActivityLog.customerId : {};
  let customerName = `${customer?.firstName ? customer.firstName : ''} ${customer?.lastName ? customer.lastName : ''}`.trim();
  customerName = customerName ? customerName : 'Unknown Customer';
  let title = `Intent Name: ${activityLog.intentName}`;

  const formDetails = getFormDetails(activityLog);
  if (formDetails !== "") {
    title = `${title}\nInput Context:\n${formDetails}`.trim();
  }
  return (
    <div className="messageContent customerMessageContent">
      <div className="messageHolder customerMessageHolder" title={title}>
        <div className="customerMessageIcon" title={customerName}>
          {getCustomerNameInitials(customerActivityLog?.customerId)}
        </div>
        <div className="textMessageBubble">
          <div>
            {activityLog.inputContext}
          </div>
          <div className="messageTime">
            { moment(activityLog.createdAt).format("YYYY-MM-DD HH:mm") }
          </div>
        </div>
      </div>
    </div>
  )
}

const CustomerMessage = ({ activityLog, customerActivityLog }) => {
  return (
    <TextMessage
      activityLog={activityLog}
      customerActivityLog={customerActivityLog}
    />
  );
};
export default CustomerMessage;
