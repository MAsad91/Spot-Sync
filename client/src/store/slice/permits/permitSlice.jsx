import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { UpdatePermitAPI } from "api/permitAPI";
import { DeletePermitAPI } from "api/permitAPI";
import { GetPermitStatisticsAPI } from "api/permitAPI";
import { GetPermitByPlaceIdAPI } from "api/permitAPI";
import { CreatePermitAPI } from "api/permitAPI";
import { get } from "lodash";

const initialState = {
  permitList: [],
  totalPermits: 0,
  statistics: {},
  loading: false,
};

export const createPermit = createAsyncThunk(
  "permit/createPermits",
  async (data) => {
    try {
      const response = await CreatePermitAPI(data);
      return response.data;
    } catch (err) {
      console.log("Permit error ======>", err);
      return err;
    }
  }
);

export const getPermitsByPlaceId = createAsyncThunk(
  "permit/getPermitsByPlaceId",
  async (data) => {
    try {
      const response = await GetPermitByPlaceIdAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get Permits error ======>", err);
      return err;
    }
  }
);

export const deletePermit = createAsyncThunk(
  "permit/deletePermit",
  async (data) => {
    try {
      const response = await DeletePermitAPI(data);
      return response.data;
    } catch (err) {
      console.log("Delete Permits error ======>", err);
      return err;
    }
  }
);

export const getPermitStatistics = createAsyncThunk(
  "permit/getPermitstatistics",
  async (data) => {
    try {
      const response = await GetPermitStatisticsAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get Permits statistics ======>", err);
      return err;
    }
  }
);

export const updatePermit = createAsyncThunk(
  "permit/updatePermit",
  async (data) => {
    try {
      const response = await UpdatePermitAPI(data);
      return response.data;
    } catch (err) {
      console.log("update Permit error ======>", err);
    }
  }
);

export const permitSlice = createSlice({
  name: "permit",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPermitsByPlaceId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPermitsByPlaceId.fulfilled, (state, action) => {
        state.permitList = get(action.payload, "success", false)
          ? action.payload.Permits
          : [];
        state.totalPermits = get(action.payload, "totalPermits", 0);
        state.loading = false;
      })
      .addCase(getPermitsByPlaceId.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getPermitStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPermitStatistics.fulfilled, (state, { payload }) => {
        state.statistics = payload.statistics;
        state.loading = false;
      })
      .addCase(getPermitStatistics.rejected, (state) => {
        state.loading = false;
      })
  },
});

export default permitSlice.reducer;
