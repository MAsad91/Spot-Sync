import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createRawBulkSubscriptionAPI,
  GetRawSubscriptionsByPlaceIdAPI,
} from "api/subscriptionAPI";
import { DeleteSubscriptionAPI } from "api/subscriptionAPI";
import { GetSubscriptionPaymentLogsAPI } from "api/subscriptionAPI";
import { RenewSubscriptionAPI } from "api/subscriptionAPI";
import { UpdateLicensePlateAPI } from "api/subscriptionAPI";
import { EditLicensePlateAPI } from "api/subscriptionAPI";
import { SendPaymentLinkEmailAPI } from "api/subscriptionAPI";
import { DeclineUpdateLicensePlateAPI } from "api/subscriptionAPI";
import { SendReminderEmailAPI } from "api/subscriptionAPI";
import { GetSubscriptionDetail } from "api/subscriptionAPI";
import { GetSubscriptionStatisticsAPI } from "api/subscriptionAPI";
import { GetSubscriptionServiceFeeAPI } from "api/subscriptionAPI";
import { GetSubscriptionsByPlaceIdAPI } from "api/subscriptionAPI";
import { CreateSubscriptionAPI } from "api/subscriptionAPI";
import { GetSubscriptionsSummariesAPI } from "api/subscriptionAPI";
import { UpdateSubscriptionPauseStatusAPI } from "api/subscriptionAPI";
import { get } from "lodash";

const initialState = {
  list: [],
  subscriptionDetail: [],
  subscriptionServiceFee: 0,
  statistics: {},
  subscriptionsSummaries: [],
  paymentLogs: [],
  loading: false,
};

export const createSubscription = createAsyncThunk(
  "subscriptions/createSubscriptions",
  async (data) => {
    try {
      const response = await CreateSubscriptionAPI(data);
      return response.data;
    } catch (err) {
      console.log("subscription error ======>", err);
      return err;
    }
  }
);

export const createBulkSubscription = createAsyncThunk(
  "subscriptions/createBulkSubscription",
  async (data) => {
    try {
      const response = await createRawBulkSubscriptionAPI(data);
      return response.data;
    } catch (err) {
      console.log("subscription error ======>", err);
      return err;
    }
  }
);

export const getBulkSubscriptionByPlaceId = createAsyncThunk(
  "subscriptions/getBulkSubscriptionByPlaceId",
  async (data) => {
    try {
      const response = await GetRawSubscriptionsByPlaceIdAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get subscriptions error ======>", err);
      return err;
    }
  }
);
export const getSubscriptionsByPlaceId = createAsyncThunk(
  "subscriptions/getSubscriptionsByPlaceId",
  async (data) => {
    try {
      const response = await GetSubscriptionsByPlaceIdAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get subscriptions error ======>", err);
      return err;
    }
  }
);

export const getSubscriptionServiceFee = createAsyncThunk(
  "subscriptions/getSubscriptionServiceFee",
  async (data) => {
    try {
      const response = await GetSubscriptionServiceFeeAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get subscriptions error ======>", err);
      return err;
    }
  }
);
export const deleteSubscription = createAsyncThunk(
  "subscriptions/deleteSubscription",
  async (data) => {
    try {
      const response = await DeleteSubscriptionAPI(data);
      return response.data;
    } catch (err) {
      console.log("Delete subscriptions error ======>", err);
      return err;
    }
  }
);


export const getSubscriptionStatistics = createAsyncThunk(
  "subscriptions/getSubscriptionStatistics",
  async (data) => {
    try {
      const response = await GetSubscriptionStatisticsAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get subscriptions statistics ======>", err);
      return err;
    }
  }
);

export const getSubscriptionPaymentLogs = createAsyncThunk(
  "subscriptions/getSubscriptionPaymentLogs",
  async (data) => {
    try {
      const response = await GetSubscriptionPaymentLogsAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get subscriptions payment log ======>", err);
      return err;
    }
  }
);

export const getSubscriptionDetail = createAsyncThunk(
  "subscriptions/getSubscriptionDetail",
  async (data) => {
    try {
      const response = await GetSubscriptionDetail(data);
      return response.data;
    } catch (error) {
      console.log("Get subscriptions detail ======>", error);
      return error;
    }
  }
);

