import AxiosDefault from "services/AxiosDefault";

export const CreateSubscriptionAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/subscriptions/create",
    data,
  });
  return response;
};
export const GetSubscriptionsByPlaceIdAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/subscriptions/getSubscriptions/${placeId}`,
  });
  return response;
};

export const GetRawSubscriptionsByPlaceIdAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/subscriptions/rawSubscriptions/${placeId}`,
  });
  return response;
};

export const createRawBulkSubscriptionAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/subscriptions/bulkSubscriptions`,
    data,
  });
  return response;
};

export const GetSubscriptionServiceFeeAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/subscriptions/getSubscriptionServiceFee/${placeId}`,
  });
  return response;
};

export const DeleteSubscriptionAPI = async (subscriptionId) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: `/subscriptions/deleteSubscription/${subscriptionId}`,
  });
  return response;
};

export const GetSubscriptionStatisticsAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/subscriptions/getSubscriptionStatistics/${placeId}`,
  });
  return response;
};

export const GetSubscriptionPaymentLogsAPI = async (subscriptionId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/subscriptions/getSubscriptionPaymentLogs/${subscriptionId}`,
  });
  return response;
};

export const GetSubscriptionDetail = async (subscriptionId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/subscriptions/detail/${subscriptionId}`,
  });
  return response;
};

export const RenewSubscriptionAPI = async (subscriptionId) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: `/subscriptions/renewSubscription/${subscriptionId}`,
  });
  return response;
};

export const SendReminderEmailAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/subscriptions/sendReminderEmail`,
    data,
  });
  return response;
};

export const UpdateLicensePlateAPI = async ({ subscriptionId, ...rest }) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/subscriptions/updateLicensePlate/${subscriptionId}`,
    data: rest,
  });
  return response;
};

export const EditLicensePlateAPI = async ({ subscriptionId, ...rest }) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/subscriptions/editLicensePlate/${subscriptionId}`,
    data: rest,
  });
  return response;
};

export const DeclineUpdateLicensePlateAPI = async ({
  subscriptionId,
  ...rest
}) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/subscriptions/declineUpdateLicensePlate/${subscriptionId}`,
    data: rest,
  });
  return response;
};

export const SendPaymentLinkEmailAPI = async (subscriptionId) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: `/subscriptions/sendPaymentLinkEmail/${subscriptionId}`,
  });
  return response;
};

export const GetSubscriptionsSummariesAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/subscriptions/getSubscriptionsSummaries/${placeId}`,
  });
  return response;
};

export const UpdateSubscriptionPauseStatusAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/subscriptions/updateSubscriptionPauseStatus`,
    data,
  });
  return response;
}