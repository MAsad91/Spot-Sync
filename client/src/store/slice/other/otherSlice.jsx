import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CreateDesignReceiptAPI } from "api/designReceiptAPI";

const initialState = {
  loading: false,
};

export const slackSlice = createSlice({
  name: "others",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder,
});

export default slackSlice.reducer;
