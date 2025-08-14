import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAllAutomatedReportsAPI } from "api/automatedReportsApi";
import { deleteAutomatedReportAPI } from "api/automatedReportsApi";
import { getAutomatedReportsAPI } from "api/automatedReportsApi";
import { createAutomatedReportAPI } from "api/automatedReportsApi";


const initialState = {
  creatingAutomatedReport: false,
  automatedReportCreated: false,
  error: null,
};

export const createAutomatedReport = createAsyncThunk(
  "automatedReport/createAutomatedReport",
  async (automatedReportData, { rejectWithValue }) => {
    try {
      const response = await createAutomatedReportAPI(automatedReportData);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.message); 
    }
  }
);

export const getAutomatedReports = createAsyncThunk(
  "automatedReport/getAutomatedReports",
  async (automatedReportData, { rejectWithValue }) => {
    try {
      const response = await getAutomatedReportsAPI(automatedReportData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getAllAutomatedReports = createAsyncThunk(
  "automatedReport/getAllAutomatedReports",
  async (automatedReportData, { rejectWithValue }) => {
    try {
      const response = await getAllAutomatedReportsAPI(automatedReportData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAutomatedReport = createAsyncThunk(
  "automatedReport/deleteAutomatedReport",
  async (automatedReportData, { rejectWithValue }) => {
    try {
      const response = await deleteAutomatedReportAPI(automatedReportData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const automatedReportSlice = createSlice({
  name: "automatedReports",
  initialState,
  reducers: {
    resetBrandState: (state) => {
      state.creatingAutomatedReport = false;
      state.automatedReportCreated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAutomatedReport.pending, (state) => {
        state.creatingAutomatedReport = true;
        state.automatedReportCreated = false;
        state.error = null;
      })
      .addCase(createAutomatedReport.fulfilled, (state) => {
        state.creatingAutomatedReport = false;
        state.automatedReportCreated = true;
        state.error = null;
      })
      .addCase(createAutomatedReport.rejected, (state, action) => {
        state.creatingAutomatedReport = false;
        state.automatedReportCreated = false;
        state.error = action.payload; 
      });
  },
});

export const { resetBrandState } = automatedReportSlice.actions;
export default automatedReportSlice.reducer;
