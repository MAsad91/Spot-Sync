import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CreatePermitsOptionAPI } from "api/permitsOptionsAPI";
import { GetPermitsOptionsAPI } from "api/permitsOptionsAPI";
import { UpdatePermitsOptionAPI } from "api/permitsOptionsAPI";
import { get } from "lodash";

const initialState = {
  permitsOptions: [],
  loading: false,
};

export const createPermitsOption = createAsyncThunk(
  "permitsOptions/create",
  async (data) => {
    try {
      const response = await CreatePermitsOptionAPI(data);
      return response.data;
    } catch (err) {
      console.log("Permits Option error ======>", err);
      return err;
    }
  }
);

export const getPermitsOptions = createAsyncThunk(
  "permitsOptions/getPermitsOptions",
  async (data) => {
    try {
      const response = await GetPermitsOptionsAPI(data);
      return response.data;
    } catch (err) {
      console.log("Get Permits error ======>", err);
      return err;
    }
  }
);

export const updatePermitsOption = createAsyncThunk(
  "permitsOptions/update",
  async (data) => {
    try {
      const response = await UpdatePermitsOptionAPI(data);
      return response.data;
    } catch (err) {
      console.log("update Permit error ======>", err);
    }
  }
);

export const permitsOptionSlice = createSlice({
  name: "permit",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPermitsOption.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPermitsOption.fulfilled, (state, action) => {
        state.permitsOptions = get(action.payload, "success", false)
          ? [action.payload.permitsOption, ...state.permitsOptions]
          : state.permitsOptions;
        state.loading = false;
      })
      .addCase(createPermitsOption.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updatePermitsOption.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePermitsOption.fulfilled, (state, action) => {
        if (get(action.payload, "success", false)) {
          const updatedPermitsOption = action.payload.permitsOption;
          const index = state.permitsOptions.findIndex(
            (p) => p._id === updatedPermitsOption._id
          );
          if (index !== -1) {
            state.permitsOptions[index] = updatedPermitsOption;
          }
        }
        state.loading = false;
      })
      .addCase(updatePermitsOption.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getPermitsOptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPermitsOptions.fulfilled, (state, action) => {
        state.permitsOptions = get(action.payload, "success", false)
          ? action.payload.permitsOptions
          : [];
        state.loading = false;
      })
      .addCase(getPermitsOptions.rejected, (state) => {
        state.loading = false;
      })
  },
});

export default permitsOptionSlice.reducer;