export const renewSubscription = createAsyncThunk(
  "subscriptions/renewSubscription",
  async (data) => {
    try {
      const response = await RenewSubscriptionAPI(data);
      return response.data;
    } catch (err) {
      console.log("Renew subscriptions error ======>", err);
      return err;
    }
  }
);

export const sendReminderEmail = createAsyncThunk(
  "subscriptions/sendReminderEmail",
  async (data) => {
    try {
      const response = await SendReminderEmailAPI(data);
      return response.data;
    } catch (err) {
      console.log("Reminder email error ======>", err);
      return err;
    }
  }
);

export const updateLicensePlate = createAsyncThunk(
  "subscriptions/updateLicensePlate",
  async (data) => {
    try {
      const response = await UpdateLicensePlateAPI(data);
      return response.data;
    } catch (err) {
      console.log("update licensePlate error ======>", err);
    }
  }
);

export const editLicensePlate = createAsyncThunk(
  "subscriptions/editLicensePlate",
  async (data) => {
    try {
      const response = await EditLicensePlateAPI(data);
      return response.data;
    } catch (err) {
      console.log("edit licensePlate error ======>", err);
    }
  }
);



export const declineUpdateLicensePlate = createAsyncThunk(
  "subscriptions/declineUpdateLicensePlate",
  async (data) => {
    try {
      const response = await DeclineUpdateLicensePlateAPI(data);
      return response.data;
    } catch (err) {
      console.log("decline update licensePlate error ======>", err);
    }
  }
);

export const sendPaymentLinkEmail = createAsyncThunk(
  "subscriptions/sendPaymentLinkEmail",
  async (data) => {
    try {
      const response = await SendPaymentLinkEmailAPI(data);
      return response.data;
    } catch (err) {
      console.log("Payment Link send error ======>", err);
      return err;
    }
  }
);
export const getSubscriptionsSummaries = createAsyncThunk(
  "subscriptions/getSubscriptionsSummaries",
  async (data) => {
    try {
      const response = await GetSubscriptionsSummariesAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get subscriptions error ======>", err);
      return err;
    }
  }
);
export const updateSubscriptionPauseStatus = createAsyncThunk(
  "subscriptions/updateSubscriptionsPauseStatus",
  async (data) => {
    try {
      const response = await UpdateSubscriptionPauseStatusAPI(data);
      return response.data;
    } catch (err) {
      console.log("subscription error ======>", err);
      return err;
    }
  }
);


export const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSubscriptionsByPlaceId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubscriptionsByPlaceId.fulfilled, (state, action) => {
        state.list = get(action.payload, "success", false)
          ? action.payload.subscriptions
          : [];
        state.loading = false;
      })
      .addCase(getSubscriptionsByPlaceId.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getSubscriptionServiceFee.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubscriptionServiceFee.fulfilled, (state, { payload }) => {
        state.subscriptionServiceFee = get(payload, "subscriptionFee", 0);
        state.loading = false;
      })
      .addCase(getSubscriptionServiceFee.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getSubscriptionStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubscriptionStatistics.fulfilled, (state, { payload }) => {
        state.statistics = payload.statistics;
        state.loading = false;
      })
      .addCase(getSubscriptionStatistics.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getSubscriptionPaymentLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubscriptionPaymentLogs.fulfilled, (state, { payload }) => {
        state.paymentLogs = payload.payments;
        state.loading = false;
      })
      .addCase(getSubscriptionPaymentLogs.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getSubscriptionDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubscriptionDetail.fulfilled, (state, { payload }) => {
        state.subscriptionDetail = get(payload, "data", []);
        state.loading = false;
      })
      .addCase(getSubscriptionDetail.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getSubscriptionsSummaries.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubscriptionsSummaries.fulfilled, (state, { payload }) => {
        state.subscriptionsSummaries = payload.data;
        state.loading = false;
      })
      .addCase(getSubscriptionsSummaries.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default subscriptionSlice.reducer;
