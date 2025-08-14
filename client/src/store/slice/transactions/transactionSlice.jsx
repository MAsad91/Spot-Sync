import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GetTransactionsByPlaceIdAPI } from "api/transactionAPI";

import { get } from "lodash";

const initialState = {
  list: [],
  totalTransactions: 0,
  loading: false,
};

export const getTransactionsByPlaceId = createAsyncThunk(
  "transactions/getTransactionsByPlaceId",
  async (data) => {
    try {
      const response = await GetTransactionsByPlaceIdAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get Transactions error ======>", err);
      return err;
    }
  }
);

export const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTransactionsByPlaceId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTransactionsByPlaceId.fulfilled, (state, action) => {
        state.list = get(action.payload, "success", false)
          ? action.payload.transactions
          : [];
        state.totalTransactions = get(action.payload, "total", 0);
        state.loading = false;
      })
      .addCase(getTransactionsByPlaceId.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default transactionSlice.reducer;
