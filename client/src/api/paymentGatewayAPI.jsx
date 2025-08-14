import AxiosDefault from "services/AxiosDefault";

export const getConnectAccountsAPI = async () => {
  const response = await AxiosDefault({
    method: "GET",
    url: "/settings/paymentGateway/getConnectAccounts",
  });
  return response;
};