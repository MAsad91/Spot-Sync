import AxiosDefault from "services/AxiosDefault";

export const GetEnforcementsByPlaceIdAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/enforcements/getEnforcements`,
    data: data,
  });
  return response;
};
