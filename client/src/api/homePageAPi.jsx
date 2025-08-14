import AxiosDefault from "services/AxiosDefault";

export const GetDashboardStatisticsApi = async () => {
  const response = await AxiosDefault({
    method: "get",
    url: "/dashboard/statistics/get",
  });
  return response;
};

export const GetTotalBookingsAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `statistics/getTotalBooking?placeId=${data.placeIds.join('&placeId=')}`,
    params: data,

  });
  return response;
};
export const GetTotalCustomersAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `statistics/getTotalCustomer?placeId=${data.placeIds.join('&placeId=')}`,
    params: data
  });
  return response;
};

export const GetTotalRevenueAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `statistics/getTotalRevenue?placeId=${data.placeIds.join('&placeId=')}`,
    params: data
  });
  return response;
};

export const GetTotalTaxAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `statistics/getTotalTax?placeId=${data.placeIds.join('&placeId=')}`,
    params: data
  });
  return response;
};

export const GetTotalServiceFeeAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `statistics/getTotalServiceFee?placeId=${data.placeIds.join('&placeId=')}`,
    params: data
  });
  return response;
};

export const GetWeeklyBookingsAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `statistics/getWeeklyBookingstats?placeId=${data.placeIds.join('&placeId=')}`,
    params: data,

  });
  return response;
};

export const GetWeeklyRevenueAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `statistics/getWeeklyRevenuestats?placeId=${data.placeIds.join('&placeId=')}`,
    params: data
  });
  return response;
};

export const GetMonthlyBookingsAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `statistics/getMonthlyBookingstats?placeId=${data.placeIds.join('&placeId=')}`,
    params: data
  });
  return response;
};

export const GetMonthlyRevenueAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `statistics/getMonthlyRevenuestats?placeId=${data.placeIds.join('&placeId=')}`,
    params: data
  });
  return response;
};

export const DailyStatisticsAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `statistics/dailyStatistics`,
    data
  });
  return response;
};

export const ReturningUsersAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `statistics/returningUser?placeId=${data.placeIds.join('&placeId=')}`,
    data
  });
  return response;
};

export const TopSellingRatesAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `statistics/topSellingRates?placeId=${data.placeIds.join('&placeId=')}`,
    data
  });
  return response;
};
