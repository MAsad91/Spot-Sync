import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPlaceAPI } from "api/placeApi";
import { createPlaceAPI } from "api/placeApi";
import { updatePlaceAPI } from "api/placeApi";
import { assignSettingAPI } from "api/placeApi";
import { getPlaceByIdAPI } from "api/placeApi";
import { DeletePlaceAPI } from "api/placeApi";
import { get } from "lodash";

const initialState = {
  creatingPlace: false,
  placeCreated: false,
  error: null,
  placeData: [],
  selectedPlace: {},
  multiSelectedPlaces: [],
  placesList: [],
  singlePlace: {},
  totalPlaces: 0,
  loading: false,
};

export const createPlace = createAsyncThunk(
  "place/createPlace",
  async (placeData, { rejectWithValue }) => {
    try {
      const response = await createPlaceAPI(placeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPlaces = createAsyncThunk(
  "place/getPlaces",
  async (data, { rejectWithValue }) => {
    try {
      const response = await getPlaceAPI();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPlaceById = createAsyncThunk(
  "place/getPlaceByIdAPI",
  async (placeId, { rejectWithValue }) => {
    try {
      const response = await getPlaceByIdAPI(placeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const assignSetting = createAsyncThunk(
  "place/assignSetting",
  async (updatePlaceData, { rejectWithValue }) => {
    console.log(updatePlaceData, "<<update place data");
    try {
      const response = await assignSettingAPI(updatePlaceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePlace = createAsyncThunk(
  "place/updatePlace",
  async (updatePlaceData, { rejectWithValue }) => {
    console.log(updatePlaceData, "<<update place data");
    try {
      const response = await updatePlaceAPI(updatePlaceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePlace = createAsyncThunk(
  "place/deletePlace",
  async (data) => {
    try {
      const response = await DeletePlaceAPI(data);
      return response.data;
    } catch (err) {
      console.log("Delete error ======>", err);
      return err;
    }
  }
);

const placeSlice = createSlice({
  name: "place",
  initialState,
  reducers: {
    resetPlaceState: (state) => {
      state.creatingPlace = false;
      state.placeCreated = false;
      state.error = null;
    },
    setPlaceData: (state, action) => {
      state.placeData = action.payload;
    },
    setSelectedPlace: (state, action) => {
      state.selectedPlace = action.payload;
    },
    setMultiSelectedPlaces: (state, action) => {
      state.multiSelectedPlaces = action.payload;
    },
    setSinglePlace: (state, action) => {
      state.singlePlace = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPlace.pending, (state) => {
        state.creatingPlace = true;
        state.placeCreated = false;
        state.error = null;
      })
      .addCase(createPlace.fulfilled, (state) => {
        state.creatingPlace = false;
        state.placeCreated = true;
        state.error = null;
      })
      .addCase(createPlace.rejected, (state, action) => {
        state.creatingPlace = false;
        state.placeCreated = false;
        state.error = action.payload;
      })
      .addCase(getPlaces.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPlaces.fulfilled, (state, { payload }) => {
        state.placesList = get(payload, "places", []);
        state.placeData = get(payload, "places", []);
        state.totalPlaces = get(payload, "total", 0);
        state.loading = false;
      })
      .addCase(getPlaces.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const { resetPlaceState, setPlaceData, setSelectedPlace, setMultiSelectedPlaces, setSinglePlace } =
  placeSlice.actions;
export default placeSlice.reducer;
