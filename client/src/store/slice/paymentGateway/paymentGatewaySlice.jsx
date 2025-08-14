import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getConnectAccountsAPI } from "api/paymentGatewayAPI";

const initialState = {
  connectAccounts: [],
  loading: false,
};

export const getConnectAccounts = createAsyncThunk(
  "paymentGateway/getConnectAccounts",
  async (data) => {
    try {
      const response = await getConnectAccountsAPI(data);
      return response.data;
    } catch (err) {
      console.log("get connect Acc error ======>", err);
    }
  }
);

export const paymentGatewaySlice = createSlice({
  name: "paymentGateway",
  initialState,
  reducers: {
    setConnectAccounts: (state, action) => {
      state.connectAccounts = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(getConnectAccounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getConnectAccounts.fulfilled, (state, { payload }) => {
        state.connectAccounts = payload.data;
        state.loading = false;
      })
      .addCase(getConnectAccounts.rejected, (state) => {
        state.loading = false;
      }),
});

export const { setConnectAccounts } =
  paymentGatewaySlice.actions;

export default paymentGatewaySlice.reducer;
