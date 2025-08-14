import AxiosDefault from "services/AxiosDefault";

export const GetCustomerActivityLogsByPlaceIdAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `places/${data.placeId}/customerActivityLogs/?placeId=${data.placeId}`,
    data: data,
  });
  return response;
};

export const GetActivityLogs = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `places/${data.placeId}/customerActivityLogs/${data.customerActivityLogId}?placeId=${data.placeId}`,
    data: data,
  });
  return response;
};
