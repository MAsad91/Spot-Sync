import AxiosDefault from "services/AxiosDefault";

export const getPricingTierAPI = async (placeId) => {
  const response = await AxiosDefault({
    method: "GET",
    url: `/pricingTier/get/${placeId}`,
  });
  return response;
};

export const CreatePricingTierAPI = async (data) => {
  const response = await AxiosDefault({
    method: "POST",
    url: "/pricingTier/create",
    data,
  });
  return response;
};
export const DeletePricingTierAPI = async (data) => {
  const response = await AxiosDefault({
    method: "PATCH",
    url: "/pricingTier/deletePricingTier",
    data: data,
  });
  return response;
};

export const updatePricingTierAPI = async ({ pricingId, ...rest }) => {
  const response = await AxiosDefault({
    method: "PUT",
    url: `/pricingTier/update/${pricingId}`,
    data: rest,
  });
  return response;
};

// export const StatusUpdateAPI = async (data) => {
//   const response = await AxiosDefault({
//     method: "PATCH",
//     url: "/rates/statusUpdate",
//     data: data,
//   });
//   return response;
// };
