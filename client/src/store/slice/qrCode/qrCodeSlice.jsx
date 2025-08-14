import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DeleteQRCodeAPI } from "api/qrCodeAPI";
import { UpdateQRCodeURLAPI } from "api/qrCodeAPI";
import { GetQRCodeAPI } from "api/qrCodeAPI";
import { CreateQRCodeAPI } from "api/qrCodeAPI";
import { get } from "lodash";

const initialState = {
  qrCodeList: [],
  totalQrCodes: 0,
  qrCodeListLoading: false,
  loading: false,
};

export const createQRCOde = createAsyncThunk(
  "qrCode/createQRCode",
  async (data, { rejectWithValue }) => {
    console.log(data, "<==data");
    try {
      const response = await CreateQRCodeAPI(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getQRCodes = createAsyncThunk(
  "qrCode/getQRCodes",
  async (data, { rejectWithValue }) => {
    try {
      const response = await GetQRCodeAPI(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteQRCode = createAsyncThunk(
  "qrCode/deleteQRCode",
  async (data) => {
    try {
      const response = await DeleteQRCodeAPI(data);
      return response.data;
    } catch (err) {
      console.log("Delete error ======>", err);
      return err;
    }
  }
);

export const updateQRCodeURL = createAsyncThunk(
  "qrCode/updateQRCodeURL",
  async (data) => {
    console.log( data, "<<<<slice")
    try {
      const response = await UpdateQRCodeURLAPI(data);
      return response.data;
    } catch (err) {
      console.log("Delete error ======>", err);
      return err;
    }
  }
);

export const qrCodeSlice = createSlice({
  name: "qrCodes",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getQRCodes.pending, (state) => {
        state.qrCodeListLoading = true;
      })
      .addCase(getQRCodes.fulfilled, (state, { payload }) => {
        state.qrCodeList = get(payload, "qrCodes", []);
        state.totalQrCodes = get(payload, "total", 0);
        state.qrCodeListLoading = false;
      })
      .addCase(getQRCodes.rejected, (state) => {
        state.qrCodeListLoading = false;
      }),
});

export default qrCodeSlice.reducer;