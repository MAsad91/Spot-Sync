import AxiosDefault from "services/AxiosDefault";

export const CreateMessageAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/settings/messages/create",
    data,
  });
  return response;
};

export const CreateAndUpdateMessageAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/settings/messages/create-update",
    data,
  });
  return response;
};


export const GetMessageAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/settings/messages/get`,
    data,
  });
  return response;
};

export const GetCalendarDataForMessagesAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: `/settings/messages/get/calendarData`,
    data,
  });
  return response;
};


export const DeleteMessageAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: "/settings/messages/delete",
    data: data,
  });
  return response;
};

export const GetDefaultMessageAPI = async (data) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/settings/messages/get/default`,
    data,
  });
  return response;
};
