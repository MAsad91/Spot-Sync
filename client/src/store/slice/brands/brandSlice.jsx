import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getBrandsAPI,
  createBrandAPI,
  deleteBrandsAPI,
  UpdateReceiptColorAPI,
  updateBrandDefaultSettingsAPI
} from "api/brandApi";
import { get } from "lodash";

const initialState = {
  brandsList: [],
  totalBrands: 0,
  loading: false,
  creatingBrand: false,
  brandCreated: false,
  error: null,
};

export const createBrand = createAsyncThunk(
  "brand/createBrand",
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await createBrandAPI(brandData);
      return response.data; // Assuming API returns some data upon success
    } catch (error) {
      return rejectWithValue(error.message); // Returning error message using rejectWithValue
    }
  }
);

export const getBrands = createAsyncThunk(
  "brand/getBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getBrandsAPI();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBrand = createAsyncThunk(
  "brand/deleteBrand",
  async (data, { rejectWithValue }) => {
    try {
      const response = await deleteBrandsAPI(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateReceiptColor = createAsyncThunk(
  "brand/updateReceiptColor",
  async (data) => {
    try {
      const response = await UpdateReceiptColorAPI(data);
      return response.data;
    } catch (err) {
      console.log("update color error ======>", err);
    }
  }
);

export const updateBrandDefaultSettings = createAsyncThunk(
  "brand/updateBrand",
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await updateBrandDefaultSettingsAPI(brandData);
      return response.data; // Assuming API returns some data upon success
    } catch (error) {
      return rejectWithValue(error.message); // Returning error message using rejectWithValue
    }
  }
);

const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {
    resetBrandState: (state) => {
      state.creatingBrand = false;
      state.brandCreated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBrand.pending, (state) => {
        state.creatingBrand = true;
        state.brandCreated = false;
        state.error = null;
      })
      .addCase(createBrand.fulfilled, (state) => {
        state.creatingBrand = false;
        state.brandCreated = true;
        state.error = null;
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.creatingBrand = false;
        state.brandCreated = false;
        state.error = action.payload; // Storing error message if available
      })
      .addCase(getBrands.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBrands.fulfilled, (state, { payload }) => {
        state.brandsList = get(payload, "brands", []);
        state.totalBrands = get(payload, "total", 0);
        state.loading = false;
      })
      .addCase(getBrands.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const { resetBrandState } = brandSlice.actions;
export default brandSlice.reducer;
