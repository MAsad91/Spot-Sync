import AxiosDefault from "services/AxiosDefault";

export const createAutomatedReportAPI = async (data) => {
    const response = await AxiosDefault({
      method: "POST",
      url: "/automatedReports/create",
      data
    });
    return response; 
};

export const getAutomatedReportsAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/automatedReports/get/${placeId}`
  });
  return response;
};

export const getAllAutomatedReportsAPI = async () => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/automatedReports/getReports`
  });
  return response;
};

export const deleteAutomatedReportAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/automatedReports/delete/${placeId}`
  });
  return response;
};

