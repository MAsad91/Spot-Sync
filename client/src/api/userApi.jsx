import AxiosDefault from "services/AxiosDefault";

export const GetUserInfo = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: "/users/get",
    data: data,
  });
  return response;
};

export const GetAllUserAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: "/users/getUsers",
    data: data,
  });
  return response;
};

export const GetExportUserAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: "/users/getExportUsers",
    data: data,
  });
  return response;
};

export const CreateUserAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/users/create",
    data: data,
  });
  return response;
};

export const UpdateUserAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: "/users/updateUser",
    data: data,
  });
  return response;
};

export const PasswordResetAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/users/passwordReset",
    data: data,
  });
  return response;
};

export const DeleteUserAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: "/users/deleteUser",
    data: data,
  });
  return response;
};

export const StatusUpdateAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: "/users/statusUpdate",
    data: data,
  });
  return response;
};

export const GetMeInfo = async () => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/users/me`,
  });
  return response;
};