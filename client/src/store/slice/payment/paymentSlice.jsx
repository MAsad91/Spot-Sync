import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DeleteCard } from "api/paymentAPI";
import { RefundPayment } from "api/paymentAPI";
import { GetParkingShortlyDetails } from "api/paymentAPI";
import { GenerateClientSecret } from "api/paymentAPI";
import { PostParkingCardPayment } from "api/paymentAPI";
import { PostACHPayment } from "api/paymentAPI";
import { GetShortlyDetails } from "api/paymentAPI";
import { GetCardDetails } from "api/paymentAPI";
import { PostCardPayment } from "api/paymentAPI";
import { GetAuthorizenetPaymentMethods } from "api/paymentAPI";
import { UpdateSubscriptionAfter3dSecure } from "api/paymentAPI";
import { get } from "lodash";

const initialState = {
  cardDetails: [],
  shortlyData: {},
  placeId: null,
  paymentMethodsLoading: false,
  loading: false,
};

export const getShortlyData = createAsyncThunk(
  "payment/getShortlyData",
  async (id, { rejectWithValue }) => {
    try {
      const response = await GetShortlyDetails(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAuthorizenetPaymentMethods = createAsyncThunk( 
  "payment/authorizenet/fetchPaymentMethods",
  async ({customerId, placeId}, { rejectWithValue }) => {
    try {
      const response = await GetAuthorizenetPaymentMethods(customerId, placeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getParkingShortlyData = createAsyncThunk(
  "payment/getParkingShortlyData",
  async (id, { rejectWithValue }) => {
    try {
      const response = await GetParkingShortlyDetails(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const postCardPayment = createAsyncThunk(
  "payment/postCardPayment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await PostCardPayment(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const postParkingCardPayment = createAsyncThunk(
  "payment/parking/postParkingCardPayment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await PostParkingCardPayment(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCardDetails = createAsyncThunk(
  "payment/getCardDetails",
  async ({ id, placeId }, { rejectWithValue }) => {
    try {
      const response = await GetCardDetails(id, placeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCard = createAsyncThunk(
  "payment/deleteCard",
  async ({ id, placeId }, { rejectWithValue }) => {
    try {
      const response = await DeleteCard(id, placeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const paymentRefund = createAsyncThunk(
  "payment/paymentRefund",
  async (data, { rejectWithValue }) => {
    try {
      const response = await RefundPayment(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const postACHPayment = createAsyncThunk(
  "payment/postACHPayment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await PostACHPayment(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateClientSecret = createAsyncThunk(
  "payment/generateClientSecret",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GenerateClientSecret(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSubscriptionAfter3dSecure = createAsyncThunk(
  "payment/updateSubscriptionAfter3dSecure",
  async (data, { rejectWithValue }) => {
    try {
      const response = await UpdateSubscriptionAfter3dSecure(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
)

export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    restConsultationStore: (state) => {
      state.cardDetails = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCardDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCardDetails.fulfilled, (state, { payload }) => {
        state.cardDetails = get(payload, "paymentMethods", []);
        state.placeId = get(payload, "placeId", null);
        state.loading = false;
      })
      .addCase(getCardDetails.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteCard.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCard.fulfilled, (state, { payload }) => {
        state.cardDetails = get(payload, "data", []);
        state.loading = false;
      })
      .addCase(deleteCard.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { restConsultationStore } = paymentSlice.actions;
export default paymentSlice.reducer;
