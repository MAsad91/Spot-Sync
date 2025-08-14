import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { updateSlackAPI } from "api/slackAPI";
import { DeleteSlackAPI } from "api/slackAPI";
import { GetSlackAPI } from "api/slackAPI";
import { CreateSlackAPI } from "api/slackAPI";

const initialState = {
  slacks: [],
  loading: false,
  placeId: ""
};

export const createSlack = createAsyncThunk(
  "slack/createSlacks",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await CreateSlackAPI(data);
      return response.data;
    } catch (err) {
      console.log("postSlack error ======>", err);
      return err;
    }
  }
);

export const getSlack = createAsyncThunk(
  "slack/getSlacks",
  async (placeId, { rejectWithValue }) => {
    try {
      const response = await GetSlackAPI(placeId);
      return response.data;
    } catch (error) {
      console.log("get slack error ======>", error);
      return rejectWithValue(error.message); 
    }
  }
);

export const deleteSlack = createAsyncThunk(
  "slack/deleteSlack",
  async (data) => {
    try {
      const response = await DeleteSlackAPI(data);
      return response.data;
    } catch (err) {
      console.log("Delete error ======>", err);
      return err;
    }
  }
);

export const updateSlack = createAsyncThunk(
  "slack/updateSlack",
  async (updateSlackData, { rejectWithValue }) => {
    console.log(updateSlackData, "<<update slack data")
    try {
      const response = await updateSlackAPI(updateSlackData);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.message); 
    }
  }
);

export const slackSlice = createSlice({
  name: "slacks",
  initialState,
  reducers: {
    setSlacks: (state, action) => {
      state.slacks = action.payload;
    },
    setPlaceIdForSlacks: (state, action) => {
      state.placeId = action.payload;
    }
  },
  extraReducers: (builder) =>
    builder
      .addCase(getSlack.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSlack.fulfilled, (state, { payload }) => {
        state.slacks = payload.data;
        state.loading = false;
      })
      .addCase(getSlack.rejected, (state) => {
        state.loading = false;
      }),
});

export const { setSlacks, setPlaceIdForSlacks } = slackSlice.actions;
export default slackSlice.reducer;
