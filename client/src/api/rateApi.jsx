import AxiosDefault from "services/AxiosDefault";

export const getRatesAPI = async () => {
  const response = await AxiosDefault({
    method: "GET",
    url: "/rates/get",
  });
  return response;
};

export const CreateRateAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/rates/create",
    data,
  });
  return response;
};
export const DeleteRateAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: "/rates/deleteRate",
    data: data,
  });
  return response;
};

export const StatusUpdateAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: "/rates/statusUpdate",
    data: data,
  });
  return response;
};

export const AssignRatesAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/assign/post`,
    data,
  });
  return response;
};

export const getAssignRatesAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/assign/get/${placeId}`,
  });
  return response;
};

export const getAssignRatesTableDataAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/assign/getRates/${placeId}`,
  });
  return response;
};

export const getCalenderDataAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/assign/getCalenderData/${placeId}`,
  });
  return response;
};

export const SpecialEventRatesAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/assign/postSpecialEvent`,
    data,
  });
  return response;
};

export const BlackoutDayRatesAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/assign/postBlackoutDay`,
    data,
  });
  return response;
};

export const deleteAssignRateAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: `/assign/delete`,
    data: data,
  });
  return response;
};

export const GetRatesByPlaceIdAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/rates/getRates/${placeId}`,
  });
  return response;
};
