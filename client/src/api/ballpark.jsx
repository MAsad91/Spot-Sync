import AxiosDefault from "services/AxiosDefault";

export const GetBallparkLocationsAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/settings/ballpark/getLocations",
    data,
  });
  return response;
};
