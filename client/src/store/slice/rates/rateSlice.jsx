import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { StatusUpdateAPI } from "api/rateApi";
import { GetRatesByPlaceIdAPI } from "api/rateApi";
import { BlackoutDayRatesAPI } from "api/rateApi";
import { getCalenderDataAPI } from "api/rateApi";
import { deleteAssignRateAPI } from "api/rateApi";
import { getAssignRatesAPI } from "api/rateApi";
import { getAssignRatesTableDataAPI } from "api/rateApi"
import { SpecialEventRatesAPI } from "api/rateApi";
import { AssignRatesAPI } from "api/rateApi";
import { DeleteRateAPI } from "api/rateApi";
import { CreateRateAPI } from "api/rateApi";
import { getRatesAPI } from "api/rateApi";

const initialState = {
  allRates: [],
  ratesByPlace: [],
  assignRates: [],
  calendarAssignRates: [],
  loading: false,
};

export const createRate = createAsyncThunk(
  "rates/createRates",
  async (data) => {
    try {
      const response = await CreateRateAPI(data);
      return response.data;
    } catch (err) {
      console.log("postLogin error ======>", err);
      return err;
    }
  }
);

export const getAllRates = createAsyncThunk("rates/getRates", async (data) => {
  try {
    const response = await getRatesAPI(data);
    return response.data;
  } catch (err) {
    console.log("get rates error ======>", err);
  }
});

export const getRatesByPlaceId = createAsyncThunk(
  "rates/getRatesByPlaceId",
  async (data) => {
    try {
      const response = await GetRatesByPlaceIdAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get rate error error ======>", err);
      return err;
    }
  }
);

export const deleteRate = createAsyncThunk("rates/deleteRate", async (data) => {
  try {
    const response = await DeleteRateAPI(data);
    return response.data;
  } catch (err) {
    console.log("Delete error ======>", err);
    return err;
  }
});
export const rateStatusUpdate = createAsyncThunk(
  "rates/statusUpdate",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await StatusUpdateAPI(data);
      return response.data;
    } catch (err) {
      console.log("Status update error ======>", err);
      return err;
    }
  }
);

export const assignRates = createAsyncThunk(
  "rates/assignRates",
  async (data) => {
    try {
      const response = await AssignRatesAPI(data);
      return response.data;
    } catch (err) {
      console.log("assign rate error error ======>", err);
      return err;
    }
  }
);

export const getAssignRatesByPlaceId = createAsyncThunk(
  "rates/getAssignRates",
  async (data) => {
    try {
      const response = await getAssignRatesAPI(data);
      return response.data;
    } catch (err) {
      console.log("get rates error ======>", err);
    }
  }
);

export const getAssignRatesTableDataByPlaceId = createAsyncThunk(
  "assign/getRates",
  async (data) => {
    try {
      const response = await getAssignRatesTableDataAPI(data);
      return response.data;
    } catch (err) {
      console.log("get rates error ======>", err);
    }
  }
);

export const getCalenderDataByPlaceId = createAsyncThunk(
  "rates/getCalenderData",
  async (data) => {
    try {
      const response = await getCalenderDataAPI(data);
      return response.data;
    } catch (err) {
      console.log("get rates error ======>", err);
    }
  }
);

export const specialEventRates = createAsyncThunk(
  "rates/specialEventRates",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await SpecialEventRatesAPI(data);
      return response.data;
    } catch (err) {
      console.log("assign rate error error ======>", err);
      return err;
    }
  }
);

export const blackoutDayRates = createAsyncThunk(
  "rates/blackoutDayRates",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await BlackoutDayRatesAPI(data);
      return response.data;
    } catch (err) {
      console.log("assign rate error error ======>", err);
      return err;
    }
  }
);

export const deleteAssignRate = createAsyncThunk(
  "rates/deleteAssignRate",
  async (assignRateData, { rejectWithValue }) => {
    try {
      const response = await deleteAssignRateAPI(assignRateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rateSlice = createSlice({
  name: "rates",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getAllRates.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllRates.fulfilled, (state, { payload }) => {
        state.allRates = payload.rates;
        state.loading = false;
      })
      .addCase(getAllRates.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getRatesByPlaceId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRatesByPlaceId.fulfilled, (state, { payload }) => {
        state.ratesByPlace = payload.rates;
        state.loading = false;
      })
      .addCase(getRatesByPlaceId.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getAssignRatesTableDataByPlaceId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAssignRatesTableDataByPlaceId.fulfilled, (state, { payload }) => {
        state.assignRates = payload.assignRates;
        state.loading = false;
      })
      .addCase(getAssignRatesTableDataByPlaceId.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getCalenderDataByPlaceId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCalenderDataByPlaceId.fulfilled, (state, { payload }) => {
        state.calendarAssignRates = payload.assignRates;
        state.loading = false;
      })
      .addCase(getCalenderDataByPlaceId.rejected, (state) => {
        state.loading = false;
      }),
});

export default rateSlice.reducer;
