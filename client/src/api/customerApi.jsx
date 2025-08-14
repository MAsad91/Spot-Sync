import AxiosDefault from "services/AxiosDefault";

export const PostLogin = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/customer/login",
    data: data,
  });
  return response;
};

export const PostOtpVerify = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/customer/otpVerify",
    data: data,
  });
  return response;
};

export const PostOtpResend = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/customer/otpResend",
    data: data,
  });
  return response;
};

export const GetCustomerInfo = async () => {
  const response = await AxiosDefault({
    method: "GET",
    url: "/customer/info",
    isCustomer: true,
  });
  return response;
};

export const GetSubscriptionByCustomerId = async () => {
  const response = await AxiosDefault({
    method: "GET",
    url: "/customer/subscriptions",
    isCustomer: true,
  });
  return response;
};

export const GetPaymentMethodAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/customer/paymentMethod`,
    isCustomer: true,
    data,
  });
  return response;
};

export const UpdatePaymentMethodAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/customer/updatePaymentMethod`,
    isCustomer: true,
    data,
  });
  return response;
};

export const CancelSubscriptionAPI = async ({ subscriptionId, ...rest }) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/customer/cancelSubscription/${subscriptionId}`,
    isCustomer: true,
    data: rest,
  });
  return response;
};

export const UpdateLicensePlateAPI = async ({ subscriptionId, ...rest }) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/customer/updateLicensePlate/${subscriptionId}`,
    isCustomer: true,
    data: rest,
  });
  return response;
};

export const GetPaymentHistoryAPI = async (subscriptionId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/customer/getPaymentHistory/${subscriptionId}`,
    isCustomer: true,
  });
  return response;
};

export const PostSwitchToParkerDashboard = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/customer/token",
    data: data,
  });
  return response;
};

export const AddLicensePlateAPI = async ({ subscriptionId, ...rest }) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/customer/addLicensePlate/${subscriptionId}`,
    isCustomer: true,
    data: rest,
  });
  return response;
};

export const DeleteLicensePlateAPI = async ({ subscriptionId, ...rest }) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/customer/deleteLicensePlate/${subscriptionId}`,
    isCustomer: true,
    data: rest,
  });
  return response;
};

export const RenewSubscriptionAPI = async ({ subscriptionId , ...rest }) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: `/subscriptions/renewSubscription/${subscriptionId}`,
    isCustomer: true,
    data: rest
  });
  return response;
};
