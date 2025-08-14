import AxiosDefault from "services/AxiosDefault";

export const PostLogin = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/auth/login",
    data: data,
  });
  return response;
};
export const PostSwitchUser = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/auth/token",
    data: data,
  });
  return response;
};

