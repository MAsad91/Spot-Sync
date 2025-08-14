import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { UpdateReadStatusApi, ClearAllNotification, ReadNotification, GetNotificationAPI, DeleteNotification } from "api/notificationAPI";
import { get } from "lodash";

const initialState = {
  notificationList: [],
  totalNotifications: 0,
  notificationListLoading: false,
  loading: false,
};

export const getNotifications = createAsyncThunk(
  "notification/getNotifications",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GetNotificationAPI(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const readStatusupdate = createAsyncThunk(
  "notification/readStatusupdate",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await UpdateReadStatusApi(data);
      return response.data;
    } catch (err) {
      console.log("Status update error ======>", err);
      return err;
    }
  }
);
export const clearAllNotification = createAsyncThunk(
  "notification/clearAllNotification",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await ClearAllNotification(data);
      return response.data;
    } catch (err) {
      console.log("Status update error ======>", err);
      return err;
    }
  }
);
export const readNotification = createAsyncThunk(
  "notification/readNotification",
  async (data, { rejectWithValue }) => {
    console.log(data, "<==data");
    try {
      const response = await ReadNotification(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const deleteNotification = createAsyncThunk(
  "notification/delete",
  async (data, { rejectWithValue }) => {
    try {
      const response = await DeleteNotification(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    appendNotification: (state, action) => {
      // Append new notification to the existing notification list
      state.notificationList = [action.payload, ...state.notificationList];
      state.totalNotifications += 1;
    }
  },
  extraReducers: (builder) =>
    builder
      .addCase(getNotifications.pending, (state) => {
        state.notificationListLoading = true;
      })
      .addCase(getNotifications.fulfilled, (state, { payload }) => {
        state.notificationList = get(payload, "notifications", []);
        state.totalNotifications = get(payload, "total", 0);
        state.notificationListLoading = false;
      })
      .addCase(getNotifications.rejected, (state) => {
        state.notificationListLoading = false;
      }),
});

export default notificationSlice.reducer;

// Export the action so it can be used outside the slice
export const { appendNotification } = notificationSlice.actions;
