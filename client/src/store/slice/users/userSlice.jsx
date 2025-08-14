import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DeleteUserAPI } from "api/userApi";
import { GetMeInfo } from "api/userApi";
import { StatusUpdateAPI } from "api/userApi";
import { PasswordResetAPI } from "api/userApi";
import { CreateUserAPI } from "api/userApi";
import { UpdateUserAPI } from "api/userApi";
import { GetAllUserAPI } from "api/userApi";
import { GetExportUserAPI } from "api/userApi";
import { get } from "lodash";

const initialState = {
  users: [],
  meInfo: [],
  loading: false,
};

export const getExportUsers = createAsyncThunk("users/getUsers", async (data) => {
  try {
    const response = await GetExportUserAPI(data);
    return response.data;
  } catch (err) {
    console.log("get users error ======>", err);
  }
});

export const getUsers = createAsyncThunk("users/getUsers", async (data) => {
  try {
    const response = await GetAllUserAPI(data);
    return response.data;
  } catch (err) {
    console.log("get users error ======>", err);
  }
});

export const createUsers = createAsyncThunk(
  "users/createUsers",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await CreateUserAPI(data);
      return response.data;
    } catch (err) {
      console.log("postCreate error ======>", err);
      return err;
    }
  }
);
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await UpdateUserAPI(data);
      return response.data;
    } catch (err) {
      console.log("postCreate error ======>", err);
      return err;
    }
  }
);
export const passwordReset = createAsyncThunk(
  "users/passwordReset",
  async (data) => {
    console.log(data, "<==data");
    try {
      const response = await PasswordResetAPI(data);
      return response.data;
    } catch (err) {
      console.log("Password reset error ======>", err);
      return err;
    }
  }
);
export const deleteUser = createAsyncThunk("users/deleteUser", async (data) => {
  console.log(data, "<==data");
  try {
    const response = await DeleteUserAPI(data);
    return response.data;
  } catch (err) {
    console.log("Delete error ======>", err);
    return err;
  }
});
export const userStatusUpdate = createAsyncThunk(
  "users/statusUpdate",
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

export const getMeInfo = createAsyncThunk(
  "auth/getMeInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await GetMeInfo();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUsers.fulfilled, (state, { payload }) => {
        state.users = payload.users;
        state.loading = false;
      })
      .addCase(getUsers.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getMeInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMeInfo.fulfilled, (state, { payload }) => {
        state.meInfo = get(payload, "data", []);
        state.loading = false;
      })
      .addCase(getMeInfo.rejected, (state) => {
        state.loading = false;
      }),
});
export const getMeData = (state) => state.auth.meInfo;
export default userSlice.reducer;
