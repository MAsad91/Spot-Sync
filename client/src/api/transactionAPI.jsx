import AxiosDefault from "services/AxiosDefault";

export const GetTransactionsByPlaceIdAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/transactions/getTransactions`,
    data: data,
  });
  return response;
};
