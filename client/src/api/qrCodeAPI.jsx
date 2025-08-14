import AxiosDefault from "services/AxiosDefault";

export const CreateQRCodeAPI = async (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === "qrCode") {
      formData.append("file", value[0]);
    } else {
      formData.append(key, value);
    }
  });
  const response = await AxiosDefault({
    contentType: "multipart/form-data",
    method: "POST",
    url: "/qrCode/create",
    data: formData,
  });
  return response;
};

export const GetQRCodeAPI = async () => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/qrCode/get`,
  });
  return response;
};

export const DeleteQRCodeAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: "/qrCode/deleteQRCode",
    data: data,
  });
  return response;
};

export const UpdateQRCodeURLAPI = async (data) => {
  const {id, url} = data
  const response = await AxiosDefault({
    method: "PATCH",
    url: `/qrCode/update/url/${id}`,
    data: {url},
  });
  return response;
};
