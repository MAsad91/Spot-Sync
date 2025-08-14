import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  clearCustomerSession,
  saveCustomerSession,
  getCustomerSession,
} from "services/service";
import { get } from "lodash";
import { PostLogin } from "api/customerApi";
import { PostOtpVerify } from "api/customerApi";
import { PostOtpResend } from "api/customerApi";
import { GetCustomerInfo } from "api/customerApi";
import { GetSubscriptionByCustomerId } from "api/customerApi";
import { GetPaymentMethodAPI } from "api/customerApi";
import { UpdatePaymentMethodAPI } from "api/customerApi";
import { CancelSubscriptionAPI } from "api/customerApi";
import { UpdateLicensePlateAPI } from "api/customerApi";
import { GetPaymentHistoryAPI } from "api/customerApi";
import { PostSwitchToParkerDashboard } from "api/customerApi";
import { AddLicensePlateAPI } from "api/customerApi";
import { DeleteLicensePlateAPI } from "api/customerApi";
import { RenewSubscriptionAPI } from "api/customerApi";

const token = localStorage.getItem("CustomerAuthorization");

const initialState = {
  customerDetails: {},
  customerToken: token ? token : "",
  subscriptionList: [],
  totalSubscription: 0,
  loading: false,
};

export const postLogin = createAsyncThunk(
  "customer/postLogin",
  async (data) => {
    try {
      const response = await PostLogin(data);
      console.log("response post login >>>> ", response);
      return response.data;
    } catch (err) {
      console.log("postLogin error ======>", err);
    }
  }
);

export const postOtpVerify = createAsyncThunk(
  "customer/postOtpVerify",
  async (data) => {
    try {
      const response = await PostOtpVerify(data);
      console.log("response post otp verify >>>> ", response);
      return response.data;
    } catch (err) {
      console.log("otp verify error ======>", err);
    }
  }
);

export const postOtpResend = createAsyncThunk(
  "customer/postOtpResend",
  async (data) => {
    try {
      const response = await PostOtpResend(data);
      console.log("response post otp resend >>>> ", response);
      return response.data;
    } catch (err) {
      console.log("otp resend error ======>", err);
    }
  }
);

export const getCustomerInfo = createAsyncThunk(
  "customer/getCustomerInfo",
  async (data) => {
    try {
      const response = await GetCustomerInfo(data);
      return response.data;
    } catch (err) {
      console.log("get customer info error ======>", err);
    }
  }
);

export const customerLogout = createAsyncThunk("auth/logout", async () => {
  try {
    clearCustomerSession();
    return {};
  } catch (err) {
    console.log("logout error ======>", err);
  }
});

// Dashboard APIs ==========

export const getSubscriptionsList = createAsyncThunk(
  "customer/getSubscriptionsList",
  async (data) => {
    try {
      const response = await GetSubscriptionByCustomerId(data);
      return response.data;
    } catch (err) {
      console.log("get subscriptions error ======>", err);
    }
  }
);

export const getPaymentMethod = createAsyncThunk(
  "customer/getPaymentMethod",
  async (data) => {
    try {
      const response = await GetPaymentMethodAPI(data);
      return response.data;
    } catch (err) {
      console.log("get payment method error ======>", err);
    }
  }
);

export const updatePaymentMethod = createAsyncThunk(
  "customer/updatePaymentMethod",
  async (data) => {
    try {
      const response = await UpdatePaymentMethodAPI(data);
      return response.data;
    } catch (err) {
      console.log("update payment method error ======>", err);
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  "customer/cancelSubscription",
  async (data) => {
    try {
      const response = await CancelSubscriptionAPI(data);
      return response.data;
    } catch (err) {
      console.log("cancel subscription error ======>", err);
    }
  }
);

export const updateLicensePlate = createAsyncThunk(
  "customer/updateLicensePlate",
  async (data) => {
    try {
      const response = await UpdateLicensePlateAPI(data);
      return response.data;
    } catch (err) {
      console.log("cancel subscription error ======>", err);
    }
  }
);

export const deleteLicensePlate = createAsyncThunk(
  "customer/deleteLicensePlate",
  async (data) => {
    try {
      const response = await DeleteLicensePlateAPI(data);
      return response.data;
    } catch (err) {
      console.log("delete licensePlate error ======>", err);
    }
  }
);

export const addLicensePlate = createAsyncThunk(
  "customer/addLicensePlate",
  async (data) => {
    try {
      const response = await AddLicensePlateAPI(data);
      return response.data;
    } catch (err) {
      console.log("add licensePlate error ======>", err);
    }
  }
);
export const getPaymentHistory = createAsyncThunk(
  "customer/getPaymentHistory",
  async (data) => {
    try {
      const response = await GetPaymentHistoryAPI(data);
      return response.data;
    } catch (err) {
      console.log("get payment history error ======>", err);
    }
  }
);

export const switchToParkerDashboard = createAsyncThunk(
  "customer/switchToParkerDashboard",
  async (data) => {
    try {
      const response = await PostSwitchToParkerDashboard(data);
      return response.data;
    } catch (err) {
      console.log("switch to parker error ======>", err);
    }
  }
);

export const renewSubscription = createAsyncThunk(
  "customer/renewSubscription",
  async (data) => {
    try {
      const response = await RenewSubscriptionAPI(data);
      return response.data;
    } catch (err) {
      console.log("switch to parker error ======>", err);
    }
  }
);

export const customerAuthSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    customerLogout: (state) => {
      clearCustomerSession();
      state = {};
    },
    getSession: () => {
      getCustomerSession();
    },
    setUserData: (state, action) => {
      state.customerDetails = action.payload;
    },
    setAuthToken: (state, { payload }) => {
      state.customerToken = payload;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(postLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(postLogin.fulfilled, (state, { payload }) => {
        state.loading = false;
      })
      .addCase(postLogin.rejected, (state) => {
        state.loading = false;
      })
      .addCase(postOtpVerify.pending, (state) => {
        state.loading = true;
      })
      .addCase(postOtpVerify.fulfilled, (state, { payload }) => {
        saveCustomerSession(payload);
        state.customerToken = payload.token;
        state.customerDetails = get(payload, "data", {});
        state.loading = false;
      })
      .addCase(postOtpVerify.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getCustomerInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCustomerInfo.fulfilled, (state, { payload }) => {
        state.customerDetails = get(payload, "data", {});
        state.loading = false;
      })
      .addCase(getCustomerInfo.rejected, (state) => {
        state.loading = false;
      })

      // Dashboard APIs ====================

      .addCase(getSubscriptionsList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubscriptionsList.fulfilled, (state, { payload }) => {
        state.subscriptionList = get(payload, "subscriptions", []);
        state.totalSubscription = get(payload, "total", 0);
        state.loading = false;
      })
      .addCase(getSubscriptionsList.rejected, (state) => {
        state.loading = false;
      }),
});

export const { setUserData, setAuthToken } = customerAuthSlice.actions;
export default customerAuthSlice.reducer;
