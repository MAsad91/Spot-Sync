import AxiosDefault from "services/AxiosDefault";

export const CreatePermitAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/permit/create",
    data,
  });
  return response;
};

export const GetPermitByPlaceIdAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/permit/getpermit`,
    data,
  });
  return response;
};

export const DeletePermitAPI = async (permitId) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: `/permit/deletePermit/${permitId}`,
  });
  return response;
};

export const GetPermitStatisticsAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/permit/getpermitstatistics/${placeId}`,
  });
  return response;
};

export const UpdatePermitAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/permit/updatePermit`,
    data,
  });
  return response;
};