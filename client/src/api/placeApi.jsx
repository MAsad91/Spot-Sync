import AxiosDefault from "services/AxiosDefault";

export const createPlaceAPI = async (placeData) => {
    const response = await AxiosDefault({
      method: "POST",
      url: "/places/create",
      data: placeData,
    });
    return response; 
};

export const getPlaceAPI = async () => {
    const response = await AxiosDefault({
      method: "GET",
      url: "/places/get"
    });
    return response; 
};

export const getPlaceByIdAPI = async (placeId) => {
    const response = await AxiosDefault({
      method: "GET",
      url: `/places/get/${placeId}`
    });
    return response; 
};

export const assignSettingAPI = async ({placeId, ...rest}) => {
    const response = await AxiosDefault({
      method: "PUT",
      url: `/places/setting/${placeId}`,
      data: rest
    });
    return response; 
};

export const updatePlaceAPI = async ({placeId, ...rest}) => {
    const response = await AxiosDefault({
      method: "PUT",
      url: `/places/update/${placeId}`,
      data: rest
    });
    return response; 
};

export const DeletePlaceAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: "/places/deletePlace",
    data: data,
  });
  return response;
};