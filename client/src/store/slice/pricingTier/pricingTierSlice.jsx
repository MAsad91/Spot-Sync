import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { updatePricingTierAPI } from "api/pricingTierAPI";
import { DeletePricingTierAPI } from "api/pricingTierAPI";
import { getPricingTierAPI } from "api/pricingTierAPI";
import { CreatePricingTierAPI } from "api/pricingTierAPI";
import { get } from "lodash";

const initialState = {
  pricingData: [],
  defaultAvailable: false,
  loading: false,
  totalPricingTiers:0
};

export const getPricingTier = createAsyncThunk(
  "pricingTier/getPricingTier",
  async (data) => {
    try {
      const response = await getPricingTierAPI(data);
      return response.data;
    } catch (err) {
      console.log("get pricing error ======>", err);
    }
  }
);

export const createPricingTier = createAsyncThunk(
  "pricingTier/createPricingTier",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await CreatePricingTierAPI(data);
      return response.data;
    } catch (err) {
      console.log("pricing create error ======>", err);
      return err;
    }
  }
);

export const deletePricingTier = createAsyncThunk(
  "pricingTier/deletePricingTier",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await DeletePricingTierAPI(data);
      return response.data;
    } catch (err) {
      console.log("Delete error ======>", err);
      return err;
    }
  }
);

export const updatePricingTier = createAsyncThunk(
  "pricingTier/updatePricingTier",
  async (updatePricingData, { rejectWithValue }) => {
    console.log(updatePricingData, "<<update pricing data");
    try {
      const response = await updatePricingTierAPI(updatePricingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// export const rateStatusUpdate = createAsyncThunk(
//   "rates/statusUpdate",
//   async (data) => {
//     console.log(data, "<==data");
//     try {
//       const response = await StatusUpdateAPI(data);
//       return response.data;
//     } catch (err) {
//       console.log("Status update error ======>", err);
//       return err;
//     }
//   }
// );

export const pricingTier = createSlice({
  name: "pricingTier",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getPricingTier.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPricingTier.fulfilled, (state, { payload }) => {
        state.pricingData = get(payload, "pricingTiers", "");
        state.totalPricingTiers = get(payload, "total", "");
        state.defaultAvailable = get(payload, "defaultAvailable", "");
        state.loading = false;
      })
      .addCase(getPricingTier.rejected, (state) => {
        state.loading = false;
      }),
});

export default pricingTier.reducer;
