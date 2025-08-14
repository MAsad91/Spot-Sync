import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GetReceiptData } from "api/publicApi";
import { imageUploadBrandPublicAPI } from "api/publicApi";
import { createBrandPublicAPI } from "api/publicApi";

const initialState = {
  loading: false,
};

export const createBrandPublic = createAsyncThunk(
  "public/createBrandPublic",
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await createBrandPublicAPI(brandData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const imageUploadBrandPublic = createAsyncThunk(
  "public/imageUploadBrandPublic",
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await imageUploadBrandPublicAPI(brandData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getReceiptData = createAsyncThunk(
  "public/getReceiptData",
  async (id, { rejectWithValue }) => {
    try {
      const response = await GetReceiptData(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const publicSlice = createSlice({
  name: "public",
  initialState,
  reducers: {
    resetPublicState: (state) => {
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBrandPublic.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBrandPublic.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createBrandPublic.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(imageUploadBrandPublic.pending, (state) => {
        state.loading = true;
      })
      .addCase(imageUploadBrandPublic.fulfilled, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(imageUploadBrandPublic.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const { resetPublicState } = publicSlice.actions;
export default publicSlice.reducer;
