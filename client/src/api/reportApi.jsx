import AxiosDefault from "services/AxiosDefault";

export const GetTransactionReportAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/report/getTransactionReport`,
    data: data,
  });
  return response;
};

export const GetReservationReportAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/report/getReservationReport`,
    data: data,
  });
  return response;
};

export const GetSubscriptionReportAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/report/getSubscriptionReport`,
    data: data,
  });
  return response;
};

export const GetRevenueSummaryAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/report/getRevenueSummary`,
    data: data,
  });
  return response;
};

export const GetDepositReportAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/report/getDepositReport`,
    data: data,
  });
  return response;
};
