import AxiosDefault from "services/AxiosDefault";

export const CreateValidationAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/validations/create",
    data,
  });
  return response;
};
export const DeleteValidationAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: "/validations/deleteValidation",
    data: data,
  });
  return response;
};

export const GetValidationsByPlaceIdAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/validations/getValidations/${placeId}`,
  });
  return response;
};
export const GetAllValidationsAPI = async () => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/validations/getValidations`,
  });
  return response;
};
