import AxiosDefault from "services/AxiosDefault";

export const CreatePermitsOptionAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/permitsOptions/create",
    data,
  });
  return response;
};

export const GetPermitsOptionsAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/permitsOptions/get`,
    data,
  });
  return response;
};

export const UpdatePermitsOptionAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/permitsOptions/update`,
    data,
  });
  return response;
};
