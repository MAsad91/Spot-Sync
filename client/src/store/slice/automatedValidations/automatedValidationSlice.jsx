import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { deleteAutomatedValidationAPI } from "api/automatedValidationsApi";
import { getAutomatedValidationsAPI } from "api/automatedValidationsApi";
import { createAutomatedValidationAPI } from "api/automatedValidationsApi";
// import { deleteAutomatedValidationAPI } from "api/automatedValidationsApi";

const initialState = {
  creatingAutomatedValidation: false,
  automatedValidationCreated: false,
  error: null,
};

export const createAutomatedValidation = createAsyncThunk(
  "automatedValidation/createAutomatedValidation",
  async (automatedValidationData, { rejectWithValue }) => {
    try {
      const response = await createAutomatedValidationAPI(
        automatedValidationData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAutomatedValidations = createAsyncThunk(
  "automatedValidation/getAutomatedValidations",
  async (automatedValidationData, { rejectWithValue }) => {
    try {
      const response = await getAutomatedValidationsAPI(
        automatedValidationData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAutomatedValidation = createAsyncThunk(
  "automatedValidation/deleteAutomatedValidation",
  async (automatedValidationData, { rejectWithValue }) => {
    try {
      const response = await deleteAutomatedValidationAPI(
        automatedValidationData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const automatedValidationSlice = createSlice({
  name: "automatedValidations",
  initialState,
  reducers: {
    resetBrandState: (state) => {
      state.creatingAutomatedValidation = false;
      state.automatedValidationCreated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAutomatedValidation.pending, (state) => {
        state.creatingAutomatedValidation = true;
        state.automatedValidationCreated = false;
        state.error = null;
      })
      .addCase(createAutomatedValidation.fulfilled, (state) => {
        state.creatingAutomatedValidation = false;
        state.automatedValidationCreated = true;
        state.error = null;
      })
      .addCase(createAutomatedValidation.rejected, (state, action) => {
        state.creatingAutomatedValidation = false;
        state.automatedValidationCreated = false;
        state.error = action.payload;
      });
  },
});

export const { resetBrandState } = automatedValidationSlice.actions;
export default automatedValidationSlice.reducer;
