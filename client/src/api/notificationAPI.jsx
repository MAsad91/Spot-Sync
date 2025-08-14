import AxiosDefault from "services/AxiosDefault";

export const GetNotificationAPI = async () => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/notification/get`,
  });
  return response;
};

export const UpdateReadStatusApi = async () => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: `/notification/readStatusupdate`,
  });
  return response;
};

export const ClearAllNotification = async () => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: `/notification/clearAllNotification`,
  });
  return response;
};

export const ReadNotification = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: `/notification/readNotification`,
    data: data,
  });
  return response;
};

export const DeleteNotification = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: `/notification/delete`,
    data: data,
  });
  return response;
};

