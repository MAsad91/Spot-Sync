import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { updateDiscordAPI } from "api/discordApi";
import { DeleteDiscordAPI } from "api/discordApi";
import { GetDiscordAPI } from "api/discordApi";
import { CreateDiscordAPI } from "api/discordApi";

const initialState = {
  discords: [],
  loading: false,
  placeId: ""
};

export const createDiscord = createAsyncThunk(
  "discord/createDiscords",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await CreateDiscordAPI(data);
      return response.data;
    } catch (err) {
      console.log("postDiscord error ======>", err);
      return err;
    }
  }
);

export const getDiscord = createAsyncThunk(
  "discord/getDiscords",
  async (placeId, { rejectWithValue }) => {
    try {
      const response = await GetDiscordAPI(placeId);
      return response.data;
    } catch (error) {
      console.log("get discord error ======>", error);
      return rejectWithValue(error.message); 
    }
  }
);

export const deleteDiscord = createAsyncThunk(
  "discord/deleteDiscord",
  async (data) => {
    try {
      const response = await DeleteDiscordAPI(data);
      return response.data;
    } catch (err) {
      console.log("Delete error ======>", err);
      return err;
    }
  }
);

export const updateDiscord = createAsyncThunk(
  "discord/updateDiscord",
  async (updateDiscordData, { rejectWithValue }) => {
    console.log(updateDiscordData, "<<update discord data")
    try {
      const response = await updateDiscordAPI(updateDiscordData);
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.message); 
    }
  }
);

export const discordSlice = createSlice({
  name: "discords",
  initialState,
  reducers: {
    setDiscords: (state, action) => {
      state.discords = action.payload;
    },
    setPlaceIdForDiscords: (state, action) => {
      state.placeId = action.payload;
    }
  },
  extraReducers: (builder) =>
    builder
      .addCase(getDiscord.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDiscord.fulfilled, (state, { payload }) => {
        state.discords = payload.data;
        state.loading = false;
      })
      .addCase(getDiscord.rejected, (state) => {
        state.loading = false;
      }),
});

export const { setDiscords, setPlaceIdForDiscords } = discordSlice.actions;
export default discordSlice.reducer;
