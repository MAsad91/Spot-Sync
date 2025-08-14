import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GetEnforcementsByPlaceIdAPI } from "api/enforcementAPI";

import { get } from "lodash";

const initialState = {
  list: [],
  totalEnforcements: 0,
  loading: false,
};

export const getEnforcementsByPlaceId = createAsyncThunk(
  "enforcements/getEnforcementsByPlaceId",
  async (data) => {
    try {
      const response = await GetEnforcementsByPlaceIdAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get Enforcements error ======>", err);
      return err;
    }
  }
);

export const enforcementSlice = createSlice({
  name: "enforcements",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEnforcementsByPlaceId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEnforcementsByPlaceId.fulfilled, (state, action) => {
        state.list = get(action.payload, "success", false)
          ? action.payload.enforcements
          : [];
        state.totalEnforcements = get(action.payload, "total", 0);
        state.loading = false;
      })
      .addCase(getEnforcementsByPlaceId.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default enforcementSlice.reducer;
