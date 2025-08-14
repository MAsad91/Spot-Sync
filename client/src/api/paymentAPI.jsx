import AxiosDefault from "services/AxiosDefault";

export const GetShortlyDetails = async (id) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/payment/shortlyDetails/${id}`,
  });
  return response;
};

export const GetParkingShortlyDetails = async (id) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/payment/parking/shortlyDetails/${id}`,
  });
  return response;
};

export const PostCardPayment = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/payment/intent`,
    data: data,
  });
  return response;
};
export const PostParkingCardPayment = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/payment/parking/intent`,
    data: data,
  });
  return response;
};

export const GetCardDetails = async (id, placeId = null) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/payment/getCardDetails/${id}?placeId=${placeId}`,
  });
  return response;
};

export const DeleteCard = async (id, placeId = null) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: `/payment/paymentMethodDelete/${id}?placeId=${placeId}`,
  });
  return response;
};

export const GetPaymentActiveMethods = async () => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/payment/paymentMethod/active-list`,
  });
  return response;
};

export const RefundPayment = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/payment/paymentRefund`,
    data: data,
  });
  return response;
};

export const PostACHPayment = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/payment/intentACH`,
    data: data,
  });
  return response;
};

export const GenerateClientSecret = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/payment/generateClientSecret`,
    data: data,
  });
  return response;
};

export const GetAuthorizenetPaymentMethods = async (customerId, placeId) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/payment/authorizenet/fetchPaymentMethods`,
    data: { customerId, placeId },
  });
  return response;
};

export const UpdateSubscriptionAfter3dSecure = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/payment/updateSubscriptionAfter3dSecure`,
    data,
  });
  return response;
};

export const cashPaymentAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/payment/cash`,
    data: data,
  });
  return response;
};
