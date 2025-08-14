import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GetSubscriptionReportAPI } from "api/reportApi";
import { GetReservationReportAPI } from "api/reportApi";
import { GetTransactionReportAPI } from "api/reportApi";
import { GetRevenueSummaryAPI } from "api/reportApi";
import { GetDepositReportAPI } from "api/reportApi";
import { get } from "lodash";

const initialState = {
  transactionStatistics: {},
  reservationStatistics: {},
  transactionsList: [],
  reservationsList: [],
  totalTransactions: 0,
  totalReservations: 0,
  revenueSummary: {},
  loading: false,
};

export const getTransactionReport = createAsyncThunk(
  "report/getTransactionReport",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GetTransactionReportAPI(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getReservationReport = createAsyncThunk(
  "report/getReservationReport",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GetReservationReportAPI(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getSubscriptionReport = createAsyncThunk(
  "report/getSubscriptionReport",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GetSubscriptionReportAPI(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getRevenueSummary = createAsyncThunk(
  "report/getRevenueSummary",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GetRevenueSummaryAPI(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getDepositReportAPI = createAsyncThunk(
  "report/getDepositReportAPI",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GetDepositReportAPI(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getTransactionReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTransactionReport.fulfilled, (state, { payload }) => {
        state.transactionStatistics = get(payload, "transactionStatistics", []);
        state.transactionsList = get(payload, "transactions", 0);
        state.totalTransactions = get(payload, "totalTransactions", 0);
        state.loading = false;
      })
      .addCase(getTransactionReport.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getReservationReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReservationReport.fulfilled, (state, { payload }) => {
        state.reservationStatistics = get(payload, "reservationStatistics", []);
        state.reservationsList = get(payload, "reservations", 0);
        state.totalReservations = get(payload, "totalReservations", 0);
        state.loading = false;
      })
      .addCase(getReservationReport.rejected, (state) => {
        state.loading = false;
      })
 
      .addCase(getSubscriptionReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubscriptionReport.fulfilled, (state, { payload }) => {
        state.subscriptionStatistics = get(
          payload,
          "subscriptionStatistics",
          []
        );
        state.subscriptionsList = get(payload, "subscriptions", 0);
        state.totalSubscriptions = get(payload, "totalSubscriptions", 0);
        state.loading = false;
      })
      .addCase(getSubscriptionReport.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getRevenueSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRevenueSummary.fulfilled, (state, { payload }) => {
        state.subscriptionsList = get(payload, "data", {});
        state.loading = false;
      })
      .addCase(getRevenueSummary.rejected, (state) => {
        state.loading = false;
      }),
});

export default reportSlice.reducer;
