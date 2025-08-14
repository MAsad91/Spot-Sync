import AxiosDefault from "services/AxiosDefault";

export const createBrandAPI = async (brandData) => {
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
    url: "/brands/create",
    data: formData,
  });
  return response;
};

export const getBrandsAPI = async () => {
  const response = await AxiosDefault({
    method: "GET",
    url: "/brands/get",
  });
  return response;
};
export const deleteBrandsAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: "/brands/delete",
    data,
  });
  return response;
};
export const UpdateReceiptColorAPI = async ({ brandId, ...rest }) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/brands/updateReceiptColor/${brandId}`,
    data: rest,
  });
  return response;
};

export const updateBrandDefaultSettingsAPI = async (brandData) => {
  
  const response = await AxiosDefault({
    method: "POST",
    url: "/brands/updateDefault",
    data: brandData,
  });
  return response;
};
