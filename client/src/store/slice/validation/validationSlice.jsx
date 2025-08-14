import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GetAllValidationsAPI } from "api/validationApi";
import { DeleteValidationAPI } from "api/validationApi";
import { CreateValidationAPI } from "api/validationApi";
import { GetValidationsByPlaceIdAPI } from "api/validationApi";
// import { StatusUpdateAPI } from "api/rateApi";
// import { GetRatesByPlaceIdAPI } from "api/rateApi";
// import { AssignRatesAPI } from "api/rateApi";
// import { DeleteRateAPI } from "api/rateApi";
// import { CreateRateAPI } from "api/rateApi";
// import { getRatesAPI } from "api/rateApi";

const initialState = {
  allValidations: [],
  validations: [],
  loading: false,
};

// export const getRates = createAsyncThunk("rates/getRates", async (data) => {
//   try {
//     const response = await getRatesAPI(data);
//     return response.data;
//   } catch (err) {
//     console.log("get rates error ======>", err);
//   }
// });

export const createValidation = createAsyncThunk(
  "validations/createValidation",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await CreateValidationAPI(data);
      return response.data;
    } catch (err) {
      console.log("validation error ======>", err);
      return err;
    }
  }
);

export const deleteValidation = createAsyncThunk(
  "validations/deleteValidation",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await DeleteValidationAPI(data);
      return response.data;
    } catch (err) {
      console.log("Delete error ======>", err);
      return err;
    }
  }
);

export const getValidationsByPlaceId = createAsyncThunk(
  "validations/getValidationsByPlaceId",
  async (data) => {
    try {
      const response = await GetValidationsByPlaceIdAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get validation error ======>", err);
      return err;
    }
  }
);

export const getAllValidations = createAsyncThunk(
  "validations/getAllValidations",
  async (data) => {
    try {
      const response = await GetAllValidationsAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get validation error ======>", err);
      return err;
    }
  }
);

export const validationSlice = createSlice({
  name: "validations",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getAllValidations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllValidations.fulfilled, (state, { payload }) => {
        state.allValidations = payload.validation;
        state.loading = false;
      })
      .addCase(getAllValidations.rejected, (state) => {
        state.loading = false;
      }),
});

export default validationSlice.reducer;
