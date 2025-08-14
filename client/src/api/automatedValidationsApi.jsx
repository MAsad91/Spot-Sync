import AxiosDefault from "services/AxiosDefault";

export const createAutomatedValidationAPI = async (data) => {
    const response = await AxiosDefault({
      method: "POST",
      url: "/automatedValidations/create",
      data
    });
    return response; 
};

export const getAutomatedValidationsAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/automatedValidations/get/${placeId}`
  });
  return response;
};

export const deleteAutomatedValidationAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/automatedValidations/delete/${placeId}`
  });
  return response;
};

