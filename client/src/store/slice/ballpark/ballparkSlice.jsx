import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GetBallparkLocationsAPI } from "api/ballpark";

const initialState = {
  locations: [],
  loading: false,
};

export const getBallparkLocations = createAsyncThunk(
  "ballpark/getLocations",
  async (data) => {
    try {
      const response = await GetBallparkLocationsAPI(data);
      return response.data;
    } catch (err) {
      console.log("get loc error ======>", err);
      return err;
    }
  }
);

export const ballparkSlice = createSlice({
  name: "ballpark",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getBallparkLocations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBallparkLocations.fulfilled, (state, { payload }) => {
        state.locations = payload.data;
        state.loading = false;
      })
      .addCase(getBallparkLocations.rejected, (state) => {
        state.loading = false;
      }),
});

export default ballparkSlice.reducer;
