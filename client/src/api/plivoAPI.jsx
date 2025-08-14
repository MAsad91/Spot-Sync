import AxiosDefault from "services/AxiosDefault";

export const getPlivosAPI = async () => {
  const response = await AxiosDefault({
    method: "GET",
    url: "/settings/plivos/get",
  });
  return response;
};