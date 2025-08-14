import AxiosDefault from "services/AxiosDefault";

export const CreateDiscordAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/settings/discord/create",
    data,
  });
  return response;
};

export const GetDiscordAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/settings/discord/get/${placeId}`
  });
  return response;
};
export const DeleteDiscordAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: "/settings/discord/deleteDiscord",
    data: data,
  });
  return response;
};

export const updateDiscordAPI = async ({placeId, ...rest}) => {
    const response = await AxiosDefault({
      method: "PUT",
      url: `/settings/discord/update/${placeId}`,
      data: rest
    });
    return response; 
};
