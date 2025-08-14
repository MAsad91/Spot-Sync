import AxiosDefault from "services/AxiosDefault";

export const createBrandPublicAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/public/brand/create",
    data,
  });
  return response;
};

export const imageUploadBrandPublicAPI = async (brandData) => {
  const formData = new FormData();
  Object.entries(brandData).forEach(([key, value]) => {
    if (key === "brandLogo") {
      formData.append("file", value[0]);
    } else {
      formData.append(key, value);
    }
  });
  const response = await AxiosDefault({
    contentType: "multipart/form-data",
    method: "POST",
    url: "/public/brand/imageUpload",
    data: formData,
  });
  return response;
};

export const GetReceiptData = async (id) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/public/receipt/receiptData${id}`,
  });
  return response;
};