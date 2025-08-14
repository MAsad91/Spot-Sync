import AxiosDefault from "services/AxiosDefault";

export const GetReservationsByPlaceIdAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/reservations/list`,
    data: data,
  });
  return response;
};

export const GetReservationsStatisticsAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "get",
    url: `/reservations/statistics/${placeId}`,
  });
  return response;
};

export const CreateReservationAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/reservations/create`,
    data: data,
  });
  return response;
};

export const GetRatesByPlaceIdAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/reservations/rates/${placeId}`,
  });
  return response;
};
