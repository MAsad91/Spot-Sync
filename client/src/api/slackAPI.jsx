import AxiosDefault from "services/AxiosDefault";

export const CreateSlackAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/settings/slacks/create",
    data,
  });
  return response;
};

export const GetSlackAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/settings/slacks/get/${placeId}`
  });
  return response;
};
export const DeleteSlackAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: "/settings/slacks/deleteSlack",
    data: data,
  });
  return response;
};

export const updateSlackAPI = async ({placeId, ...rest}) => {
    const response = await AxiosDefault({
      method: "PUT",
      url: `/settings/slacks/update/${placeId}`,
      data: rest
    });
    return response; 
};
