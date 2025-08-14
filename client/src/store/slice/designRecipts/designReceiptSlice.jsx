import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CreateDesignReceiptAPI } from "api/designReceiptAPI";

const initialState = {
  receipts: [],
  loading: false,
};

export const createDesignReceipt = createAsyncThunk(
  "designReceipt/createDesignReceipt",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await CreateDesignReceiptAPI(data);
      return response.data;
    } catch (err) {
      console.log("postReceipt error ======>", err);
      return err;
    }
  }
);

export const slackSlice = createSlice({
  name: "slacks",
  initialState,
  reducers: {},
  extraReducers: (builder) => builder,
});

export default slackSlice.reducer;
