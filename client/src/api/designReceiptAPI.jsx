import AxiosDefault from "services/AxiosDefault";

export const CreateDesignReceiptAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/designReceipt/create",
    data,
  });
  return response;
};
