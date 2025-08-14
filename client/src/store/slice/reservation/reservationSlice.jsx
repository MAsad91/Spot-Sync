import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GetReservationsStatisticsAPI } from "api/reservationAPI";
import { GetReservationsByPlaceIdAPI } from "api/reservationAPI";
import { CreateReservationAPI, GetRatesByPlaceIdAPI } from "api/reservationAPI";
import { get } from "lodash";

const initialState = {
  reservationsList: [],
  totalReservations: 0,
  statistics: {},
  loading: false,
};

export const getReservations = createAsyncThunk(
  "reservations/getReservations",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GetReservationsByPlaceIdAPI(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getReservationStatistics = createAsyncThunk(
  "reservations/getReservationStatistics",
  async (data) => {
    try {
      const response = await GetReservationsStatisticsAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get reservation statistics ======>", err);
      return err;
    }
  }
);

export const createReservation = createAsyncThunk(
  "reservations/createReservation",
  async (data, { rejectWithValue }) => {
    try {
      const response = await CreateReservationAPI(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getRatesByPlaceId = createAsyncThunk(
  "reservations/getRatesByPlaceId",
  async (placeId, { rejectWithValue }) => {
    try {
      const response = await GetRatesByPlaceIdAPI(placeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const reservationSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getReservations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReservations.fulfilled, (state, { payload }) => {
        state.reservationsList = get(payload, "reservations", []);
        state.totalReservations = get(payload, "total", 0);
        state.loading = false;
      })
      .addCase(getReservations.rejected, (state) => {
        state.qrCodeListLoading = false;
      })
      .addCase(getReservationStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReservationStatistics.fulfilled, (state, { payload }) => {
        state.statistics = get(payload, "statistics", {});
        state.loading = false;
      })
      .addCase(getReservationStatistics.rejected, (state) => {
        state.qrCodeListLoading = false;
      })
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
      })
      .addCase(createReservation.fulfilled, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(createReservation.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getRatesByPlaceId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRatesByPlaceId.fulfilled, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(getRatesByPlaceId.rejected, (state) => {
        state.loading = false;
      }),
});

export default reservationSlice.reducer;
