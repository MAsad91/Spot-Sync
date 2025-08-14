import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  GetCustomerActivityLogsByPlaceIdAPI,
  GetActivityLogs,
} from "api/customerActivityLogsAPI";

import { get } from "lodash";

const initialState = {
  list: [],
  activityLogs: [],
  totalRecords: 0,
  loading: false,
};

export const getCustomerActivityLogsByPlaceId = createAsyncThunk(
  "customerActivityLogs/getCustomerActivityLogsByPlaceId",
  async (data) => {
    try {
      const response = await GetCustomerActivityLogsByPlaceIdAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get Customer Activity Logs error ======>", err);
      return err;
    }
  }
);

export const getActivityLogs = createAsyncThunk(
  "customerActivityLogs/getActivityLogs",
  async (data) => {
    try {
      const response = await GetActivityLogs(data);
      return response.data;
    } catch (err) {
      console.log("Get Activity Logs error ======>", err);
      return err;
    }
  }
);

export const customerActivityLogSlice = createSlice({
  name: "customerActivityLogs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCustomerActivityLogsByPlaceId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCustomerActivityLogsByPlaceId.fulfilled, (state, action) => {
        state.list = get(action.payload, "success", false)
          ? action.payload.customerActivityLogs
          : [];
        state.totalRecords = get(action.payload, "total", 0);
        state.loading = false;
      })
      .addCase(getCustomerActivityLogsByPlaceId.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getActivityLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActivityLogs.fulfilled, (state, action) => {
        state.activityLogs = get(action.payload, "success", false)
          ? action.payload.activityLogs
          : [];
        state.loading = false;
      })
      .addCase(getActivityLogs.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default customerActivityLogSlice.reducer;
