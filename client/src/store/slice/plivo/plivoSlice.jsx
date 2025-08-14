import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPlivosAPI } from "api/plivoAPI";

const initialState = {
  plivos: [],
  loading: false,
};

export const getPlivos = createAsyncThunk("plivos/getPlivos", async (data) => {
  try {
    const response = await getPlivosAPI(data);
    return response.data;
  } catch (err) {
    console.log("get plivos error ======>", err);
  }
});



export const plivoSlice = createSlice({
  name: "rates",
  initialState,
  reducers: {
    setPlivos: (state, action) => {
      console.log("YOYO, setPlivos", action.payload);
      state.plivos = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(getPlivos.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPlivos.fulfilled, (state, { payload }) => {
        state.plivos = payload.data;
        state.loading = false;
      })
      .addCase(getPlivos.rejected, (state) => {
        state.loading = false;
      }),
});

export const { setPlivos } =
  plivoSlice.actions;
export default plivoSlice.reducer;
